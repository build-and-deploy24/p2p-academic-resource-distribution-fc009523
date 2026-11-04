import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import {
  buildStorageKey,
  contentTypeForStorageKey,
  readStoredFile,
} from '../src/utils/file-storage.js';

describe('contentTypeForStorageKey', () => {
  test('maps known extensions to their content types', () => {
    assert.equal(contentTypeForStorageKey('notes.pdf'), 'application/pdf');
    assert.equal(contentTypeForStorageKey('notes.txt'), 'text/plain');
    assert.equal(
      contentTypeForStorageKey('notes.docx'),
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    assert.equal(
      contentTypeForStorageKey('notes.pptx'),
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    );
  });

  test('is case-insensitive and falls back to a generic binary type', () => {
    assert.equal(contentTypeForStorageKey('NOTES.PDF'), 'application/pdf');
    assert.equal(
      contentTypeForStorageKey('archive.zip'),
      'application/octet-stream',
    );
  });
});

describe('readStoredFile', () => {
  test('reads a stored placeholder file', async () => {
    const bytes = await readStoredFile('lecture-1-introduction.pdf');

    // Every committed storage file must be a real PDF for the demo data.
    assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
  });

  test('rejects unsafe storage keys', async () => {
    const unsafeKeys = [
      '',
      '../secrets.txt',
      'sub/dir.pdf',
      'sub\\dir.pdf',
      'C:\\Windows\\win.ini',
      'quote".pdf',
    ];

    for (const key of unsafeKeys) {
      await assert.rejects(
        () => readStoredFile(key),
        /Unsafe storage key rejected|Storage key resolved outside/,
        `expected ${JSON.stringify(key)} to be rejected`,
      );
    }
  });

  test('surfaces a missing file as a rejection for the route to report', async () => {
    await assert.rejects(
      () => readStoredFile('not-in-storage.pdf'),
      (error: NodeJS.ErrnoException) => error.code === 'ENOENT',
    );
  });
});

describe('buildStorageKey', () => {
  test('builds a slugged key with a random suffix and the original extension', () => {
    const key = buildStorageKey('Lecture 9 - Testing.pdf');

    assert.match(key, /^lecture-9-testing-[0-9a-f]{12}\.pdf$/);
  });

  test('never reuses a key for the same file name', () => {
    assert.notEqual(
      buildStorageKey('notes.pdf'),
      buildStorageKey('notes.pdf'),
    );
  });

  test('strips directory components from a hostile file name', () => {
    for (const name of [
      '../../etc/passwd.pdf',
      'C:\\Windows\\win.ini.pdf',
      '/etc/shadow.pdf',
    ]) {
      const key = buildStorageKey(name);
      assert.doesNotMatch(key, /[\\/]/);
      assert.doesNotMatch(key, /\.\./);
      assert.match(key, /\.pdf$/);
      assert.equal(path.basename(key), key);
    }
  });

  test('rejects extensions outside the allowlist', () => {
    for (const name of ['installer.exe', 'archive.zip', 'noextension']) {
      assert.throws(() => buildStorageKey(name), /Unsupported file extension/);
    }
  });

  test('limits the slug length but keeps the extension', () => {
    const key = buildStorageKey(`${'a'.repeat(120)}.pdf`);
    const suffix = key.match(/-[0-9a-f]{12}\.pdf$/)?.[0];

    assert.ok(suffix, `unexpected storage key shape: ${key}`);
    assert.equal(key.length - suffix.length, 40);
  });
});

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
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

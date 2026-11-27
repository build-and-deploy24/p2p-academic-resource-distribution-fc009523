import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import type { FastifyInstance } from 'fastify';

// Point storage at a throwaway directory before importing the app, so uploads
// never touch backend/storage and every assertion about "nothing was stored"
// is exact. FILE_STORAGE_DIR is read when the storage module is first loaded.
const storageDir = await mkdtemp(path.join(os.tmpdir(), 'p2p-upload-storage-'));
process.env.FILE_STORAGE_DIR = storageDir;
process.env.ADMIN_UPLOAD_TOKEN = 'test-upload-token';

const { createTestApp, buildMultipartBody, multipartHeaders } = await import(
  './helpers.js'
);
const { readStoredFile } = await import('../src/utils/file-storage.js');

const TEST_TOKEN = 'test-upload-token';
const BOUNDARY = '----p2pTestBoundary9d41';
const UPLOAD_URL = '/api/units/unit-1/files';
const PDF_BYTES = Buffer.from('%PDF-1.4\n% upload fixture\n');

describe('POST /api/units/:unitId/files', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
    delete process.env.ADMIN_UPLOAD_TOKEN;
    await rm(storageDir, { recursive: true, force: true });
  });

  test('rejects an upload without a token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: UPLOAD_URL,
      headers: multipartHeaders(BOUNDARY),
      payload: buildMultipartBody({
        boundary: BOUNDARY,
        files: [
          {
            filename: 'notes.pdf',
            contentType: 'application/pdf',
            content: PDF_BYTES,
          },
        ],
      }),
    });

    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.json(), {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'A valid upload token is required.',
      },
    });
    assert.deepEqual(await readdir(storageDir), []);
  });

  test('rejects an upload with a wrong token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: UPLOAD_URL,
      headers: multipartHeaders(BOUNDARY, 'not-the-token'),
      payload: buildMultipartBody({
        boundary: BOUNDARY,
        files: [
          {
            filename: 'notes.pdf',
            contentType: 'application/pdf',
            content: PDF_BYTES,
          },
        ],
      }),
    });

    assert.equal(response.statusCode, 401);
    assert.equal(response.json().error.code, 'UNAUTHORIZED');
    assert.deepEqual(await readdir(storageDir), []);
  });

  test('returns 404 for an unknown unit', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/units/does-not-exist/files',
      headers: multipartHeaders(BOUNDARY, TEST_TOKEN),
      payload: buildMultipartBody({
        boundary: BOUNDARY,
        files: [
          {
            filename: 'notes.pdf',
            contentType: 'application/pdf',
            content: PDF_BYTES,
          },
        ],
      }),
    });

    assert.equal(response.statusCode, 404);
    assert.equal(response.json().error.code, 'UNIT_NOT_FOUND');
    assert.deepEqual(await readdir(storageDir), []);
  });

  test('rejects an unsupported file type without storing anything', async () => {
    const response = await app.inject({
      method: 'POST',
      url: UPLOAD_URL,
      headers: multipartHeaders(BOUNDARY, TEST_TOKEN),
      payload: buildMultipartBody({
        boundary: BOUNDARY,
        files: [
          {
            filename: 'payload.exe',
            contentType: 'application/octet-stream',
            content: Buffer.from('MZ fake executable'),
          },
        ],
      }),
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error.code, 'UNSUPPORTED_FILE_TYPE');
    assert.deepEqual(await readdir(storageDir), []);
  });

  test('rejects a multipart request that has no file part', async () => {
    const response = await app.inject({
      method: 'POST',
      url: UPLOAD_URL,
      headers: multipartHeaders(BOUNDARY, TEST_TOKEN),
      payload: buildMultipartBody({
        boundary: BOUNDARY,
        fields: { title: 'No file here' },
      }),
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error.code, 'MISSING_FILE');
    assert.deepEqual(await readdir(storageDir), []);
  });

  test('stores the bytes, registers metadata and lists the new file', async () => {
    const response = await app.inject({
      method: 'POST',
      url: UPLOAD_URL,
      headers: multipartHeaders(BOUNDARY, TEST_TOKEN),
      payload: buildMultipartBody({
        boundary: BOUNDARY,
        fields: { title: 'Lecture 9 - Testing' },
        files: [
          {
            filename: 'Lecture 9 - Testing.pdf',
            contentType: 'application/pdf',
            content: PDF_BYTES,
          },
        ],
      }),
    });

    assert.equal(response.statusCode, 201);

    const created = response.json().data;
    assert.equal(created.title, 'Lecture 9 - Testing');
    assert.equal(created.fileType, 'pdf');
    assert.equal(created.sizeBytes, PDF_BYTES.length);
    assert.equal(created.unitId, 'unit-1');
    assert.match(created.id, /^[0-9a-f-]{36}$/);

    // The client file name must never be used verbatim as the storage key.
    assert.notEqual(created.storageKey, 'Lecture 9 - Testing.pdf');
    assert.match(created.storageKey, /^lecture-9-testing-[0-9a-f]{12}\.pdf$/);

    // Stored bytes must be byte-identical to what was uploaded.
    assert.deepEqual(await readStoredFile(created.storageKey), PDF_BYTES);

    // The new resource must be visible through the catalog listing.
    const listing = await app.inject({
      method: 'GET',
      url: '/api/units/unit-1/files',
    });
    const ids = listing.json().data.map((file: { id: string }) => file.id);
    assert.ok(ids.includes(created.id));

    // ...and downloadable through the public download route.
    const download = await app.inject({
      method: 'GET',
      url: `/api/files/${created.id}/download`,
    });
    assert.equal(download.statusCode, 200);
    assert.deepEqual(download.rawPayload, PDF_BYTES);
  });

  test('derives a readable title when none is supplied', async () => {
    const response = await app.inject({
      method: 'POST',
      url: UPLOAD_URL,
      headers: multipartHeaders(BOUNDARY, TEST_TOKEN),
      payload: buildMultipartBody({
        boundary: BOUNDARY,
        files: [
          {
            filename: 'week_3-revision-notes.pdf',
            contentType: 'application/pdf',
            content: PDF_BYTES,
          },
        ],
      }),
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.json().data.title, 'week 3 revision notes');
  });
});

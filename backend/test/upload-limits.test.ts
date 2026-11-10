import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import type { FastifyInstance } from 'fastify';

// A deliberately tiny limit keeps the oversized-upload case cheap to test.
const MAX_UPLOAD_BYTES = 1024;
const BOUNDARY = '----p2pLimitBoundary7c02';

const storageDir = await mkdtemp(path.join(os.tmpdir(), 'p2p-limit-storage-'));
process.env.FILE_STORAGE_DIR = storageDir;
process.env.ADMIN_UPLOAD_TOKEN = 'limit-test-token';
process.env.MAX_UPLOAD_BYTES = String(MAX_UPLOAD_BYTES);

const { createTestApp, buildMultipartBody, multipartHeaders } = await import(
  './helpers.js'
);
const { deleteStoredFile } = await import('../src/utils/file-storage.js');

describe('upload size limit', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
    delete process.env.ADMIN_UPLOAD_TOKEN;
    delete process.env.MAX_UPLOAD_BYTES;
    await rm(storageDir, { recursive: true, force: true });
  });

  test('rejects a file larger than the configured limit and stores nothing', async () => {
    const oversized = Buffer.alloc(MAX_UPLOAD_BYTES * 4, 'x');

    const response = await app.inject({
      method: 'POST',
      url: '/api/units/unit-1/files',
      headers: multipartHeaders(BOUNDARY, 'limit-test-token'),
      payload: buildMultipartBody({
        boundary: BOUNDARY,
        files: [
          {
            filename: 'too-big.pdf',
            contentType: 'application/pdf',
            content: oversized,
          },
        ],
      }),
    });

    assert.equal(response.statusCode, 413);
    assert.equal(response.json().error.code, 'FILE_TOO_LARGE');

    // The partial upload must be deleted, not left behind in storage.
    assert.deepEqual(await readdir(storageDir), []);
  });

  test('accepts a file within the configured limit', async () => {
    const accepted = Buffer.from('%PDF-1.4\n% small\n');

    const response = await app.inject({
      method: 'POST',
      url: '/api/units/unit-1/files',
      headers: multipartHeaders(BOUNDARY, 'limit-test-token'),
      payload: buildMultipartBody({
        boundary: BOUNDARY,
        files: [
          {
            filename: 'small.pdf',
            contentType: 'application/pdf',
            content: accepted,
          },
        ],
      }),
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.json().data.sizeBytes, accepted.length);

    await deleteStoredFile(response.json().data.storageKey);
    assert.deepEqual(await readdir(storageDir), []);
  });
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from './helpers.js';

describe('GET /api/files/:fileId/download', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
  });

  test('serves the authoritative bytes with download headers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/files/file-1/download',
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['content-type'], 'application/pdf');
    assert.equal(
      response.headers['content-disposition'],
      'attachment; filename="lecture-1-introduction.pdf"',
    );
    assert.equal(response.headers['x-content-type-options'], 'nosniff');

    // Integrity check: the response must be byte-identical to the stored file.
    const stored = await readFile(
      path.resolve(import.meta.dirname, '..', 'storage', 'lecture-1-introduction.pdf'),
    );
    assert.deepEqual(response.rawPayload, stored);
    assert.equal(response.headers['content-length'], String(stored.length));
  });

  test('returns 404 with the standard envelope for an unknown file id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/files/does-not-exist/download',
    });

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {
      success: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: 'The requested file was not found.',
      },
    });
  });
});

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import type { FastifyInstance } from 'fastify';

const BOUNDARY = '----p2pDisabledBoundary51aa';

// No ADMIN_UPLOAD_TOKEN: the upload route must fail closed.
delete process.env.ADMIN_UPLOAD_TOKEN;

const { createTestApp, buildMultipartBody, multipartHeaders } = await import(
  './helpers.js'
);

describe('upload endpoint without a configured token', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
  });

  test('refuses uploads when ADMIN_UPLOAD_TOKEN is not set', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/units/unit-1/files',
      headers: multipartHeaders(BOUNDARY, 'any-token-at-all'),
      payload: buildMultipartBody({
        boundary: BOUNDARY,
        files: [
          {
            filename: 'notes.pdf',
            contentType: 'application/pdf',
            content: Buffer.from('%PDF-1.4\n'),
          },
        ],
      }),
    });

    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.json(), {
      success: false,
      error: {
        code: 'UPLOAD_NOT_CONFIGURED',
        message: 'This server does not accept uploads.',
      },
    });
  });
});

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from './helpers.js';

describe('academic catalog endpoints', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
  });

  test('GET /api/semesters lists semesters in the success envelope', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/semesters' });
    const body = response.json();

    assert.equal(response.statusCode, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);

    for (const semester of body.data) {
      assert.equal(typeof semester.id, 'string');
      assert.equal(typeof semester.name, 'string');
    }
  });

  test('GET /api/semesters/:semesterId/units returns the units of a semester', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/semesters/semester-1/units',
    });
    const body = response.json();

    assert.equal(response.statusCode, 200);
    assert.equal(body.success, true);
    assert.ok(body.data.length > 0);

    for (const unit of body.data) {
      assert.equal(unit.semesterId, 'semester-1');
    }
  });

  test('GET /api/semesters/:semesterId/units returns 404 for an unknown semester', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/semesters/does-not-exist/units',
    });

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {
      success: false,
      error: {
        code: 'SEMESTER_NOT_FOUND',
        message: 'The requested semester was not found.',
      },
    });
  });

  test('GET /api/units/:unitId/files returns file metadata for a known unit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/units/unit-1/files',
    });
    const body = response.json();

    assert.equal(response.statusCode, 200);
    assert.equal(body.success, true);
    assert.ok(body.data.length > 0);

    for (const file of body.data) {
      assert.equal(file.unitId, 'unit-1');
      assert.equal(typeof file.id, 'string');
      assert.equal(typeof file.title, 'string');
      assert.equal(typeof file.fileType, 'string');
      assert.equal(typeof file.sizeBytes, 'number');
    }
  });

  test('GET /api/units/:unitId/files returns 404 for an unknown unit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/units/does-not-exist/files',
    });

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {
      success: false,
      error: {
        code: 'UNIT_NOT_FOUND',
        message: 'The requested unit was not found.',
      },
    });
  });

  test('unknown routes use the standard error envelope', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/nope' });

    assert.equal(response.statusCode, 404);
    assert.equal(response.json().success, false);
    assert.equal(response.json().error.code, 'ROUTE_NOT_FOUND');
  });
});

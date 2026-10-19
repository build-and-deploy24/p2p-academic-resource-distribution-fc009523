import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

/**
 * Build a ready-to-inject application instance with request logging disabled,
 * so tests exercise the real routes without opening a network port.
 */
export async function createTestApp(): Promise<FastifyInstance> {
  const app = buildApp({ logger: false });
  await app.ready();
  return app;
}

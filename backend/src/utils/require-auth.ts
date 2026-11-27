import type { FastifyReply, FastifyRequest } from 'fastify';
import { createApiError } from './api-error.js';
import { verifyToken } from './auth-token.js';

/**
 * Fastify preHandler: lets the request through only when it carries a valid
 * "Authorization: Bearer <token>" header.
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply | undefined> {
  const header = request.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token || !verifyToken(token)) {
    return reply
      .status(401)
      .send(createApiError('UNAUTHORIZED', 'Please log in to download files.'));
  }
  return undefined;
}
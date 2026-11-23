import { timingSafeEqual } from 'node:crypto';

/**
 * Whether uploads are enabled on this server. The token is read from the
 * environment when the check runs, so tests can change it per app instance and
 * deployments can rotate it without a code change. Uploads fail closed: with
 * no configured token, every upload is refused.
 */
export function isUploadConfigured(): boolean {
  return Boolean(process.env.ADMIN_UPLOAD_TOKEN);
}

/**
 * Compare a supplied upload token with the configured one in constant time.
 * Returns false for missing, non-string, or wrong-length values.
 */
export function isUploadTokenValid(supplied: unknown): boolean {
  const expected = process.env.ADMIN_UPLOAD_TOKEN;
  if (!expected || typeof supplied !== 'string') {
    return false;
  }

  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);

  if (suppliedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(suppliedBuffer, expectedBuffer);
}

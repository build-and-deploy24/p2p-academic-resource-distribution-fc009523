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

export interface MultipartFilePart {
  /** Form field name; defaults to "file". */
  fieldname?: string;
  filename: string;
  contentType: string;
  content: Buffer;
}

export interface MultipartBodyOptions {
  boundary: string;
  fields?: Record<string, string>;
  files?: MultipartFilePart[];
}

/**
 * Build a raw multipart/form-data body. Tests use this instead of a form-data
 * dependency so the exact bytes sent to the API stay visible and controlled.
 */
export function buildMultipartBody(options: MultipartBodyOptions): Buffer {
  const { boundary, fields = {}, files = [] } = options;
  const chunks: Buffer[] = [];
  const pushText = (text: string): void => {
    chunks.push(Buffer.from(text, 'utf8'));
  };

  for (const [name, value] of Object.entries(fields)) {
    pushText(`--${boundary}\r\n`);
    pushText(`content-disposition: form-data; name="${name}"\r\n\r\n`);
    pushText(`${value}\r\n`);
  }

  for (const file of files) {
    pushText(`--${boundary}\r\n`);
    pushText(
      `content-disposition: form-data; name="${file.fieldname ?? 'file'}"; filename="${file.filename}"\r\n`,
    );
    pushText(`content-type: ${file.contentType}\r\n\r\n`);
    chunks.push(file.content);
    pushText('\r\n');
  }

  pushText(`--${boundary}--\r\n`);
  return Buffer.concat(chunks);
}

/** Headers for a multipart upload, optionally carrying the upload token. */
export function multipartHeaders(
  boundary: string,
  token?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    'content-type': `multipart/form-data; boundary=${boundary}`,
  };

  if (token !== undefined) {
    headers['x-upload-token'] = token;
  }

  return headers;
}

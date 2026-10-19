import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import multipart from '@fastify/multipart';
import type { FastifyInstance } from 'fastify';
import { fileRepository } from '../repositories/files.js';
import { unitRepository } from '../repositories/units.js';
import { createApiError } from '../utils/api-error.js';
import { createApiSuccess } from '../utils/api-success.js';
import {
  buildStorageKey,
  createStoredFileWriteStream,
  deleteStoredFile,
  isAllowedUploadExtension,
} from '../utils/file-storage.js';
import {
  isUploadConfigured,
  isUploadTokenValid,
} from '../utils/upload-auth.js';

/** Default upload ceiling (25 MiB) when MAX_UPLOAD_BYTES is not configured. */
const DEFAULT_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const UPLOAD_TOKEN_HEADER = 'x-upload-token';

interface UploadFailure {
  statusCode: number;
  code: string;
  message: string;
}

/**
 * Turn a client file name into a readable default title, so an upload without
 * an explicit title still shows something sensible in the catalog.
 */
function titleFromFileName(fileName: string): string {
  const base = path.basename(fileName, path.extname(fileName));
  return base.replace(/[-_]+/g, ' ').trim() || 'Untitled resource';
}

function configuredMaxUploadBytes(): number {
  const configured = Number(process.env.MAX_UPLOAD_BYTES);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_UPLOAD_BYTES;
}

export async function uploadRoutes(app: FastifyInstance): Promise<void> {
  const maxUploadBytes = configuredMaxUploadBytes();

  // Registered here rather than globally: only this plugin needs multipart
  // handling. throwFileSizeLimit is disabled so the route can clean up the
  // partial file and answer with the standard error envelope itself.
  await app.register(multipart, {
    limits: {
      fileSize: maxUploadBytes,
      files: 1,
      fields: 5,
      parts: 6,
    },
    throwFileSizeLimit: false,
  });

  app.post<{ Params: { unitId: string } }>(
    '/api/units/:unitId/files',
    async (request, reply) => {
      // Uploads are an administrative action, so fail closed when the server
      // has no token configured and require it on every request.
      if (!isUploadConfigured()) {
        return reply
          .status(503)
          .send(
            createApiError(
              'UPLOAD_NOT_CONFIGURED',
              'This server does not accept uploads.',
            ),
          );
      }

      if (!isUploadTokenValid(request.headers[UPLOAD_TOKEN_HEADER])) {
        return reply
          .status(401)
          .send(
            createApiError(
              'UNAUTHORIZED',
              'A valid upload token is required.',
            ),
          );
      }

      const { unitId } = request.params;
      const unit = await unitRepository.findById(unitId);
      if (!unit) {
        return reply
          .status(404)
          .send(
            createApiError('UNIT_NOT_FOUND', 'The requested unit was not found.'),
          );
      }

      if (!request.isMultipart()) {
        return reply
          .status(400)
          .send(
            createApiError(
              'INVALID_UPLOAD',
              'Uploads must use multipart/form-data with a "file" part and an optional "title" field.',
            ),
          );
      }

      // A rejected part is recorded here and answered after the request body
      // has been drained, which keeps the connection healthy.
      let failure: UploadFailure | null = null;
      let stored: { storageKey: string; sizeBytes: number } | null = null;
      let title: string | null = null;
      let originalFileName = '';

      for await (const part of request.parts()) {
        if (part.type === 'field') {
          if (
            part.fieldname === 'title' &&
            typeof part.value === 'string' &&
            part.value.trim().length > 0
          ) {
            title = part.value.trim();
          }
          continue;
        }

        originalFileName = part.filename ?? '';

        const extension = path.extname(originalFileName).toLowerCase();
        if (!isAllowedUploadExtension(extension)) {
          // Drain the rejected part before continuing.
          part.file.resume();
          failure = {
            statusCode: 400,
            code: 'UNSUPPORTED_FILE_TYPE',
            message:
              'The uploaded file type is not accepted. Allowed types: pdf, txt, docx, pptx.',
          };
          continue;
        }

        if (stored || failure) {
          // Only one file per request; ignore extra parts but read them out.
          part.file.resume();
          continue;
        }

        const storageKey = buildStorageKey(originalFileName);
        let sizeBytes = 0;
        part.file.on('data', (chunk: Buffer) => {
          sizeBytes += chunk.length;
        });

        try {
          await pipeline(part.file, createStoredFileWriteStream(storageKey));
        } catch (error) {
          await deleteStoredFile(storageKey);
          request.log.error({ error }, 'upload write failed');
          failure = {
            statusCode: 500,
            code: 'FILE_STORAGE_ERROR',
            message: 'The uploaded file could not be stored on the server.',
          };
          continue;
        }

        if (part.file.truncated) {
          // The size limit was hit; remove the partial file rather than
          // leaving a corrupt resource in storage.
          await deleteStoredFile(storageKey);
          failure = {
            statusCode: 413,
            code: 'FILE_TOO_LARGE',
            message: `The uploaded file exceeds the ${maxUploadBytes} byte limit.`,
          };
          continue;
        }

        stored = { storageKey, sizeBytes };
      }

      if (failure) {
        return reply
          .status(failure.statusCode)
          .send(createApiError(failure.code, failure.message));
      }

      if (!stored) {
        return reply
          .status(400)
          .send(
            createApiError(
              'MISSING_FILE',
              'The request did not include a file part.',
            ),
          );
      }

      const file = await fileRepository.create({
        title: title ?? titleFromFileName(originalFileName),
        fileType: path.extname(stored.storageKey).slice(1),
        sizeBytes: stored.sizeBytes,
        unitId: unit.id,
        storageKey: stored.storageKey,
      });

      return reply.status(201).send(createApiSuccess(file));
    },
  );
}

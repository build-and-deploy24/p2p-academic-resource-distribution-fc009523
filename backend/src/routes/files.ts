import type { FastifyInstance } from 'fastify';
import { fileRepository } from '../repositories/files.js';
import { createApiError } from '../utils/api-error.js';
import {
  contentTypeForStorageKey,
  readStoredFile,
} from '../utils/file-storage.js';

export async function fileRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { fileId: string } }>(
    '/api/files/:fileId/download',
    async (request, reply) => {
      const { fileId } = request.params;

      // Metadata lookup first: an unknown id is a client-visible 404, and it
      // also guarantees storageKey below comes from our own records.
      const file = await fileRepository.findById(fileId);
      if (!file) {
        return reply
          .status(404)
          .send(
            createApiError('FILE_NOT_FOUND', 'The requested file was not found.'),
          );
      }

      try {
        const bytes = await readStoredFile(file.storageKey);

        return reply
          .header('Content-Type', contentTypeForStorageKey(file.storageKey))
          .header('Content-Length', bytes.length)
          // storageKey is a server-generated safe name, so it can be embedded
          // directly as the download filename shown by the browser.
          .header(
            'Content-Disposition',
            `attachment; filename="${file.storageKey}"`,
          )
          // Stop the browser from interpreting the response as anything else.
          .header('X-Content-Type-Options', 'nosniff')
          .send(bytes);
      } catch (error) {
        // Metadata exists but bytes are unreadable: a server-side problem.
        // Log details, return a safe message without any filesystem paths.
        request.log.error({ fileId: file.id, error }, 'stored file read failed');
        return reply.status(500).send(
          createApiError(
            'FILE_STORAGE_ERROR',
            'The requested file could not be read from server storage.',
          ),
        );
      }
    },
  );
}

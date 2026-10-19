import type { FastifyInstance } from 'fastify';
import { fileRepository } from '../repositories/files.js';
import { unitRepository } from '../repositories/units.js';
import { createApiError } from '../utils/api-error.js';
import { createApiSuccess } from '../utils/api-success.js';

export async function unitRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { unitId: string } }>(
    '/api/units/:unitId/files',
    async (request, reply) => {
      const { unitId } = request.params;

      const unit = await unitRepository.findById(unitId);
      if (!unit) {
        return reply
          .status(404)
          .send(
            createApiError('UNIT_NOT_FOUND', 'The requested unit was not found.'),
          );
      }

      const files = await fileRepository.listByUnitId(unit.id);
      return createApiSuccess(files);
    },
  );
}

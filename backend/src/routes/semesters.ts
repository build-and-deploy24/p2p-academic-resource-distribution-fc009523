import type { FastifyInstance } from 'fastify';
import { semesterRepository } from '../repositories/semesters.js';
import { unitRepository } from '../repositories/units.js';
import { createApiError } from '../utils/api-error.js';
import { createApiSuccess } from '../utils/api-success.js';

export async function semesterRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/semesters', async () => {
    const semesters = await semesterRepository.list();
    return createApiSuccess(semesters);
  });

  app.get<{ Params: { semesterId: string } }>(
    '/api/semesters/:semesterId/units',
    async (request, reply) => {
      const { semesterId } = request.params;

      const semester = await semesterRepository.findById(semesterId);
      if (!semester) {
        return reply
          .status(404)
          .send(
            createApiError(
              'SEMESTER_NOT_FOUND',
              `Semester ${semesterId} was not found.`,
            ),
          );
      }

      const units = await unitRepository.listBySemesterId(semester.id);
      return createApiSuccess(units);
    },
  );
}

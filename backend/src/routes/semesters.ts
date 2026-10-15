import type { FastifyInstance } from 'fastify';
import { semesterRepository } from '../repositories/semesters.js';
import { createApiSuccess } from '../utils/api-success.js';

export async function semesterRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/semesters', async () => {
    const semesters = await semesterRepository.list();
    return createApiSuccess(semesters);
  });
}

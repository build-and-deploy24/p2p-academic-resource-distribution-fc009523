
import Fastify, { type FastifyError } from 'fastify';
import { healthRoutes } from './routes/health.js';
import { createApiError } from './utils/api-error.js';

const app = Fastify({
  logger: true,
});

// Register the health-check endpoint.
void app.register(healthRoutes);

// Return the standard error shape for unknown routes.
app.setNotFoundHandler((request, reply) => {
  reply
    .status(404)
    .send(
      createApiError(
        'ROUTE_NOT_FOUND',
        `Route ${request.method} ${request.url} not found.`,
      ),
    );
});

// Return the standard error shape for unhandled errors, without leaking
// internal details for server-side failures.
app.setErrorHandler((error: FastifyError, request, reply) => {
  request.log.error(error);
  const statusCode = error.statusCode ?? 500;
  const isServerError = statusCode >= 500;

  reply
    .status(statusCode)
    .send(
      createApiError(
        isServerError ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST',
        isServerError ? 'An unexpected error occurred.' : error.message,
      ),
    );
});

const start = async (): Promise<void> => {
  try {
    await app.listen({
      port: 3000,
      host: '127.0.0.1',
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();

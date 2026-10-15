
import Fastify from 'fastify';
import { healthRoutes } from './routes/health.js';

const app = Fastify({
  logger: true,
});

// Register the health-check endpoint.
void app.register(healthRoutes);

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

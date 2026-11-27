import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import { userRepository } from '../repositories/users.js';
import { createApiError } from '../utils/api-error.js';
import { createApiSuccess } from '../utils/api-success.js';
import { signToken } from '../utils/auth-token.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterBody {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: RegisterBody }>(
    '/api/auth/register',
    async (request, reply) => {
      const { name, email, password } = request.body ?? {};

      if (
        typeof name !== 'string' ||
        !name.trim() ||
        typeof email !== 'string' ||
        !EMAIL_PATTERN.test(email.trim()) ||
        typeof password !== 'string' ||
        password.length < 8
      ) {
        return reply
          .status(400)
          .send(
            createApiError(
              'VALIDATION_ERROR',
              'A name, a valid email and a password of at least 8 characters are required.',
            ),
          );
      }

      const cleanEmail = email.trim().toLowerCase();
      const duplicate = createApiError(
        'EMAIL_TAKEN',
        'An account with this email already exists.',
      );

      if (await userRepository.findByEmail(cleanEmail)) {
        return reply.status(409).send(duplicate);
      }

      const passwordHash = await bcrypt.hash(password, 10);

      try {
        const user = await userRepository.create({
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
        });
        const token = signToken({ userId: user.id, role: user.role });
        return reply.status(201).send(createApiSuccess({ user, token }));
      } catch (error) {
        if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
          return reply.status(409).send(duplicate);
        }
        throw error;
      }
    },
  );

  app.post<{ Body: LoginBody }>('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body ?? {};
    const invalid = createApiError(
      'INVALID_CREDENTIALS',
      'Invalid email or password.',
    );

    if (typeof email !== 'string' || typeof password !== 'string') {
      return reply.status(400).send(invalid);
    }

    const found = await userRepository.findByEmail(email.trim().toLowerCase());
    if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
      return reply.status(401).send(invalid);
    }

    const user = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
    };
    const token = signToken({ userId: user.id, role: user.role });
    return createApiSuccess({ user, token });
  });
}
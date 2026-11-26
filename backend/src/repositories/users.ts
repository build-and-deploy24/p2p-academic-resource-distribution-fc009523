import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db.js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

export interface UserWithHash extends User {
  passwordHash: string;
}

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'STUDENT' | 'ADMIN';
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserWithHash | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [email],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: String(row.id),
      name: row.name,
      email: row.email,
      role: row.role,
      passwordHash: row.password_hash,
    };
  },

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [input.name, input.email, input.passwordHash, 'STUDENT'],
    );
    return {
      id: String(result.insertId),
      name: input.name,
      email: input.email,
      role: 'STUDENT',
    };
  },
};
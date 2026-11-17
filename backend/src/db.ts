import 'dotenv/config';
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'p2p_revision_db',
  waitForConnections: true,
  connectionLimit: 10,
});

/** Database ids are numbers; reject anything else like "1abc" or "unit-1". */
export function isNumericId(id: string): boolean {
  return /^\d+$/.test(id);
}
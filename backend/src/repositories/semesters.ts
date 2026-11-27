import type { RowDataPacket } from 'mysql2';
import { isNumericId, pool } from '../db.js';

export interface Semester {
  id: string;
  name: string;
}

export interface SemesterRepository {
  list(): Promise<Semester[]>;
  findById(id: string): Promise<Semester | null>;
}

interface SemesterRow extends RowDataPacket {
  id: number;
  name: string;
}

function toSemester(row: SemesterRow): Semester {
  return { id: String(row.id), name: row.name };
}

export const semesterRepository: SemesterRepository = {
  async list(): Promise<Semester[]> {
    const [rows] = await pool.query<SemesterRow[]>(
      'SELECT id, name FROM semesters ORDER BY id',
    );
    return rows.map(toSemester);
  },
  async findById(id: string): Promise<Semester | null> {
    if (!isNumericId(id)) return null;
    const [rows] = await pool.query<SemesterRow[]>(
      'SELECT id, name FROM semesters WHERE id = ?',
      [id],
    );
    return rows[0] ? toSemester(rows[0]) : null;
  },
};
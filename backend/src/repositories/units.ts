import type { RowDataPacket } from 'mysql2';
import { isNumericId, pool } from '../db.js';

export interface Unit {
  id: string;
  name: string;
  semesterId: string;
}

export interface UnitRepository {
  listBySemesterId(semesterId: string): Promise<Unit[]>;
  findById(id: string): Promise<Unit | null>;
}

interface UnitRow extends RowDataPacket {
  id: number;
  name: string;
  semester_id: number;
}

function toUnit(row: UnitRow): Unit {
  return {
    id: String(row.id),
    name: row.name,
    semesterId: String(row.semester_id),
  };
}

export const unitRepository: UnitRepository = {
  async listBySemesterId(semesterId: string): Promise<Unit[]> {
    if (!isNumericId(semesterId)) return [];
    const [rows] = await pool.query<UnitRow[]>(
      'SELECT id, name, semester_id FROM units WHERE semester_id = ? ORDER BY code',
      [semesterId],
    );
    return rows.map(toUnit);
  },
  async findById(id: string): Promise<Unit | null> {
    if (!isNumericId(id)) return null;
    const [rows] = await pool.query<UnitRow[]>(
      'SELECT id, name, semester_id FROM units WHERE id = ?',
      [id],
    );
    return rows[0] ? toUnit(rows[0]) : null;
  },
};
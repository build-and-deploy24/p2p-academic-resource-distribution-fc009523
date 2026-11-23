import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { isNumericId, pool } from '../db.js';

export interface FileMetadata {
  id: string;
  title: string;
  fileType: string;
  sizeBytes: number;
  unitId: string;
  /** Server-generated file name relative to the storage root. */
  storageKey: string;
}

/** Fields the server owns when a new resource is registered. */
export interface NewFileMetadata {
  title: string;
  fileType: string;
  sizeBytes: number;
  unitId: string;
  storageKey: string;
}

export interface FileRepository {
  listByUnitId(unitId: string): Promise<FileMetadata[]>;
  findById(id: string): Promise<FileMetadata | null>;
  create(input: NewFileMetadata): Promise<FileMetadata>;
}

interface FileRow extends RowDataPacket {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  unit_id: number;
  storage_key: string;
}

const COLUMNS =
  'id, filename, file_type, file_size, unit_id, storage_key';

function toFile(row: FileRow): FileMetadata {
  return {
    id: String(row.id),
    title: row.filename,
    fileType: row.file_type.toLowerCase(),
    sizeBytes: Number(row.file_size),
    unitId: String(row.unit_id),
    storageKey: row.storage_key,
  };
}

export const fileRepository: FileRepository = {
  async listByUnitId(unitId: string): Promise<FileMetadata[]> {
    if (!isNumericId(unitId)) return [];
    const [rows] = await pool.query<FileRow[]>(
      `SELECT ${COLUMNS} FROM files WHERE unit_id = ? ORDER BY id`,
      [unitId],
    );
    return rows.map(toFile);
  },
  async findById(id: string): Promise<FileMetadata | null> {
    if (!isNumericId(id)) return null;
    const [rows] = await pool.query<FileRow[]>(
      `SELECT ${COLUMNS} FROM files WHERE id = ?`,
      [id],
    );
    return rows[0] ? toFile(rows[0]) : null;
  },
  async create(input: NewFileMetadata): Promise<FileMetadata> {
    // uploaded_by is required by the schema, and the backend has no login
    // yet, so uploads are recorded against the first ADMIN user.
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO files
         (unit_id, uploaded_by, filename, storage_key, file_size, file_type)
       SELECT ?, id, ?, ?, ?, ? FROM users WHERE role = 'ADMIN'
       ORDER BY id LIMIT 1`,
      [
        input.unitId,
        input.title,
        input.storageKey,
        input.sizeBytes,
        input.fileType.toUpperCase(),
      ],
    );
    if (result.insertId === 0) {
      throw new Error('No ADMIN user exists to record as the uploader.');
    }
    const created = await fileRepository.findById(String(result.insertId));
    if (!created) throw new Error('Inserted file could not be read back.');
    return created;
  },
};
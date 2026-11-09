import { randomUUID } from 'node:crypto';

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

// Temporary in-memory data used until PostgreSQL and Prisma are wired up.
// The final file metadata fields are still an open decision in
// docs/api-contract.md. Each storageKey matches a placeholder file under
// backend/storage/ so the download endpoint can be exercised end to end.
const seedFiles: FileMetadata[] = [
  {
    id: 'file-1',
    title: 'Lecture 1 - Introduction',
    fileType: 'pdf',
    sizeBytes: 360, // real size of the placeholder file in backend/storage/
    unitId: 'unit-1',
    storageKey: 'lecture-1-introduction.pdf',
  },
  {
    id: 'file-2',
    title: 'Lecture 2 - Variables and Types',
    fileType: 'pdf',
    sizeBytes: 367,
    unitId: 'unit-1',
    storageKey: 'lecture-2-variables-and-types.pdf',
  },
  {
    id: 'file-3',
    title: 'Discrete Mathematics Notes',
    fileType: 'pdf',
    sizeBytes: 362,
    unitId: 'unit-2',
    storageKey: 'discrete-mathematics-notes.pdf',
  },
  {
    id: 'file-4',
    title: 'Data Structures Lecture Slides',
    fileType: 'pdf',
    sizeBytes: 366,
    unitId: 'unit-3',
    storageKey: 'data-structures-lecture-slides.pdf',
  },
];

export const fileRepository: FileRepository = {
  async listByUnitId(unitId: string): Promise<FileMetadata[]> {
    return seedFiles.filter((file) => file.unitId === unitId);
  },
  async findById(id: string): Promise<FileMetadata | null> {
    return seedFiles.find((file) => file.id === id) ?? null;
  },
  async create(input: NewFileMetadata): Promise<FileMetadata> {
    const file: FileMetadata = { id: randomUUID(), ...input };
    seedFiles.push(file);
    return file;
  },
};

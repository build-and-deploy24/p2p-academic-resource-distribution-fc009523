export interface Semester {
  id: string;
  name: string;
}

export interface SemesterRepository {
  list(): Promise<Semester[]>;
  findById(id: string): Promise<Semester | null>;
}

// Temporary in-memory data used until PostgreSQL and Prisma are wired up.
// The ids and names are placeholders: the final semester naming scheme is
// still an open decision in docs/api-contract.md.
const seedSemesters: Semester[] = [
  { id: 'semester-1', name: 'Year 1 Semester 1' },
  { id: 'semester-2', name: 'Year 1 Semester 2' },
];

export const semesterRepository: SemesterRepository = {
  async list(): Promise<Semester[]> {
    return seedSemesters;
  },
  async findById(id: string): Promise<Semester | null> {
    return seedSemesters.find((semester) => semester.id === id) ?? null;
  },
};

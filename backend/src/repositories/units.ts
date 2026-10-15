export interface Unit {
  id: string;
  name: string;
  semesterId: string;
}

export interface UnitRepository {
  listBySemesterId(semesterId: string): Promise<Unit[]>;
}

// Temporary in-memory data used until PostgreSQL and Prisma are wired up.
// The ids and names are placeholders: the final unit metadata is still an
// open decision in docs/api-contract.md.
const seedUnits: Unit[] = [
  { id: 'unit-1', name: 'Introduction to Programming', semesterId: 'semester-1' },
  { id: 'unit-2', name: 'Discrete Mathematics', semesterId: 'semester-1' },
  { id: 'unit-3', name: 'Data Structures and Algorithms', semesterId: 'semester-2' },
  { id: 'unit-4', name: 'Database Systems', semesterId: 'semester-2' },
];

export const unitRepository: UnitRepository = {
  async listBySemesterId(semesterId: string): Promise<Unit[]> {
    return seedUnits.filter((unit) => unit.semesterId === semesterId);
  },
};

export type Semester = { id: string; name: string }
export type Unit = { id: string; name: string; semesterId: string }
export type ApiFile = {
  id: string
  title: string
  fileType: string
  sizeBytes: number
  unitId: string
}

type ApiSuccess<T> = { success: true; data: T }

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  const body = (await res.json()) as ApiSuccess<T>
  return body.data
}

export const getSemesters = () => getJson<Semester[]>('/api/semesters')

export const getUnits = (semesterId: string) =>
  getJson<Unit[]>(`/api/semesters/${semesterId}/units`)

export const getFiles = (unitId: string) =>
  getJson<ApiFile[]>(`/api/units/${unitId}/files`)

export const downloadUrl = (fileId: string) => `/api/files/${fileId}/download`

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
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

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'ADMIN'
}
export type AuthResult = { user: AuthUser; token: string }

type ApiErrorBody = { success: false; error: { code: string; message: string } }

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message =
      (json as ApiErrorBody | null)?.error?.message ??
      `Request failed (${res.status})`
    throw new Error(message)
  }
  return (json as ApiSuccess<T>).data
}

export const registerUser = (name: string, email: string, password: string) =>
  postJson<AuthResult>('/api/auth/register', { name, email, password })

export const loginUser = (email: string, password: string) =>
  postJson<AuthResult>('/api/auth/login', { email, password })

const SESSION_KEY = 'campusshare-session'

export function saveSession(result: AuthResult): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(result))
  } catch {
    // Storage can be unavailable; the user simply has to log in again.
  }
}

export function loadSession(): AuthResult | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthResult) : null
  } catch {
    return null
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // Nothing to clear.
  }
}
export async function downloadFile(
  fileId: string,
  token: string,
  fileName: string,
): Promise<void> {
  const res = await fetch(downloadUrl(fileId), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    throw new Error('Please log in again to download files.')
  }
  if (!res.ok) throw new Error(`Download failed (${res.status})`)

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
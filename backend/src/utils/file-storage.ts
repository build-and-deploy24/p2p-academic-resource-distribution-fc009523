import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Server-side directory holding the actual file bytes. File metadata lives in
// the database; only the storageKey (a safe, server-generated file name) is
// stored there. FILE_STORAGE_DIR lets deployments relocate storage; the
// default resolves relative to this module so it works regardless of the
// directory the process was launched from.
const storageRoot = path.resolve(
  process.env.FILE_STORAGE_DIR ??
    path.join(import.meta.dirname, '..', '..', 'storage'),
);

const CONTENT_TYPES_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

/**
 * Map a storage key's extension to the Content-Type returned to the client.
 * Unknown extensions fall back to a generic binary type so the browser never
 * guesses wrong about how to handle the response.
 */
export function contentTypeForStorageKey(storageKey: string): string {
  return (
    CONTENT_TYPES_BY_EXTENSION[path.extname(storageKey).toLowerCase()] ??
    'application/octet-stream'
  );
}

/**
 * Read the stored bytes for a file. Throws if the key is unsafe or the file
 * is missing; callers decide how to translate that into an HTTP response.
 */
export async function readStoredFile(storageKey: string): Promise<Buffer> {
  return readFile(resolveStoragePath(storageKey));
}

/**
 * Convert a storage key into an absolute path, refusing anything that could
 * escape the storage root (path traversal). Storage keys are server-generated,
 * so this is defense in depth in case a bad value ever reaches the database.
 */
function resolveStoragePath(storageKey: string): string {
  if (
    storageKey.length === 0 ||
    path.isAbsolute(storageKey) ||
    storageKey.includes('..') ||
    storageKey.includes('/') ||
    storageKey.includes('\\') ||
    // Quotes are rejected because the same key is echoed into the
    // Content-Disposition filename header.
    storageKey.includes('"')
  ) {
    throw new Error('Unsafe storage key rejected.');
  }

  const resolved = path.resolve(storageRoot, storageKey);
  if (!resolved.startsWith(storageRoot + path.sep)) {
    throw new Error('Storage key resolved outside the storage root.');
  }

  return resolved;
}

import { randomBytes } from 'node:crypto';
import { createWriteStream, type WriteStream } from 'node:fs';
import { readFile, unlink } from 'node:fs/promises';
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
 * Open a write stream for a new stored file. Uploads go through the same
 * storage-root guard as reads, so a bad key can never write outside storage.
 */
export function createStoredFileWriteStream(storageKey: string): WriteStream {
  return createWriteStream(resolveStoragePath(storageKey), { flags: 'wx' });
}

/**
 * Remove a stored file, used to clean up partial or rejected uploads.
 * A file that is already gone is not an error.
 */
export async function deleteStoredFile(storageKey: string): Promise<void> {
  try {
    await unlink(resolveStoragePath(storageKey));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Whether an extension may be accepted from an upload. The allowlist is the
 * same map used for download content types, so the two stay in step: adding a
 * type in one place enables it in both.
 */
export function isAllowedUploadExtension(extension: string): boolean {
  return Object.hasOwn(
    CONTENT_TYPES_BY_EXTENSION,
    extension.toLowerCase(),
  );
}

/**
 * Build a safe, server-generated storage key from a client-supplied file name.
 * Only the extension is trusted, and only after allowlist validation; the name
 * is reduced to a slug plus random suffix so two uploads can never collide and
 * a hostile file name can never escape the storage root.
 */
export function buildStorageKey(originalFileName: string): string {
  const extension = path.extname(originalFileName).toLowerCase();
  if (!isAllowedUploadExtension(extension)) {
    throw new Error('Unsupported file extension rejected.');
  }

  const slug = path
    .basename(originalFileName, path.extname(originalFileName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return `${slug.length > 0 ? slug : 'resource'}-${randomBytes(6).toString('hex')}${extension}`;
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

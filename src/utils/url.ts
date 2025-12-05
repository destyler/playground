import type { File, Framework } from '../templates/types'
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate'

// ============================================================================
// Types
// ============================================================================

/**
 * URL state interface for serialization
 */
export interface UrlState {
  framework: Framework
  files: Record<string, string>
  tsconfig?: string
  importMap?: string
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Compression level for zlib (0-9, higher = better compression)
 */
const COMPRESSION_LEVEL = 9

/**
 * Zlib magic byte for detection
 */
const ZLIB_MAGIC_BYTE = '\x78'

// ============================================================================
// Serialization Functions
// ============================================================================

/**
 * Serializes state to URL hash using gzip compression + base64 encoding
 */
export function serializeState(state: UrlState): string {
  const data = JSON.stringify(state)
  const buffer = strToU8(data)
  const zipped = zlibSync(buffer, { level: COMPRESSION_LEVEL })
  const binary = strFromU8(zipped, true)
  return `#${btoa(binary)}`
}

/**
 * Deserializes state from URL hash
 * Supports both compressed and legacy unicode formats
 */
export function deserializeState(hash: string): UrlState | null {
  if (!hash || hash === '#') {
    return null
  }

  try {
    const serializedState = hash.startsWith('#') ? hash.slice(1) : hash
    const binary = atob(serializedState)

    // Check if it's zlib compressed (starts with magic byte)
    if (binary.startsWith(ZLIB_MAGIC_BYTE)) {
      const buffer = strToU8(binary, true)
      const unzipped = unzlibSync(buffer)
      const data = strFromU8(unzipped)
      return JSON.parse(data)
    }

    // Fallback: try parsing as legacy unicode format
    const decoded = decodeURIComponent(escape(binary))
    return JSON.parse(decoded)
  }
  catch (error) {
    console.error('[URL] Failed to deserialize state:', error)
    return null
  }
}

// ============================================================================
// File Conversion Functions
// ============================================================================

/**
 * Converts File array to Record for serialization
 */
export function filesToRecord(files: File[]): Record<string, string> {
  return files.reduce<Record<string, string>>((acc, file) => {
    acc[file.name] = file.content
    return acc
  }, {})
}

/**
 * Converts Record back to File array
 * @param record - File contents keyed by filename
 * @param activeFile - Optional filename to mark as active
 */
export function recordToFiles(record: Record<string, string>, activeFile?: string): File[] {
  return Object.entries(record).map(([name, content], index) => ({
    name,
    content,
    active: activeFile ? name === activeFile : index === 0,
  }))
}

// ============================================================================
// URL State Management
// ============================================================================

/**
 * Updates URL hash with current state
 * Only includes config if it has been customized
 */
export function updateUrlHash(
  framework: Framework,
  files: File[],
  tsconfig?: string,
  importMap?: string,
): void {
  const urlState: UrlState = {
    framework,
    files: filesToRecord(files),
  }

  // Only include config if it has been customized (not default)
  if (tsconfig) {
    urlState.tsconfig = tsconfig
  }
  if (importMap) {
    urlState.importMap = importMap
  }

  const hash = serializeState(urlState)
  history.replaceState(null, '', hash)
}

/**
 * Gets initial state from URL or returns null
 */
export function getStateFromUrl(): UrlState | null {
  if (typeof window === 'undefined') {
    return null
  }
  return deserializeState(window.location.hash)
}

// ============================================================================
// Clipboard Functions
// ============================================================================

/**
 * Copies shareable URL to clipboard
 * @returns true if successful, false otherwise
 */
export async function copyShareableUrl(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(window.location.href)
    return true
  }
  catch (error) {
    console.error('[URL] Failed to copy URL:', error)
    return false
  }
}

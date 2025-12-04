import type { File, Framework } from './templates/types'
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate'

/**
 * URL state interface
 */
export interface UrlState {
  framework: Framework
  files: Record<string, string>
  tsconfig?: string
  importMap?: string
}

/**
 * Serialize state to URL hash
 * Uses gzip compression + base64 encoding
 */
export function serializeState(state: UrlState): string {
  const data = JSON.stringify(state)
  const buffer = strToU8(data)
  const zipped = zlibSync(buffer, { level: 9 })
  const binary = strFromU8(zipped, true)
  return `#${btoa(binary)}`
}

/**
 * Deserialize state from URL hash
 */
export function deserializeState(hash: string): UrlState | null {
  if (!hash || hash === '#') {
    return null
  }

  try {
    const serializedState = hash.startsWith('#') ? hash.slice(1) : hash
    const binary = atob(serializedState)

    // Check if it's zlib compressed (starts with 0x78)
    if (binary.startsWith('\x78')) {
      const buffer = strToU8(binary, true)
      const unzipped = unzlibSync(buffer)
      const data = strFromU8(unzipped)
      return JSON.parse(data)
    }

    // Fallback: try parsing as old unicode format
    const decoded = decodeURIComponent(escape(binary))
    return JSON.parse(decoded)
  }
  catch (err) {
    console.error('[URL] Failed to deserialize state:', err)
    return null
  }
}

/**
 * Convert File array to Record for serialization
 */
export function filesToRecord(files: File[]): Record<string, string> {
  return files.reduce((acc, file) => {
    acc[file.name] = file.content
    return acc
  }, {} as Record<string, string>)
}

/**
 * Convert Record back to File array
 */
export function recordToFiles(record: Record<string, string>, activeFile?: string): File[] {
  return Object.entries(record).map(([name, content], index) => ({
    name,
    content,
    active: activeFile ? name === activeFile : index === 0,
  }))
}

/**
 * Update URL hash with current state
 */
export function updateUrlHash(framework: Framework, files: File[], tsconfig?: string, importMap?: string): void {
  const urlState: UrlState = {
    framework,
    files: filesToRecord(files),
  }

  // Only include config if it's been customized (not default)
  if (tsconfig) {
    urlState.tsconfig = tsconfig
  }
  if (importMap) {
    urlState.importMap = importMap
  }

  console.log('[URL] Saving state:', { framework, hasTsconfig: !!tsconfig, hasImportMap: !!importMap, importMapLength: importMap?.length })

  const hash = serializeState(urlState)
  history.replaceState(null, '', hash)
}

/**
 * Get initial state from URL or return null
 */
export function getStateFromUrl(): UrlState | null {
  if (typeof window === 'undefined') {
    return null
  }
  const result = deserializeState(window.location.hash)
  console.log('[URL] Loaded state from URL:', { framework: result?.framework, hasTsconfig: !!result?.tsconfig, hasImportMap: !!result?.importMap })
  return result
}

/**
 * Copy shareable URL to clipboard
 */
export async function copyShareableUrl(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(window.location.href)
    return true
  }
  catch (err) {
    console.error('[URL] Failed to copy URL:', err)
    return false
  }
}

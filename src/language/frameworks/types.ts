import type * as monaco from 'monaco-editor-core'

// ============================================================================
// Core Types
// ============================================================================

/**
 * Framework type definition
 */
export type FrameworkType = 'vue' | 'react' | 'solid' | 'svelte'

// ============================================================================
// Worker Types
// ============================================================================

/**
 * Worker host interface for handling CDN files
 */
export interface WorkerHost {
  onFetchCdnFile: (uri: string, text: string) => void
}

/**
 * Create data for language service worker
 */
export interface WorkerCreateData {
  tsconfig: TsConfig
  dependencies: Record<string, string>
}

/**
 * Worker message for initialization
 */
export interface WorkerMessage {
  event: 'init'
  tsVersion: string
  tsLocale: string | undefined
}

// ============================================================================
// TypeScript Configuration
// ============================================================================

/**
 * TypeScript compiler options for language service
 */
export interface TsCompilerOptions {
  allowJs?: boolean
  checkJs?: boolean
  jsx?: string
  jsxImportSource?: string
  target?: string
  module?: string
  moduleResolution?: string
  allowImportingTsExtensions?: boolean
  noEmit?: boolean
  resolveJsonModule?: boolean
  isolatedModules?: boolean
  esModuleInterop?: boolean
  downlevelIteration?: boolean
  strict?: boolean
  skipLibCheck?: boolean
  lib?: string[]
}

// ============================================================================
// Async Request Coordination
// ============================================================================

export interface LatestRequest<TKey> {
  readonly generation: number
  readonly key: TKey
}

export function isCurrentRequestKey<TKey>(requestKey: TKey, currentKey: TKey): boolean {
  return requestKey === currentKey
}

/**
 * Creates an isolated guard for async work where only the newest request may
 * publish its result. The key also invalidates work as soon as the active mode
 * changes, before the replacement request has started.
 */
export function createLatestRequestGuard<TKey>() {
  let generation = 0

  return {
    begin(key: TKey): LatestRequest<TKey> {
      return { generation: ++generation, key }
    },
    isCurrent(request: LatestRequest<TKey>, currentKey: TKey): boolean {
      return request.generation === generation && isCurrentRequestKey(request.key, currentKey)
    },
  }
}

/**
 * Vue-specific compiler options
 */
export interface VueCompilerOptions {
  target?: number
}

/**
 * TypeScript config for language service
 */
export interface TsConfig {
  compilerOptions: TsCompilerOptions
  vueCompilerOptions?: VueCompilerOptions
}

// ============================================================================
// Language Configuration
// ============================================================================

/**
 * Language configuration for Monaco editor
 */
export interface LanguageConfig {
  wordPattern?: RegExp
  brackets?: [string, string][]
  autoClosingPairs?: Array<{ open: string, close: string }>
  surroundingPairs?: Array<{ open: string, close: string }>
}

// ============================================================================
// Framework Configuration
// ============================================================================

/**
 * Framework configuration interface
 * Each framework should implement this interface
 */
export interface FrameworkConfig {
  /** Framework type identifier */
  type: FrameworkType

  /** Language IDs handled by this framework */
  languageIds: string[]

  /** File extensions for this framework */
  extensions: string[]

  /** Monaco language configuration */
  languageConfiguration: monaco.languages.LanguageConfiguration

  /** Dependencies for CDN type resolution */
  dependencies: Record<string, string>

  /** TypeScript configuration */
  tsconfig: TsConfig

  /** File path prefix for this framework */
  filePathPrefix: string

  /** Worker label for Monaco */
  workerLabel: string

  /** Generate global types content if needed */
  generateGlobalTypes?: () => string
}

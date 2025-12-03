import type * as monaco from 'monaco-editor-core'

/**
 * Framework type definition
 */
export type FrameworkType = 'vue' | 'react' | 'solid' | 'svelte'

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

/**
 * TypeScript config for language service
 */
export interface TsConfig {
  compilerOptions: {
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
    strict?: boolean
    skipLibCheck?: boolean
    lib?: string[]
  }
  vueCompilerOptions?: {
    target?: num,er
  }
}

/**
 * Language configuration for Monaco
 */,export interface LanguageConfig {
  wordPattern?: RegExp
  brackets?: [string, string][]
  autoClosingPairs?: { open: string, close: string }[]
  surroundingPairs?: { open: string, close: string }[]
}

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

import type { File, Framework, PlaygroundLayer } from '../templates'
import type { FrameworkOption } from '../templates/types'

// ============================================================================
// Constants
// ============================================================================

/**
 * Special file names for configuration files
 */
export const CONFIG_FILES = {
  TSCONFIG: 'tsconfig.json',
  IMPORT_MAP: 'import-map.json',
  UNO_CONFIG: 'uno.config.ts',
} as const

/**
 * Read-only config files (cannot be edited by user)
 */
export const READ_ONLY_CONFIG_FILES: readonly string[] = [] as const

export type ConfigFileName = typeof CONFIG_FILES[keyof typeof CONFIG_FILES]

/**
 * Available frameworks with their display labels
 */
export const FRAMEWORK_OPTIONS: FrameworkOption[] = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
]

export const DEFAULT_LAYER: PlaygroundLayer = 'destyler'

export const LAYER_OPTIONS: { value: PlaygroundLayer, label: string }[] = [
  { value: 'destyler', label: 'Destyler' },
  { value: 'destyler-ui', label: 'Destyler UI' },
]

// ============================================================================
// State Interface
// ============================================================================

/**
 * Application state interface
 */
export interface PlaygroundState {
  /** Currently selected framework */
  activeFramework: Framework
  /** Destyler headless primitives vs Destyler UI wrappers */
  activeLayer: PlaygroundLayer
  /** User's files in the editor */
  files: File[]
  /** Currently active file name */
  activeFile: string
  /** Currently active config file (null if editing a user file) */
  activeConfigFile: ConfigFileName | null
  /** Content of tsconfig.json */
  tsconfigContent: string
  /** Content of import-map.json (read-only, from framework template) */
  importMapContent: string
  /** Content of uno.config.ts for UnoCSS configuration */
  unoConfigContent: string
  /** Whether UnoCSS is enabled */
  unoEnabled: boolean
  /** UnoCSS configuration error */
  unoConfigError: Error | null
  /** Generated UnoCSS CSS */
  generatedUnoCSS: string
  /** Matched UnoCSS utilities */
  matchedUtilities: string[]
  /** Selected destyler package version */
  destylerVersion: string
}

// ============================================================================
// State Instance
// ============================================================================

/**
 * Shared application state
 * This is a simple reactive state object that can be imported and used throughout the app
 */
export const state: PlaygroundState = {
  activeFramework: 'vue',
  activeLayer: DEFAULT_LAYER,
  files: [],
  activeFile: '',
  activeConfigFile: null,
  tsconfigContent: '',
  importMapContent: '',
  unoConfigContent: '',
  unoEnabled: true,
  unoConfigError: null,
  generatedUnoCSS: '',
  matchedUtilities: [],
  destylerVersion: 'latest',
}

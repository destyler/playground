import type { File, Framework } from '../templates'
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
} as const

/**
 * Read-only config files (cannot be edited by user)
 */
export const READ_ONLY_CONFIG_FILES: readonly string[] = [
  CONFIG_FILES.IMPORT_MAP,
] as const

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

// ============================================================================
// State Interface
// ============================================================================

/**
 * Application state interface
 */
export interface PlaygroundState {
  /** Currently selected framework */
  activeFramework: Framework
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
  files: [],
  activeFile: '',
  activeConfigFile: null,
  tsconfigContent: '',
  importMapContent: '',
}

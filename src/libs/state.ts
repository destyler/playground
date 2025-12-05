import type { File, Framework } from '../templates'

export const frameworks: {
  value: Framework
  label: string
}[] = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
]

// Special file names for config files
export const TSCONFIG_FILE = 'tsconfig.json'
export const IMPORT_MAP_FILE = 'import-map.json'

/**
 * Shared application state
 */
export const state = {
  activeFramework: 'vue' as Framework,
  files: [] as File[],
  activeFile: '',
  // Config file states
  activeConfigFile: null as typeof TSCONFIG_FILE | typeof IMPORT_MAP_FILE | null,
  // Config file contents (stored separately from user files)
  tsconfigContent: '' as string,
  importMapContent: '' as string,
}

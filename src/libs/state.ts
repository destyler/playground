import type { File, Framework } from '../utils/templates'

export const frameworks: {
  value: Framework
  label: string
}[] = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
]

/**
 * Shared application state
 */
export const state = {
  activeFramework: 'vue' as Framework,
  files: [] as File[],
  activeFile: '',
}

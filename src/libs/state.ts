import type { File, Framework } from '../utils/templates'

/**
 * Shared application state
 */
export const state = {
  activeFramework: 'vue' as Framework,
  files: [] as File[],
  activeFile: '',
}

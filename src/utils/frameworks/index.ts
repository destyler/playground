import type { FrameworkConfig, FrameworkType } from './types'
import { reactConfig } from './react'
import { vueConfig } from './vue'

export * from './types'
export { reactConfig } from './react'
export { vueConfig } from './vue'

/**
 * Framework configuration registry
 */
export const frameworkConfigs: Record<FrameworkType, FrameworkConfig | null> = {
  vue: vueConfig,
  react: reactConfig,
  solid: null, // TODO: Add Solid config when ready
  svelte: null, // TODO: Add Svelte config when ready
}

/**
 * Get framework configuration by type
 */
export function getFrameworkConfig(type: FrameworkType): FrameworkConfig | null {
  return frameworkConfigs[type] || null
}

/**
 * Check if a framework has language service support
 */
export function hasLanguageServiceSupport(type: FrameworkType): boolean {
  return frameworkConfigs[type] !== null
}

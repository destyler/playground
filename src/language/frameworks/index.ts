import type { FrameworkConfig, FrameworkType } from './types'
import { reactConfig } from './react'
import { solidConfig } from './solid'
import { svelteConfig } from './svelte'
import { vueConfig } from './vue'

// ============================================================================
// Re-exports
// ============================================================================

export { reactConfig } from './react'
export { solidConfig } from './solid'
export { svelteConfig } from './svelte'
export * from './types'
export { vueConfig } from './vue'

// ============================================================================
// Framework Registry
// ============================================================================

/**
 * Framework configuration registry
 * Maps framework types to their configurations
 */
export const frameworkConfigs: Readonly<Record<FrameworkType, FrameworkConfig | null>> = {
  vue: vueConfig,
  react: reactConfig,
  solid: solidConfig,
  svelte: svelteConfig,
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets framework configuration by type
 * @param type - Framework type to look up
 * @returns Framework configuration or null if not found
 */
export function getFrameworkConfig(type: FrameworkType): FrameworkConfig | null {
  return frameworkConfigs[type] ?? null
}

/**
 * Checks if a framework has language service support
 * @param type - Framework type to check
 * @returns true if the framework has language service support
 */
export function hasLanguageServiceSupport(type: FrameworkType): boolean {
  return frameworkConfigs[type] !== null
}

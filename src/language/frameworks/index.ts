import type { FrameworkConfig, FrameworkType } from './types'
import { vueConfig } from './vue'

// ============================================================================
// Re-exports
// ============================================================================

export * from './types'
export { vueConfig } from './vue'

// ============================================================================
// Framework Registry (Vue is eager; others load on demand)
// ============================================================================

const configCache: Partial<Record<FrameworkType, FrameworkConfig>> = {
  vue: vueConfig,
}

const configLoaders: Record<FrameworkType, () => Promise<FrameworkConfig>> = {
  vue: async () => vueConfig,
  react: () => import('./react').then(m => m.reactConfig),
  solid: () => import('./solid').then(m => m.solidConfig),
  svelte: () => import('./svelte').then(m => m.svelteConfig),
}

/**
 * All playground frameworks have a language service worker.
 */
const LANGUAGE_SERVICE_FRAMEWORKS: ReadonlySet<FrameworkType> = new Set([
  'vue',
  'react',
  'solid',
  'svelte',
])

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Loads framework configuration by type.
 * Vue is available immediately; React/Solid/Svelte are dynamic-imported once.
 */
export async function loadFrameworkConfig(type: FrameworkType): Promise<FrameworkConfig | null> {
  const cached = configCache[type]
  if (cached)
    return cached

  const loader = configLoaders[type]
  if (!loader)
    return null

  const config = await loader()
  configCache[type] = config
  return config
}

/**
 * Gets a previously loaded (or Vue-eager) framework configuration.
 * Use {@link loadFrameworkConfig} on framework switch / language-service setup
 * so React/Solid/Svelte modules are not imported on default Vue boot.
 */
export function getFrameworkConfig(type: FrameworkType): FrameworkConfig | null {
  return configCache[type] ?? null
}

/**
 * Checks if a framework has language service support
 */
export function hasLanguageServiceSupport(type: FrameworkType): boolean {
  return LANGUAGE_SERVICE_FRAMEWORKS.has(type)
}

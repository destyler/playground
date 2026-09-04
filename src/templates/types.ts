/**
 * Supported framework types
 */
export type Framework = 'vue' | 'react' | 'solid' | 'svelte'

/**
 * Destyler layer: headless primitives vs styled Destyler UI wrappers
 */
export type PlaygroundLayer = 'destyler' | 'destyler-ui'

/**
 * Represents a file in the playground editor
 */
export interface File {
  /** File name with extension (e.g., 'App.vue') */
  name: string
  /** File content */
  content: string
  /** Whether this file is currently active/selected */
  active?: boolean
}

/**
 * Standard Import map configuration for ES modules
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
 */
export interface ImportMap {
  imports: Record<string, string>
}

/**
 * User-friendly import map configuration
 * Users can specify imports directly with full CDN URLs
 *
 * @example
 * ```json
 * {
 *   "imports": {
 *     "@vueuse/core": "https://esm.sh/@vueuse/core@11.0.0?external=vue",
 *     "lodash-es": "https://esm.sh/lodash-es@4.17.21"
 *   }
 * }
 * ```
 */
export interface UserImportMap {
  /**
   * Direct imports with full CDN URLs
   * User has full control over the URL (including ?external= parameters)
   */
  imports?: Record<string, string>
}

/**
 * Template configuration for each framework
 */
export interface FrameworkTemplate {
  /** Display name of the framework */
  name: string
  /** Default files to create when switching to this framework */
  defaultFiles: File[]
  /** TypeScript configuration */
  tsconfig: object
  /** Import map for browser module resolution (user-friendly format) */
  importMap: UserImportMap
  /** UnoCSS configuration content */
  unoConfig: string
}

/**
 * Framework metadata for UI display
 */
export interface FrameworkOption {
  value: Framework
  label: string
}

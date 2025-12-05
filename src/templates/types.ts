/**
 * Supported framework types
 */
export type Framework = 'vue' | 'react' | 'solid' | 'svelte'

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
 * User-friendly import map configuration (mirrors package.json format)
 * Users can specify dependencies with versions, which will be resolved to CDN URLs
 *
 * @example
 * ```json
 * {
 *   "name": "my-playground",
 *   "dependencies": {
 *     "lodash-es": "^4.17.21",
 *     "dayjs": "latest"
 *   }
 * }
 * ```
 */
export interface UserImportMap {
  /**
   * Package name identifier (optional, for display purposes)
   */
  name?: string
  /**
   * Dependencies with version specifiers (like package.json)
   * Will be resolved to esm.sh CDN URLs
   */
  dependencies?: Record<string, string>
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
}

/**
 * Framework metadata for UI display
 */
export interface FrameworkOption {
  value: Framework
  label: string
}

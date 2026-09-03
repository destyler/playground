/**
 * Keep the language worker compiler and its CDN standard library in lockstep.
 * Mixing versions can make built-in types such as Symbol.iterator disappear
 * from diagnostics even though the configured lib includes ESNext.
 */
export const TYPESCRIPT_VERSION = '5.6.2'

export const TYPESCRIPT_DEPENDENCY = {
  typescript: TYPESCRIPT_VERSION,
} as const

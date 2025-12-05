import type { FrameworkConfig, TsConfig } from './types'
import { jsxLanguageConfiguration } from './react'

/**
 * Solid dependencies for CDN type resolution
 */
const solidDependencies: Record<string, string> = {
  'typescript': 'latest',
  'solid-js': 'latest',
}

/**
 * Solid TypeScript configuration
 */
const solidTsConfig: TsConfig = {
  compilerOptions: {
    allowJs: true,
    checkJs: true,
    jsx: 'preserve',
    jsxImportSource: 'solid-js',
    target: 'ESNext',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    allowImportingTsExtensions: true,
    noEmit: true,
    isolatedModules: true,
    esModuleInterop: true,
    strict: false,
    skipLibCheck: true,
    lib: ['ESNext', 'DOM', 'DOM.Iterable'],
  },
}

/**
 * Generate Solid global types for better type inference
 */
function generateSolidGlobalTypes(): string {
  return `
/// <reference types="solid-js" />

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
`
}

/**
 * Solid framework configuration
 */
export const solidConfig: FrameworkConfig = {
  type: 'solid',
  languageIds: ['javascript', 'typescript', 'jsx', 'tsx'],
  extensions: ['.tsx', '.jsx', '.ts', '.js'],
  languageConfiguration: jsxLanguageConfiguration,
  dependencies: solidDependencies,
  tsconfig: solidTsConfig,
  filePathPrefix: '',
  workerLabel: 'solid',
  generateGlobalTypes: generateSolidGlobalTypes,
}

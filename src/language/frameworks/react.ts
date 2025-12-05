import type { FrameworkConfig, TsConfig } from './types'

/**
 * Shared JSX/TSX language configuration for Monaco
 * Used by React, Solid, and other JSX-based frameworks
 */
export const jsxLanguageConfiguration = {
  wordPattern: /(-?\d*\.\d\w*)|([^`~!@$^&*()=+[\]{}\\|;:'",.<>/\s]+)/g,
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ] as [string, string][],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '\'', close: '\'' },
    { open: '`', close: '`' },
    { open: '<', close: '>' },
  ],
  surroundingPairs: [
    { open: '"', close: '"' },
    { open: '\'', close: '\'' },
    { open: '`', close: '`' },
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '<', close: '>' },
  ],
}

/**
 * React dependencies for CDN type resolution
 */
const reactDependencies: Record<string, string> = {
  'typescript': 'latest',
  'react': 'latest',
  'react-dom': 'latest',
  '@types/react': 'latest',
  '@types/react-dom': 'latest',
  // UnoCSS types for uno.config.ts
  'unocss': 'latest',
  '@unocss/core': 'latest',
  '@unocss/preset-uno': 'latest',
}

/**
 * React TypeScript configuration
 */
const reactTsConfig: TsConfig = {
  compilerOptions: {
    allowJs: true,
    checkJs: true,
    jsx: 'react-jsx',
    jsxImportSource: 'react',
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
 * Generate React global types for better type inference
 */
function generateReactGlobalTypes(): string {
  return `
/// <reference types="react" />
/// <reference types="react-dom" />

declare global {
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
 * React framework configuration
 */
export const reactConfig: FrameworkConfig = {
  type: 'react',
  languageIds: ['javascript', 'typescript', 'jsx', 'tsx'],
  extensions: ['.tsx', '.jsx', '.ts', '.js'],
  languageConfiguration: jsxLanguageConfiguration,
  dependencies: reactDependencies,
  tsconfig: reactTsConfig,
  filePathPrefix: '',
  workerLabel: 'react',
  generateGlobalTypes: generateReactGlobalTypes,
}

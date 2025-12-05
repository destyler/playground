import type { FrameworkConfig, TsConfig } from './types'

/**
 * Svelte language configuration for Monaco
 */
const svelteLanguageConfiguration = {
  wordPattern: /(-?\d*\.\d\w*)|([^`~!@$^&*()=+[\]{}\\|;:'",.<>/\s]+)/g,
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['<', '>'],
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
  folding: {
    markers: {
      start: /^\s*<!--\s*#region\b.*-->$/,
      end: /^\s*<!--\s*#endregion\b.*-->$/,
    },
  },
  onEnterRules: [
    {
      // Auto-indent after opening tags
      beforeText: /<(?!(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b)[a-z][^>]*>$/i,
      afterText: /^<\/[a-z][^>]*>$/i,
      action: { indentAction: 2 }, // IndentAction.IndentOutdent
    },
    {
      // Auto-indent after {#if, {#each, {#await, etc.
      beforeText: /\{#(if|each|await|key)\b.*\}$/,
      action: { indentAction: 1 }, // IndentAction.Indent
    },
  ],
}

/**
 * Svelte dependencies for CDN type resolution
 */
const svelteDependencies: Record<string, string> = {
  typescript: 'latest',
  svelte: '5',
}

/**
 * Svelte TypeScript configuration
 */
const svelteTsConfig: TsConfig = {
  compilerOptions: {
    allowJs: true,
    checkJs: true,
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
 * Generate Svelte global types for better type inference
 * This includes Svelte 5 runes support
 */
function generateSvelteGlobalTypes(): string {
  return `
/// <reference types="svelte" />

declare module '*.svelte' {
  import type { ComponentType, SvelteComponent } from 'svelte';
  const component: ComponentType<SvelteComponent>;
  export default component;
}

// Svelte 5 runes ambient declarations
declare function $state<T>(initial: T): T;
declare function $state<T>(): T | undefined;
declare namespace $state {
  export function raw<T>(initial: T): T;
  export function snapshot<T>(state: T): T;
}
declare function $derived<T>(expression: T): T;
declare namespace $derived {
  export function by<T>(fn: () => T): T;
}
declare function $effect(fn: () => void | (() => void)): void;
declare namespace $effect {
  export function pre(fn: () => void | (() => void)): void;
  export function tracking(): boolean;
  export function root(fn: () => void | (() => void)): () => void;
}
declare function $props<T>(): T;
declare function $bindable<T>(fallback?: T): T;
declare function $inspect<T>(...values: T[]): { with: (fn: (type: 'init' | 'update', ...values: T[]) => void) => void };
declare function $host<T extends HTMLElement>(): T;

export {};
`
}

/**
 * Svelte framework configuration
 */
export const svelteConfig: FrameworkConfig = {
  type: 'svelte',
  languageIds: ['javascript', 'typescript', 'svelte'],
  extensions: ['.svelte', '.ts', '.js'],
  languageConfiguration: svelteLanguageConfiguration,
  dependencies: svelteDependencies,
  tsconfig: svelteTsConfig,
  filePathPrefix: '',
  workerLabel: 'svelte',
  generateGlobalTypes: generateSvelteGlobalTypes,
}

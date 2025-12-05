import type * as monaco from 'monaco-editor-core'
import { shikiToMonaco } from '@shikijs/monaco'
import * as monacoEditor from 'monaco-editor-core'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

// Language imports
import langCss from 'shiki/langs/css.mjs'
import langHtml from 'shiki/langs/html.mjs'
import langJavascript from 'shiki/langs/javascript.mjs'
import langJson from 'shiki/langs/json.mjs'
import langJsx from 'shiki/langs/jsx.mjs'
import langSvelte from 'shiki/langs/svelte.mjs'
import langTsx from 'shiki/langs/tsx.mjs'
import langTypescript from 'shiki/langs/typescript.mjs'
import langVue from 'shiki/langs/vue.mjs'

// Theme imports
import themeDark from 'shiki/themes/vitesse-dark.mjs'
import themeLight from 'shiki/themes/vitesse-light.mjs'

// ============================================================================
// Constants
// ============================================================================

/**
 * All supported languages for syntax highlighting
 */
const SUPPORTED_LANGUAGES = [
  { id: 'vue' },
  { id: 'svelte' },
  { id: 'typescript' },
  { id: 'javascript' },
  { id: 'tsx' },
  { id: 'jsx' },
  { id: 'html' },
  { id: 'css' },
  { id: 'json' },
] as const

/**
 * JSX/TSX language configuration for Monaco
 */
const JSX_LANGUAGE_CONFIG: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['<', '>'],
  ],
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
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '\'', close: '\'' },
    { open: '`', close: '`' },
    { open: '<', close: '>' },
  ],
}

// ============================================================================
// State
// ============================================================================

let isRegistered = false

// ============================================================================
// Main Export
// ============================================================================

/**
 * Registers the Shiki syntax highlighter with Monaco editor
 * This function is idempotent - it only registers once
 */
export function registerHighlighter(): void {
  if (isRegistered) {
    return
  }
  isRegistered = true

  // Create highlighter with all supported languages and themes
  const highlighter = createHighlighterCoreSync({
    themes: [themeDark, themeLight],
    langs: [
      langVue,
      langSvelte,
      langTsx,
      langJsx,
      langHtml,
      langCss,
      langJavascript,
      langTypescript,
      langJson,
    ],
    engine: createJavaScriptRegexEngine(),
  })

  // Register all languages with Monaco
  for (const lang of SUPPORTED_LANGUAGES) {
    monacoEditor.languages.register(lang)
  }

  // Apply Shiki highlighting to Monaco
  shikiToMonaco(highlighter, monacoEditor)

  // Configure JSX/TSX language features
  monacoEditor.languages.setLanguageConfiguration('tsx', JSX_LANGUAGE_CONFIG)
  monacoEditor.languages.setLanguageConfiguration('jsx', JSX_LANGUAGE_CONFIG)
}

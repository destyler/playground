import type * as monaco from 'monaco-editor-core'
import type { Framework } from '../templates'
import { shikiToMonaco } from '@shikijs/monaco'
import * as monacoEditor from 'monaco-editor-core'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

// Shared languages — needed for every mode (configs, CSS, HTML)
import langCss from 'shiki/langs/css.mjs'
import langHtml from 'shiki/langs/html.mjs'
import langJavascript from 'shiki/langs/javascript.mjs'
import langJson from 'shiki/langs/json.mjs'
import langTypescript from 'shiki/langs/typescript.mjs'

// Theme imports
import themeDark from 'shiki/themes/vitesse-dark.mjs'
import themeLight from 'shiki/themes/vitesse-light.mjs'

// ============================================================================
// Constants
// ============================================================================

/**
 * All supported languages for syntax highlighting (Monaco IDs only)
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

type LangLoader = () => Promise<{ default: unknown }>

const FRAMEWORK_LANG_LOADERS: Record<Framework, Record<string, LangLoader>> = {
  vue: {
    vue: () => import('shiki/langs/vue.mjs'),
  },
  react: {
    tsx: () => import('shiki/langs/tsx.mjs'),
    jsx: () => import('shiki/langs/jsx.mjs'),
  },
  solid: {
    tsx: () => import('shiki/langs/tsx.mjs'),
    jsx: () => import('shiki/langs/jsx.mjs'),
  },
  svelte: {
    svelte: () => import('shiki/langs/svelte.mjs'),
  },
}

const SHARED_LANGS = [
  langHtml,
  langCss,
  langJavascript,
  langTypescript,
  langJson,
]

// ============================================================================
// State
// ============================================================================

let isMonacoRegistered = false
let appliedLangKey = ''
const loadedFrameworkLangs = new Map<string, unknown>()

// ============================================================================
// Helpers
// ============================================================================

async function loadFrameworkLangModules(framework: Framework): Promise<void> {
  const loaders = FRAMEWORK_LANG_LOADERS[framework]

  await Promise.all(Object.entries(loaders).map(async ([id, load]) => {
    if (loadedFrameworkLangs.has(id))
      return
    const lang = (await load()).default
    loadedFrameworkLangs.set(id, lang)
  }))
}

function applyHighlighter(): void {
  const highlighter = createHighlighterCoreSync({
    themes: [themeDark, themeLight],
    langs: [...SHARED_LANGS, ...loadedFrameworkLangs.values()] as any,
    engine: createJavaScriptRegexEngine(),
  })

  if (!isMonacoRegistered) {
    for (const lang of SUPPORTED_LANGUAGES) {
      monacoEditor.languages.register(lang)
    }
    monacoEditor.languages.setLanguageConfiguration('tsx', JSX_LANGUAGE_CONFIG)
    monacoEditor.languages.setLanguageConfiguration('jsx', JSX_LANGUAGE_CONFIG)
    isMonacoRegistered = true
  }

  shikiToMonaco(highlighter, monacoEditor)
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Registers the Shiki syntax highlighter with Monaco for the active framework.
 * Shared langs load eagerly; vue/tsx/jsx/svelte grammars are dynamic-imported.
 * Switching frameworks recreates the highlighter with previously loaded + new langs
 * so unused framework grammars stay out of the Vue boot chunk.
 */
export async function registerHighlighter(framework: Framework = 'vue'): Promise<void> {
  await loadFrameworkLangModules(framework)
  const langKey = [...loadedFrameworkLangs.keys()].sort().join(',')
  if (langKey === appliedLangKey)
    return
  appliedLangKey = langKey
  applyHighlighter()
}

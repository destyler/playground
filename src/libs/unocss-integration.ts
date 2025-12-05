/**
 * UnoCSS Monaco Editor Integration
 *
 * Provides twoslash-style hover information, autocomplete suggestions,
 * and decorations for UnoCSS utility classes in the Monaco editor.
 *
 * @module libs/unocss-integration
 */

import type { UnocssAutocomplete } from '@unocss/autocomplete'
import type * as monaco from 'monaco-editor-core'
import { createAutocomplete } from '@unocss/autocomplete'
import * as monacoEditor from 'monaco-editor-core'
import { getUnoGenerator } from './unocss'

// ============================================================================
// Types
// ============================================================================

interface ColorInfo {
  color: string
  range: monaco.IRange
}

interface ClassInfo {
  className: string
  range: monaco.IRange
}

// ============================================================================
// Module State
// ============================================================================

let autocompleteInstance: UnocssAutocomplete | null = null
let hoverProviderDispose: monaco.IDisposable | null = null
let completionProviderDispose: monaco.IDisposable | null = null
let decorationCollection: string[] = []
let underlineDecorationCollection: string[] = []
let iconDecorationCollection: string[] = []
let currentEditor: monaco.editor.IStandaloneCodeEditor | null = null
let themeObserver: MutationObserver | null = null

// Cache for CSS results to improve performance
const cssCache = new Map<string, string>()
// Cache for validated class names
const validClassCache = new Map<string, boolean>()
// Cache for icon SVG data URLs
const iconSvgCache = new Map<string, string>()

// ============================================================================
// Constants
// ============================================================================

/**
 * Languages that should have UnoCSS integration
 */
const SUPPORTED_LANGUAGES = [
  'vue',
  'svelte',
  'html',
  'javascript',
  'typescript',
  'javascriptreact',
  'typescriptreact',
  'jsx',
  'tsx',
]

/**
 * Regex patterns for extracting class names
 */
const CLASS_PATTERNS = [
  // class="..." or className="..."
  /(?:class|className)\s*=\s*["']([^"']+)["']/g,
  // :class="..." or v-bind:class="..."
  /(?::|v-bind:)class\s*=\s*["']([^"']+)["']/g,
  // class:xxx={...} in Svelte
  /class:([^\s=]+)/g,
  // class={`...`} template literals
  /(?:class|className)\s*=\s*\{`([^`]+)`\}/g,
  // Attributify mode: common utility prefixes as attributes (including icons with i- prefix)
  /\s((?:bg|text|border|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|flex|grid|gap|rounded|shadow|opacity|font|leading|tracking|transition|transform|cursor|select|outline|ring|divide|space|place|items|justify|content|self|order|col|row|top|right|bottom|left|inset|overflow|float|clear|object|aspect|container|prose|sr|not-sr|icon|[ipmwhz])-[^\s=>"']+)/g,
]

// ============================================================================
// Autocomplete Management
// ============================================================================

/**
 * Initializes or updates the autocomplete instance
 */
async function getAutocomplete(): Promise<UnocssAutocomplete> {
  if (!autocompleteInstance) {
    const generator = await getUnoGenerator()
    autocompleteInstance = createAutocomplete(generator)
  }
  return autocompleteInstance
}

/**
 * Resets the autocomplete instance (call when config changes)
 */
export function resetAutocomplete(): void {
  autocompleteInstance = null
  cssCache.clear()
  validClassCache.clear()
  // Re-update decorations if editor exists
  if (currentEditor) {
    updateAllDecorations(currentEditor)
  }
}

// ============================================================================
// CSS Generation Utilities
// ============================================================================

/**
 * Gets generated CSS for a class name
 */
async function getCSSForClass(className: string): Promise<string | null> {
  // Check cache first
  if (cssCache.has(className)) {
    return cssCache.get(className)!
  }

  try {
    const generator = await getUnoGenerator()
    const result = await generator.generate(className, {
      preflights: false,
      minify: false,
    })

    if (result.css && result.matched.size > 0) {
      // Extract just the CSS rules, not the full output
      const css = formatCSS(result.css, className)
      cssCache.set(className, css)
      return css
    }
  }
  catch (e) {
    console.error('[UnoCSS Integration] Error generating CSS:', e)
  }

  return null
}

/**
 * Formats CSS output for display with proper indentation and line breaks
 */
function formatCSS(css: string, className: string): string {
  // First, try to extract just the relevant rule
  const lines = css.split('\n').filter(line => line.trim())

  // Find the rule that matches this class
  const rules: string[] = []
  let inRule = false
  let braceCount = 0

  for (const line of lines) {
    if (line.includes(className) || inRule) {
      inRule = true
      rules.push(line)
      braceCount += (line.match(/\{/g) || []).length
      braceCount -= (line.match(/\}/g) || []).length
      if (braceCount === 0) {
        inRule = false
      }
    }
  }

  let rawCss = rules.length > 0 ? rules.join('\n') : css

  // Now format the CSS for better readability
  rawCss = prettifyCSS(rawCss)

  return rawCss
}

/**
 * Prettifies CSS with proper indentation and line breaks
 */
function prettifyCSS(css: string): string {
  // Remove extra whitespace but preserve structure
  let result = css.trim()

  // If already formatted nicely (has newlines and indentation), return as is
  if (result.includes('\n') && result.includes('  ')) {
    return result
  }

  // Format compressed CSS
  result = result
    // Add newline after opening brace
    .replace(/\{\s*/g, ' {\n  ')
    // Add newline before closing brace
    .replace(/\s*\}/g, '\n}')
    // Add newline after semicolons (for properties)
    .replace(/;\s*(?!$)/g, ';\n  ')
    // Clean up any multiple spaces
    .replace(/ {2,}/g, '  ')
    // Remove trailing spaces on lines
    .replace(/ +\n/g, '\n')
    // Remove extra blank lines
    .replace(/\n{2,}/g, '\n')

  // Handle nested rules (like media queries)
  const lines = result.split('\n')
  const formatted: string[] = []
  let indentLevel = 0

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine)
      continue

    // Decrease indent before closing brace
    if (trimmedLine.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }

    // Add proper indentation
    const indent = '  '.repeat(indentLevel)
    formatted.push(indent + trimmedLine)

    // Increase indent after opening brace
    if (trimmedLine.endsWith('{')) {
      indentLevel++
    }
  }

  return formatted.join('\n')
}

// ============================================================================
// Class Name Extraction
// ============================================================================

interface ClassAtPositionResult {
  className: string
  startColumn: number
  endColumn: number
}

/**
 * Extracts class name at a specific position in text
 */
function getClassAtPosition(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
): ClassAtPositionResult | null {
  const line = model.getLineContent(position.lineNumber)
  const wordAtPosition = model.getWordAtPosition(position)

  if (!wordAtPosition) {
    return null
  }

  // Find the class attribute context
  for (const pattern of CLASS_PATTERNS) {
    pattern.lastIndex = 0
    let match = pattern.exec(line)
    while (match !== null) {
      const classContent = match[1] || match[0]
      const startIndex = match.index + match[0].indexOf(classContent)
      const endIndex = startIndex + classContent.length

      // Check if position is within this class content
      if (position.column > startIndex && position.column <= endIndex + 1) {
        // Find the specific class at the position
        const classes = classContent.split(/\s+/)
        let currentPos = startIndex

        for (const cls of classes) {
          const clsStart = currentPos + 1
          const clsEnd = clsStart + cls.length

          if (position.column >= clsStart && position.column <= clsEnd) {
            return {
              className: cls.trim(),
              startColumn: clsStart,
              endColumn: clsEnd,
            }
          }

          currentPos = clsEnd
        }
      }
      match = pattern.exec(line)
    }
  }

  // Fallback: check if the word itself looks like a UnoCSS class
  const word = wordAtPosition.word
  if (isLikelyUnoClass(word)) {
    // Also check the surrounding context to get the full class (including variants)
    const fullClass = getFullClassFromContext(line, wordAtPosition)
    const className = fullClass || word

    // Calculate the actual start and end columns for the full class
    const startCol = fullClass
      ? line.indexOf(fullClass, wordAtPosition.startColumn - word.length - 10) + 1
      : wordAtPosition.startColumn
    const endCol = startCol + className.length

    return {
      className,
      startColumn: startCol > 0 ? startCol : wordAtPosition.startColumn,
      endColumn: endCol,
    }
  }

  return null
}

/**
 * Gets the full class including variants from context
 */
function getFullClassFromContext(
  line: string,
  wordAtPosition: { startColumn: number, endColumn: number, word: string },
): string | null {
  const { startColumn, endColumn } = wordAtPosition
  let start = startColumn - 1
  let end = endColumn - 1

  // Extend backwards to include variants (e.g., "hover:", "dark:")
  while (start > 0) {
    const char = line[start - 1]
    if (/[\s"'`={}]/.test(char)) {
      break
    }
    start--
  }

  // Extend forwards
  while (end < line.length) {
    const char = line[end]
    if (/[\s"'`={}]/.test(char)) {
      break
    }
    end++
  }

  const fullClass = line.substring(start, end).trim()
  return fullClass || null
}

/**
 * Checks if a word looks like a UnoCSS class
 */
function isLikelyUnoClass(word: string): boolean {
  // Common UnoCSS/Tailwind prefixes
  const prefixes = [
    'i-', // Icon prefix
    'icon-', // Alternative icon prefix
    'bg-',
    'text-',
    'border-',
    'p-',
    'px-',
    'py-',
    'pt-',
    'pb-',
    'pl-',
    'pr-',
    'm-',
    'mx-',
    'my-',
    'mt-',
    'mb-',
    'ml-',
    'mr-',
    'w-',
    'h-',
    'min-',
    'max-',
    'flex',
    'grid',
    'gap-',
    'rounded',
    'shadow',
    'opacity-',
    'font-',
    'leading-',
    'tracking-',
    'transition',
    'transform',
    'cursor-',
    'select-',
    'outline-',
    'ring-',
    'divide-',
    'space-',
    'place-',
    'items-',
    'justify-',
    'content-',
    'self-',
    'order-',
    'col-',
    'row-',
    'z-',
    'top-',
    'right-',
    'bottom-',
    'left-',
    'inset-',
    'overflow-',
    'float-',
    'clear-',
    'object-',
    'aspect-',
    'container',
    'prose',
    'sr-',
    'not-sr-',
    'hover:',
    'focus:',
    'active:',
    'dark:',
    'light:',
    'sm:',
    'md:',
    'lg:',
    'xl:',
    '2xl:',
    'before:',
    'after:',
  ]

  return prefixes.some(prefix => word.startsWith(prefix) || word.includes(`:${prefix}`))
    || /^-?[a-z]+(?:-[a-z0-9/[\]]+)+$/.test(word)
}

// ============================================================================
// Hover Provider
// ============================================================================

/**
 * Checks if a class name is an icon class (from presetIcons)
 */
function isIconClass(className: string): boolean {
  // Common icon prefixes: i-*, icon-*, or custom prefixes like i-carbon-*, i-ph-*, etc.
  return /^i-[a-z]/.test(className) || /^icon-[a-z]/.test(className)
}

/**
 * Extracts SVG from CSS generated by presetIcons
 * The CSS typically contains:
 * - mask mode: --un-icon: url("data:image/svg+xml;utf8,%3Csvg...")
 * - bg mode: background: url("data:image/svg+xml;utf8,%3Csvg...") no-repeat
 */
function extractSvgFromIconCSS(css: string): string | null {
  // Match data:image/svg+xml in url() - handles both utf8 and regular encoding
  // UnoCSS uses: url("data:image/svg+xml;utf8,%3Csvg...%3E%3C/svg%3E")
  const match = css.match(/url\(["']?(data:image\/svg\+xml[^"')]+)["']?\)/)
  if (!match) {
    return null
  }

  let svgData = match[1]

  // Remove the data URL prefix (handle various formats)
  if (svgData.includes(';utf8,')) {
    svgData = svgData.split(';utf8,')[1]
  }
  else if (svgData.includes(';base64,')) {
    const base64Data = svgData.split(';base64,')[1]
    try {
      svgData = atob(base64Data)
      return svgData
    }
    catch {
      return null
    }
  }
  else if (svgData.includes(',')) {
    svgData = svgData.split(',')[1]
  }
  else {
    return null
  }

  // URL decode the SVG
  try {
    svgData = decodeURIComponent(svgData)
    return svgData
  }
  catch {
    return null
  }
}

/**
 * Creates an HTML preview for icon hover
 */
function createIconPreview(svg: string, className: string): string {
  // Clean up the SVG and ensure it has proper attributes for display
  let cleanSvg = svg.trim()

  // Remove existing width/height and add larger size for better visibility
  cleanSvg = cleanSvg
    .replace(/\s*width\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*height\s*=\s*["'][^"']*["']/gi, '')
    .replace('<svg', '<svg width="48" height="48"')

  // For dark theme support, we might need to adjust fill color
  // If the SVG uses currentColor, we can replace it
  cleanSvg = cleanSvg.replace(/currentColor/g, '#888888')

  // Encode the SVG for data URL
  const encodedSvg = encodeURIComponent(cleanSvg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')

  const dataUrl = `data:image/svg+xml,${encodedSvg}`

  // Use HTML img tag since Monaco supports HTML in hover with supportHtml
  return `<div style="text-align: center; padding: 8px;">
<img src="${dataUrl}" alt="${className}" style="width: 48px; height: 48px;" />
<div style="margin-top: 8px; font-family: monospace; font-size: 12px; color: #888;">${className}</div>
</div>`
}

/**
 * Registers the hover provider for UnoCSS classes
 */
function registerHoverProvider(): void {
  hoverProviderDispose?.dispose()

  hoverProviderDispose = monacoEditor.languages.registerHoverProvider(
    SUPPORTED_LANGUAGES,
    {
      async provideHover(model, position) {
        const classInfo = getClassAtPosition(model, position)

        if (!classInfo) {
          return null
        }

        const { className, startColumn, endColumn } = classInfo

        const css = await getCSSForClass(className)

        if (!css) {
          return null
        }

        // Check if this is an icon class and extract SVG preview
        const contents: monaco.IMarkdownString[] = []

        if (isIconClass(className)) {
          const svg = extractSvgFromIconCSS(css)
          if (svg) {
            // For icon classes, show the icon as HTML
            // Monaco hover with supportHtml can render HTML content
            contents.push({
              value: createIconPreview(svg, className),
              supportHtml: true,
              isTrusted: true,
            } as monaco.IMarkdownString)
          }
          else {
            // Fallback to CSS if SVG extraction fails
            contents.push({
              value: `\`\`\`css\n${css}\n\`\`\``,
            })
          }
        }
        else {
          // For non-icon classes, show CSS code block
          contents.push({
            value: `\`\`\`css\n${css}\n\`\`\``,
          })
        }

        return {
          range: new monacoEditor.Range(
            position.lineNumber,
            startColumn,
            position.lineNumber,
            endColumn,
          ),
          contents,
        }
      },
    },
  )
}

// ============================================================================
// Completion Provider
// ============================================================================

/**
 * Registers the completion provider for UnoCSS classes
 */
function registerCompletionProvider(): void {
  completionProviderDispose?.dispose()

  completionProviderDispose = monacoEditor.languages.registerCompletionItemProvider(
    SUPPORTED_LANGUAGES,
    {
      triggerCharacters: ['-', ':', ' ', '"', '\'', '`', '{'],

      async provideCompletionItems(model, position) {
        const line = model.getLineContent(position.lineNumber)
        const textBeforePosition = line.substring(0, position.column - 1)

        // Check if we're in a class attribute context
        if (!isInClassContext(textBeforePosition)) {
          return { suggestions: [] }
        }

        // Get the current input for autocomplete
        const input = getCurrentInput(textBeforePosition)

        try {
          const autocomplete = await getAutocomplete()
          const suggestions = await autocomplete.suggest(input)

          if (!suggestions || suggestions.length === 0) {
            return { suggestions: [] }
          }

          const wordInfo = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: wordInfo.startColumn,
            endColumn: wordInfo.endColumn,
          }

          const completionItems: monaco.languages.CompletionItem[] = await Promise.all(
            suggestions.slice(0, 50).map(async (suggestion, index) => {
              const css = await getCSSForClass(suggestion)

              return {
                label: suggestion,
                kind: monacoEditor.languages.CompletionItemKind.Value,
                insertText: suggestion,
                range,
                sortText: String(index).padStart(5, '0'),
                detail: 'UnoCSS',
                documentation: css
                  ? {
                      value: `\`\`\`css\n${css}\n\`\`\``,
                    }
                  : undefined,
              }
            }),
          )

          return { suggestions: completionItems }
        }
        catch (e) {
          console.error('[UnoCSS Integration] Autocomplete error:', e)
          return { suggestions: [] }
        }
      },
    },
  )
}

/**
 * Checks if the cursor is in a class attribute context
 */
function isInClassContext(textBeforePosition: string): boolean {
  // Check for class/className attribute
  const classAttrMatch = /(?:class|className)\s*=\s*["'`{][^"'`}]*$/i.test(textBeforePosition)
  if (classAttrMatch) {
    return true
  }

  // Check for v-bind:class or :class
  const vueClassMatch = /(?::|v-bind:)class\s*=\s*["'][^"']*$/i.test(textBeforePosition)
  if (vueClassMatch) {
    return true
  }

  // Check for Svelte class directive
  const svelteClassMatch = /class:[^\s=]*$/i.test(textBeforePosition)
  if (svelteClassMatch) {
    return true
  }

  return false
}

/**
 * Extracts the current input for autocomplete
 */
function getCurrentInput(textBeforePosition: string): string {
  // Find the last class separator (space, quote, etc.)
  const match = textBeforePosition.match(/[\s"'`{:]([^\s"'`{}:]+)$/)
  if (match) {
    return match[1]
  }

  // Fallback: get everything after the last quote or space
  const lastQuote = Math.max(
    textBeforePosition.lastIndexOf('"'),
    textBeforePosition.lastIndexOf('\''),
    textBeforePosition.lastIndexOf('`'),
    textBeforePosition.lastIndexOf(' '),
  )

  return lastQuote >= 0 ? textBeforePosition.substring(lastQuote + 1) : ''
}

// ============================================================================
// Color Decorations
// ============================================================================

/**
 * Color regex patterns
 */
const COLOR_PATTERNS = [
  // bg-red-500, text-blue-300, border-green-400, etc.
  /((?:bg|text|border|ring|divide|outline|shadow|accent|caret|fill|stroke)-(?:black|white|transparent|current|inherit|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{1,3})?)/g,
  // Arbitrary colors: bg-[#ff0000], text-[rgb(255,0,0)]
  /((?:bg|text|border|ring)-\[(?:#[a-f0-9]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))\])/gi,
]

/**
 * Color value mapping
 */
const COLOR_VALUES: Record<string, string> = {
  'black': '#000000',
  'white': '#ffffff',
  'transparent': 'transparent',
  'slate-50': '#f8fafc',
  'slate-100': '#f1f5f9',
  'slate-200': '#e2e8f0',
  'slate-300': '#cbd5e1',
  'slate-400': '#94a3b8',
  'slate-500': '#64748b',
  'slate-600': '#475569',
  'slate-700': '#334155',
  'slate-800': '#1e293b',
  'slate-900': '#0f172a',
  'slate-950': '#020617',
  'gray-50': '#f9fafb',
  'gray-100': '#f3f4f6',
  'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-800': '#1f2937',
  'gray-900': '#111827',
  'gray-950': '#030712',
  'red-50': '#fef2f2',
  'red-100': '#fee2e2',
  'red-200': '#fecaca',
  'red-300': '#fca5a5',
  'red-400': '#f87171',
  'red-500': '#ef4444',
  'red-600': '#dc2626',
  'red-700': '#b91c1c',
  'red-800': '#991b1b',
  'red-900': '#7f1d1d',
  'red-950': '#450a0a',
  'orange-50': '#fff7ed',
  'orange-100': '#ffedd5',
  'orange-200': '#fed7aa',
  'orange-300': '#fdba74',
  'orange-400': '#fb923c',
  'orange-500': '#f97316',
  'orange-600': '#ea580c',
  'orange-700': '#c2410c',
  'orange-800': '#9a3412',
  'orange-900': '#7c2d12',
  'orange-950': '#431407',
  'yellow-50': '#fefce8',
  'yellow-100': '#fef9c3',
  'yellow-200': '#fef08a',
  'yellow-300': '#fde047',
  'yellow-400': '#facc15',
  'yellow-500': '#eab308',
  'yellow-600': '#ca8a04',
  'yellow-700': '#a16207',
  'yellow-800': '#854d0e',
  'yellow-900': '#713f12',
  'yellow-950': '#422006',
  'green-50': '#f0fdf4',
  'green-100': '#dcfce7',
  'green-200': '#bbf7d0',
  'green-300': '#86efac',
  'green-400': '#4ade80',
  'green-500': '#22c55e',
  'green-600': '#16a34a',
  'green-700': '#15803d',
  'green-800': '#166534',
  'green-900': '#14532d',
  'green-950': '#052e16',
  'blue-50': '#eff6ff',
  'blue-100': '#dbeafe',
  'blue-200': '#bfdbfe',
  'blue-300': '#93c5fd',
  'blue-400': '#60a5fa',
  'blue-500': '#3b82f6',
  'blue-600': '#2563eb',
  'blue-700': '#1d4ed8',
  'blue-800': '#1e40af',
  'blue-900': '#1e3a8a',
  'blue-950': '#172554',
  'indigo-50': '#eef2ff',
  'indigo-100': '#e0e7ff',
  'indigo-200': '#c7d2fe',
  'indigo-300': '#a5b4fc',
  'indigo-400': '#818cf8',
  'indigo-500': '#6366f1',
  'indigo-600': '#4f46e5',
  'indigo-700': '#4338ca',
  'indigo-800': '#3730a3',
  'indigo-900': '#312e81',
  'indigo-950': '#1e1b4b',
  'purple-50': '#faf5ff',
  'purple-100': '#f3e8ff',
  'purple-200': '#e9d5ff',
  'purple-300': '#d8b4fe',
  'purple-400': '#c084fc',
  'purple-500': '#a855f7',
  'purple-600': '#9333ea',
  'purple-700': '#7e22ce',
  'purple-800': '#6b21a8',
  'purple-900': '#581c87',
  'purple-950': '#3b0764',
  'pink-50': '#fdf2f8',
  'pink-100': '#fce7f3',
  'pink-200': '#fbcfe8',
  'pink-300': '#f9a8d4',
  'pink-400': '#f472b6',
  'pink-500': '#ec4899',
  'pink-600': '#db2777',
  'pink-700': '#be185d',
  'pink-800': '#9d174d',
  'pink-900': '#831843',
  'pink-950': '#500724',
}

/**
 * Extracts color from a class name
 */
function extractColorFromClass(className: string): string | null {
  // Check for arbitrary color values
  const arbitraryMatch = className.match(/\[([^\]]+)\]/)
  if (arbitraryMatch) {
    return arbitraryMatch[1]
  }

  // Extract color name from class (e.g., "bg-red-500" -> "red-500")
  const colorMatch = className.match(/(?:bg|text|border|ring|divide|outline|shadow|accent|caret|fill|stroke)-(.+)/)
  if (colorMatch) {
    const colorKey = colorMatch[1]
    return COLOR_VALUES[colorKey] || null
  }

  return null
}

/**
 * Finds all color classes in the model and their positions
 */
function findColorClasses(model: monaco.editor.ITextModel): ColorInfo[] {
  const colors: ColorInfo[] = []
  const lineCount = model.getLineCount()

  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    const line = model.getLineContent(lineNumber)

    for (const pattern of COLOR_PATTERNS) {
      pattern.lastIndex = 0
      let match = pattern.exec(line)

      while (match !== null) {
        const className = match[1]
        const color = extractColorFromClass(className)

        if (color) {
          // Find the start of the full class name (including variants like dark:, hover:, etc.)
          let startIndex = match.index
          // Look backwards to find the actual start of the class (including variant prefixes)
          while (startIndex > 0) {
            const char = line[startIndex - 1]
            // Stop if we hit whitespace, quotes, or other separators
            if (/[\s"'`={}]/.test(char)) {
              break
            }
            startIndex--
          }

          colors.push({
            color,
            range: {
              startLineNumber: lineNumber,
              endLineNumber: lineNumber,
              startColumn: startIndex + 1,
              endColumn: match.index + match[0].length + 1,
            },
          })
        }
        match = pattern.exec(line)
      }
    }
  }

  return colors
}

/**
 * Updates color decorations in the editor
 */
function updateColorDecorations(editor: monaco.editor.IStandaloneCodeEditor): void {
  const model = editor.getModel()
  if (!model) {
    return
  }

  const colors = findColorClasses(model)

  // Create decoration options for each color
  const decorations: monaco.editor.IModelDeltaDecoration[] = colors.map(({ color: _color, range }) => ({
    range,
    options: {
      before: {
        content: ' ',
        inlineClassName: `uno-color-preview`,
        inlineClassNameAffectsLetterSpacing: true,
      },
      // We can't use dynamic inline styles directly, so we use CSS classes
      // The actual color will be shown via the hover provider
    },
  }))

  // Apply decorations
  decorationCollection = editor.deltaDecorations(decorationCollection, decorations)
}

// ============================================================================
// UnoCSS Class Underline Decorations
// ============================================================================

/**
 * Checks if a class name is a valid UnoCSS utility
 */
async function isValidUnoClass(className: string): Promise<boolean> {
  // Check cache first
  if (validClassCache.has(className)) {
    return validClassCache.get(className)!
  }

  try {
    const generator = await getUnoGenerator()
    const result = await generator.generate(className, {
      preflights: false,
      minify: false,
    })

    const isValid = result.matched.size > 0
    validClassCache.set(className, isValid)
    return isValid
  }
  catch {
    return false
  }
}

/**
 * Finds all class names in the model that might be UnoCSS utilities
 */
function findAllClassNames(model: monaco.editor.ITextModel): ClassInfo[] {
  const classes: ClassInfo[] = []
  const lineCount = model.getLineCount()

  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    const line = model.getLineContent(lineNumber)

    for (const pattern of CLASS_PATTERNS) {
      pattern.lastIndex = 0
      let match = pattern.exec(line)

      while (match !== null) {
        const classContent = match[1] || match[0]
        const contentStart = match.index + match[0].indexOf(classContent)

        // Split into individual classes
        const classNames = classContent.split(/\s+/).filter(c => c.trim())
        let currentOffset = 0

        for (const cls of classNames) {
          // Find the actual position of this class in the content
          const clsIndex = classContent.indexOf(cls, currentOffset)
          if (clsIndex !== -1) {
            const startColumn = contentStart + clsIndex + 1
            const endColumn = startColumn + cls.length

            classes.push({
              className: cls,
              range: {
                startLineNumber: lineNumber,
                endLineNumber: lineNumber,
                startColumn,
                endColumn,
              },
            })

            currentOffset = clsIndex + cls.length
          }
        }

        match = pattern.exec(line)
      }
    }
  }

  return classes
}

/**
 * Updates underline decorations for valid UnoCSS classes
 */
async function updateUnderlineDecorations(editor: monaco.editor.IStandaloneCodeEditor): Promise<void> {
  const model = editor.getModel()
  if (!model) {
    return
  }

  const allClasses = findAllClassNames(model)

  // Validate classes in parallel (with batching for performance)
  const validClasses: ClassInfo[] = []
  const batchSize = 20

  for (let i = 0; i < allClasses.length; i += batchSize) {
    const batch = allClasses.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(async (info) => {
        const isValid = await isValidUnoClass(info.className)
        return { info, isValid }
      }),
    )

    for (const { info, isValid } of results) {
      if (isValid) {
        validClasses.push(info)
      }
    }
  }

  // Create underline decorations for valid classes
  const decorations: monaco.editor.IModelDeltaDecoration[] = validClasses.map(({ range }) => ({
    range,
    options: {
      inlineClassName: 'uno-class-underline',
    },
  }))

  // Apply decorations
  underlineDecorationCollection = editor.deltaDecorations(underlineDecorationCollection, decorations)
}

/**
 * Gets or creates a CSS class for an icon with inline SVG background
 */
function getOrCreateIconClass(className: string, svgDataUrl: string): string {
  const safeClassName = `uno-icon-${className.replace(/[^a-z0-9]/gi, '-')}`

  // Check if style already exists
  if (document.getElementById(`icon-style-${safeClassName}`)) {
    return safeClassName
  }

  // Convert the data URL to a proper format for CSS background
  // UnoCSS generates: data:image/svg+xml;utf8,%3Csvg...
  // We need to decode it and re-encode properly for CSS
  let processedUrl = svgDataUrl

  // If the URL uses utf8 encoding with URL-encoded content, decode it
  if (svgDataUrl.includes(';utf8,')) {
    const svgPart = svgDataUrl.split(';utf8,')[1]
    try {
      let decodedSvg = decodeURIComponent(svgPart)

      // Only replace currentColor, preserve other colors (like logos, emojis, etc.)
      // Dark mode: white, Light mode: black
      const isDark = document.documentElement.classList.contains('dark')
        || document.body.classList.contains('dark')
        || document.documentElement.getAttribute('data-theme') === 'dark'

      decodedSvg = decodedSvg.replace(/currentColor/g, isDark ? '#d4d4d4' : '#1e1e1e')

      // Re-encode for CSS using encodeURIComponent
      processedUrl = `data:image/svg+xml,${encodeURIComponent(decodedSvg)}`
    }
    catch {
      // Keep original if decoding fails
    }
  }

  // Escape single quotes for CSS
  processedUrl = processedUrl.replace(/'/g, '%27')

  // Create a new style element for this icon
  const style = document.createElement('style')
  style.id = `icon-style-${safeClassName}`

  // Use background-image directly since we've already processed the colors in the SVG
  style.textContent = `
    .monaco-editor .${safeClassName} {
      display: inline-block !important;
      width: 1.2em !important;
      height: 1.2em !important;
      margin-right: 2px !important;
      vertical-align: middle !important;
      background-image: url('${processedUrl}') !important;
      background-repeat: no-repeat !important;
      background-size: 100% 100% !important;
      color: #222222;
    }

    .dark .monaco-editor .${safeClassName} {
      color: #eeeeee;
    }
  `
  document.head.appendChild(style)

  return safeClassName
}

/**
 * Extracts SVG data URL from icon CSS for inline preview
 */
async function getIconSvgDataUrl(className: string): Promise<string | null> {
  // Check cache first
  if (iconSvgCache.has(className)) {
    return iconSvgCache.get(className)!
  }

  // For icons, we need to get the raw CSS without formatting
  // because formatCSS might break the URL
  try {
    const generator = await getUnoGenerator()
    const result = await generator.generate(className, {
      preflights: false,
      minify: true, // Use minified to avoid line breaks in URL
    })

    if (!result.css || result.matched.size === 0) {
      return null
    }

    const css = result.css

    // Extract the SVG data URL directly from the CSS
    // UnoCSS generates two modes:
    // 1. background mode: background:url("data:image/svg+xml;utf8,%3Csvg...")
    // 2. mask mode: --un-icon:url("data:image/svg+xml;utf8,%3Csvg...")
    // The URL may be wrapped in double quotes, single quotes, or no quotes
    // And the content after utf8, may contain single quotes in the SVG
    // eslint-disable-next-line regexp/optimal-quantifier-concatenation
    const match = css.match(/url\(["']?(data:image\/svg\+xml;utf8,[^)]+)["']?\)/)

    if (!match) {
      return null
    }

    // Clean up the data URL - remove trailing quote if present
    let dataUrl = match[1]
    if (dataUrl.endsWith('"') || dataUrl.endsWith('\'')) {
      dataUrl = dataUrl.slice(0, -1)
    }

    iconSvgCache.set(className, dataUrl)
    return dataUrl
  }
  catch (e) {
    console.error('[UnoCSS Icons] Error getting icon CSS:', e)
    return null
  }
}

/**
 * Updates icon inline decorations for icon classes
 */
async function updateIconDecorations(editor: monaco.editor.IStandaloneCodeEditor): Promise<void> {
  const model = editor.getModel()
  if (!model) {
    return
  }

  const allClasses = findAllClassNames(model)

  // Filter to only icon classes and deduplicate by className + line
  const iconClasses = allClasses.filter(info => isIconClass(info.className))
  const seenIcons = new Set<string>()
  const uniqueIconClasses = iconClasses.filter((info) => {
    const key = `${info.className}:${info.range.startLineNumber}:${info.range.startColumn}`
    if (seenIcons.has(key)) {
      return false
    }
    seenIcons.add(key)
    return true
  })

  // Get SVG data for each icon class
  const decorations: monaco.editor.IModelDeltaDecoration[] = []

  for (const info of uniqueIconClasses) {
    const svgDataUrl = await getIconSvgDataUrl(info.className)
    if (svgDataUrl) {
      const iconClass = getOrCreateIconClass(info.className, svgDataUrl)
      decorations.push({
        range: info.range,
        options: {
          // Show icon before the class name
          before: {
            content: ' ',
            inlineClassName: iconClass,
          },
        },
      })
    }
  }

  // Apply decorations
  iconDecorationCollection = editor.deltaDecorations(iconDecorationCollection, decorations)
}

/**
 * Updates all decorations (color preview, underlines, and icon previews)
 */
async function updateAllDecorations(editor: monaco.editor.IStandaloneCodeEditor): Promise<void> {
  updateColorDecorations(editor)
  await updateUnderlineDecorations(editor)
  await updateIconDecorations(editor)
}

/**
 * Clears icon style cache and regenerates icons (for theme changes)
 */
function clearIconStyleCache(): void {
  // Remove all dynamically created icon styles
  document.querySelectorAll('[id^="icon-style-uno-icon-"]').forEach(el => el.remove())
  // Clear the SVG cache so icons are regenerated with new colors
  iconSvgCache.clear()
}

/**
 * Sets up theme change observer to update icon colors
 */
function setupThemeObserver(): void {
  // Watch for class changes on html/body for theme switches
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes'
        && (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
        // Theme changed, clear icon cache and regenerate
        clearIconStyleCache()
        if (currentEditor) {
          updateIconDecorations(currentEditor)
        }
        break
      }
    }
  })

  // Observe both html and body for theme changes
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
  observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] })

  // Store observer for cleanup
  themeObserver = observer
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes UnoCSS integration for the Monaco editor
 */
export function initUnocssIntegration(editor: monaco.editor.IStandaloneCodeEditor): void {
  currentEditor = editor

  // Register providers
  registerHoverProvider()
  registerCompletionProvider()

  // Setup theme observer for icon color updates
  setupThemeObserver()

  // Setup decoration updates
  const model = editor.getModel()
  if (model) {
    // Initial decoration update
    updateAllDecorations(editor)

    // Update decorations on content change (debounced)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    model.onDidChangeContent(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        updateAllDecorations(editor)
      }, 300)
    })
  }

  // Listen for model changes
  editor.onDidChangeModel(() => {
    const newModel = editor.getModel()
    if (newModel) {
      updateAllDecorations(editor)

      let debounceTimer: ReturnType<typeof setTimeout> | null = null
      newModel.onDidChangeContent(() => {
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }
        debounceTimer = setTimeout(() => {
          updateAllDecorations(editor)
        }, 300)
      })
    }
  })
}

/**
 * Disposes UnoCSS integration
 */
export function disposeUnocssIntegration(): void {
  hoverProviderDispose?.dispose()
  hoverProviderDispose = null

  completionProviderDispose?.dispose()
  completionProviderDispose = null

  // Disconnect theme observer
  themeObserver?.disconnect()
  themeObserver = null

  if (currentEditor) {
    currentEditor.deltaDecorations(decorationCollection, [])
    currentEditor.deltaDecorations(underlineDecorationCollection, [])
    currentEditor.deltaDecorations(iconDecorationCollection, [])
  }
  decorationCollection = []
  underlineDecorationCollection = []
  iconDecorationCollection = []

  // Clean up dynamically created icon styles
  document.querySelectorAll('[id^="icon-style-uno-icon-"]').forEach(el => el.remove())

  currentEditor = null
  autocompleteInstance = null
  cssCache.clear()
  validClassCache.clear()
  iconSvgCache.clear()
}

// ============================================================================
// CSS for Color Preview
// ============================================================================

/**
 * Injects CSS styles for UnoCSS integration
 */
export function injectUnocssStyles(): void {
  const styleId = 'unocss-integration-styles'
  if (document.getElementById(styleId)) {
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    /* UnoCSS Color Preview */
    .uno-color-preview {
      display: inline-block;
      width: 0.8em;
      height: 0.8em;
      margin-right: 0.3em;
      border: 1px solid rgba(128, 128, 128, 0.3);
      border-radius: 2px;
      vertical-align: middle;
    }

    /* UnoCSS class underline - indicates valid UnoCSS utility */
    .monaco-editor .uno-class-underline {
      text-decoration: underline;
      text-decoration-style: dotted;
      text-decoration-color: #b56959;
      text-underline-offset: 3px;
    }

    /* Dark theme support */
    .dark .monaco-editor .uno-class-underline,
    [data-theme="dark"] .monaco-editor .uno-class-underline {
      text-decoration-color: #c08d80;
    }

    /* Hover highlight for UnoCSS classes */
    .monaco-editor .uno-class-highlight {
      background-color: rgba(100, 149, 237, 0.15);
      border-radius: 2px;
    }
  `
  document.head.appendChild(style)
}

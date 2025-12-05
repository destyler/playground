import type { File, Framework } from '../templates'
import type { ImportMap, UserImportMap } from '../templates/types'
import { getAllDestylerImports } from '../libs/destyler-deps'
import { generateReactScript } from '../preview/react'
import { generateSolidScript } from '../preview/solid'
import { generateSvelteScript } from '../preview/svelte'
import { generateVueScript } from '../preview/vue'

// ============================================================================
// Constants
// ============================================================================

/**
 * CDN base URL for resolving package dependencies
 * Using esm.sh for proper ES Module support
 */
const CDN_BASE_URL = 'https://esm.sh'

/**
 * Core dependencies for each framework (fixed, not user-modifiable)
 * These are essential runtime dependencies that must be present
 */
const CORE_IMPORTS: Readonly<Record<Framework, Record<string, string>>> = {
  vue: {
    'vue': `${CDN_BASE_URL}/vue`,
    '@vue/runtime-core': `${CDN_BASE_URL}/@vue/runtime-core`,
    '@vue/runtime-dom': `${CDN_BASE_URL}/@vue/runtime-dom`,
    '@vue/reactivity': `${CDN_BASE_URL}/@vue/reactivity`,
    '@vue/shared': `${CDN_BASE_URL}/@vue/shared`,
  },
  react: {
    'react': `${CDN_BASE_URL}/react`,
    'react-dom': `${CDN_BASE_URL}/react-dom`,
    'react-dom/client': `${CDN_BASE_URL}/react-dom/client`,
  },
  solid: {
    'solid-js': `${CDN_BASE_URL}/solid-js`,
    'solid-js/web': `${CDN_BASE_URL}/solid-js/web`,
  },
  svelte: {
    'svelte': `${CDN_BASE_URL}/svelte@5`,
    'svelte/compiler': `${CDN_BASE_URL}/svelte@5/compiler`,
    'svelte/internal/client': `${CDN_BASE_URL}/svelte@5/internal/client`,
  },
}

/**
 * CDN scripts required for each framework's runtime
 * Note: For Vue, we now use ESM version loaded via import map instead of global script
 */
const FRAMEWORK_CDNS: Readonly<Record<Framework, readonly string[]>> = {
  vue: [
    'https://unpkg.com/vue3-sfc-loader/dist/vue3-sfc-loader.js',
  ],
  react: [],
  solid: [],
  svelte: [],
}

/**
 * Script generators for each framework
 * Vue needs the import map for external module resolution
 */
type ScriptGenerator = (serializedFiles: string, serializedImportMap?: string) => string

const SCRIPT_GENERATORS: Readonly<Record<Framework, ScriptGenerator>> = {
  vue: generateVueScript,
  react: generateReactScript,
  solid: generateSolidScript,
  svelte: generateSvelteScript,
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts user import map to standard import map
 * User provides direct CDN URLs, no automatic resolution needed
 *
 * @param userImportMap - User-defined import map with direct imports
 * @returns Standard ImportMap
 */
function resolveUserImportMap(userImportMap?: UserImportMap): ImportMap {
  if (!userImportMap || !userImportMap.imports) {
    return { imports: {} }
  }

  return { imports: { ...userImportMap.imports } }
}

/**
 * Creates the error handling script for the preview iframe
 */
function createErrorHandlingScript(): string {
  return `
    <script>
      // Error overlay container
      window.__errorOverlay__ = null;

      function showError(message, stack) {
        if (!window.__errorOverlay__) {
          window.__errorOverlay__ = document.createElement('div');
          window.__errorOverlay__.id = '__error_overlay__';
          window.__errorOverlay__.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:16px 20px;background:#fef0f0;color:#f56c6c;z-index:9999;border-bottom:2px solid #f56c6c;font-family:monospace;font-size:14px;white-space:pre-wrap;max-height:50vh;overflow:auto;';
          document.body.appendChild(window.__errorOverlay__);
        }
        window.__errorOverlay__.textContent = message + (stack ? '\\n\\n' + stack : '');
        window.__errorOverlay__.style.display = 'block';
      }

      function clearError() {
        if (window.__errorOverlay__) {
          window.__errorOverlay__.style.display = 'none';
          window.__errorOverlay__.textContent = '';
        }
      }

      // Expose functions globally for update functions
      window.__clearError__ = clearError;
      window.__showError__ = showError;

      window.onerror = function(msg, url, line, col, error) {
        showError('Error: ' + msg, error ? error.stack : '');
        console.error(error || msg);
        return false;
      };

      window.onunhandledrejection = function(e) {
        let message = 'Async Error: ';
        if (e.reason instanceof Error) {
          message += e.reason.message;
          showError(message, e.reason.stack);
        } else {
          message += String(e.reason);
          showError(message);
        }
        console.error(e.reason);
      };
    </script>
  `
}

/**
 * Merges core imports with user-provided imports
 * Core imports take precedence and cannot be overridden by user
 *
 * @param coreImports - Framework core dependencies
 * @param userImportMap - User-defined import map with direct imports
 * @returns Merged ImportMap
 */
function mergeImportMaps(
  coreImports: Record<string, string>,
  userImportMap?: UserImportMap,
): ImportMap {
  // Get user imports directly (no resolution needed)
  const resolvedUserMap = resolveUserImportMap(userImportMap)
  const userImports = resolvedUserMap.imports

  // Filter out core dependencies from user imports (prevent override)
  const filteredUserImports: Record<string, string> = {}
  for (const [key, value] of Object.entries(userImports)) {
    if (!(key in coreImports)) {
      filteredUserImports[key] = value
    }
  }

  return {
    imports: {
      ...coreImports,
      ...filteredUserImports,
    },
  }
}

/**
 * Converts file array to a serialized map string for embedding in HTML
 */
function serializeFilesToMap(files: File[]): string {
  const filesMap = files.reduce<Record<string, string>>((acc, file) => {
    acc[file.name] = file.content
    return acc
  }, {})

  // Escape closing script tags to prevent HTML parsing issues
  return JSON.stringify(filesMap).replace(/<\//g, '\\x3C/')
}

/**
 * Creates UnoCSS style tag with generated CSS
 */
function createUnoStyleTag(unoCSS: string): string {
  if (!unoCSS)
    return ''
  // Escape any closing style tags in the CSS
  const escapedCSS = unoCSS.replace(/<\/style/gi, '<\\/style')
  return `<style id="__unocss__">${escapedCSS}</style>`
}

/**
 * Creates UnoCSS update script for hot reload
 */
function createUnoUpdateScript(): string {
  return `
    <script>
      // Listen for UnoCSS updates via postMessage
      window.addEventListener('message', (e) => {
        if (e.data.type === 'UPDATE_UNOCSS') {
          const styleEl = document.getElementById('__unocss__');
          if (styleEl) {
            styleEl.textContent = e.data.css;
          } else {
            const newStyle = document.createElement('style');
            newStyle.id = '__unocss__';
            newStyle.textContent = e.data.css;
            document.head.appendChild(newStyle);
          }
        }
      });
    </script>
  `
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Generates the complete HTML document for the preview iframe
 *
 * @param framework - The current framework
 * @param files - Array of files to include
 * @param userImportMap - Optional user-defined import map with direct imports
 * @param unoCSS - Optional UnoCSS generated CSS
 * @param destylerVersion - Optional destyler package version (defaults to 'latest')
 * @returns Complete HTML string
 */
export function generateHtml(
  framework: Framework,
  files: File[],
  userImportMap?: UserImportMap,
  unoCSS?: string,
  destylerVersion: string = 'latest',
): string {
  const coreImports = CORE_IMPORTS[framework]
  // Get all destyler imports based on framework and version
  const destylerImports = getAllDestylerImports(destylerVersion, framework)
  // Merge core, destyler, and user imports
  const mergedCoreImports = { ...coreImports, ...destylerImports }
  const finalImportMap = mergeImportMaps(mergedCoreImports, userImportMap)
  const importMapScript = `<script type="importmap">${JSON.stringify(finalImportMap)}</script>`

  const serializedFiles = serializeFilesToMap(files)
  const serializedImportMap = JSON.stringify(finalImportMap).replace(/<\//g, '\\x3C/')
  const errorHandling = createErrorHandlingScript()
  const scriptContent = SCRIPT_GENERATORS[framework](serializedFiles, serializedImportMap)

  // UnoCSS styles
  const unoStyles = createUnoStyleTag(unoCSS || '')
  const unoUpdateScript = createUnoUpdateScript()

  // For Vue, we need to load Vue ESM first, expose it globally, then load vue3-sfc-loader
  let frameworkSetup = ''
  if (framework === 'vue') {
    frameworkSetup = `
  <script type="module">
    import * as Vue from 'vue';
    window.Vue = Vue;

    // Load vue3-sfc-loader after Vue is available
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vue3-sfc-loader/dist/vue3-sfc-loader.js';
    script.onload = () => {
      window.dispatchEvent(new Event('vue3-sfc-loader-ready'));
    };
    document.head.appendChild(script);
  </script>`
  }
  else {
    const cdnScripts = FRAMEWORK_CDNS[framework]
      .map(url => `<script src="${url}"></script>`)
      .join('\n')
    frameworkSetup = cdnScripts
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  ${unoStyles}
  ${importMapScript}
  ${errorHandling}
  ${unoUpdateScript}
  ${frameworkSetup}
</head>
<body>
  <div id="root"></div>
  <div id="app"></div>
  ${scriptContent}
</body>
</html>
  `
}

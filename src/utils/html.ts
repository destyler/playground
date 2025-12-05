import type { File, Framework } from '../templates'
import type { ImportMap } from '../templates/types'
import { generateReactScript } from '../preview/react'
import { generateSolidScript } from '../preview/solid'
import { generateSvelteScript } from '../preview/svelte'
import { generateVueScript } from '../preview/vue'

// ============================================================================
// Constants
// ============================================================================

/**
 * Core dependencies for each framework (fixed, not user-modifiable)
 * These are essential runtime dependencies that must be present
 */
const CORE_IMPORTS: Readonly<Record<Framework, Record<string, string>>> = {
  vue: {
    vue: 'https://esm.sh/vue',
  },
  react: {
    'react': 'https://esm.sh/react',
    'react-dom': 'https://esm.sh/react-dom',
    'react-dom/client': 'https://esm.sh/react-dom/client',
  },
  solid: {
    'solid-js': 'https://esm.sh/solid-js',
    'solid-js/web': 'https://esm.sh/solid-js/web',
  },
  svelte: {
    svelte: 'https://esm.sh/svelte',
  },
}

/**
 * CDN scripts required for each framework's runtime
 */
const FRAMEWORK_CDNS: Readonly<Record<Framework, readonly string[]>> = {
  vue: [
    'https://unpkg.com/vue/dist/vue.global.js',
    'https://unpkg.com/vue3-sfc-loader/dist/vue3-sfc-loader.js',
  ],
  react: [],
  solid: [],
  svelte: [],
}

/**
 * Script generators for each framework
 */
const SCRIPT_GENERATORS: Readonly<Record<Framework, (serializedFiles: string) => string>> = {
  vue: generateVueScript,
  react: generateReactScript,
  solid: generateSolidScript,
  svelte: generateSvelteScript,
}

// ============================================================================
// Helper Functions
// ============================================================================

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
 * Core imports cannot be overridden by user
 */
function mergeImportMaps(
  coreImports: Record<string, string>,
  userImportMap?: ImportMap,
): ImportMap {
  const userImports = userImportMap?.imports ?? {}

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

// ============================================================================
// Main Export
// ============================================================================

/**
 * Generates the complete HTML document for the preview iframe
 *
 * @param framework - The current framework
 * @param files - Array of files to include
 * @param userImportMap - Optional user-defined import map
 * @returns Complete HTML string
 */
export function generateHtml(
  framework: Framework,
  files: File[],
  userImportMap?: object,
): string {
  const coreImports = CORE_IMPORTS[framework]
  const finalImportMap = mergeImportMaps(coreImports, userImportMap as ImportMap | undefined)
  const importMapScript = `<script type="importmap">${JSON.stringify(finalImportMap)}</script>`

  const cdnScripts = FRAMEWORK_CDNS[framework]
    .map(url => `<script src="${url}"></script>`)
    .join('\n')

  const serializedFiles = serializeFilesToMap(files)
  const errorHandling = createErrorHandlingScript()
  const scriptContent = SCRIPT_GENERATORS[framework](serializedFiles)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  ${importMapScript}
  ${errorHandling}
  ${cdnScripts}
</head>
<body>
  <div id="root"></div>
  <div id="app"></div>
  ${scriptContent}
</body>
</html>
  `
}

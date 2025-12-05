import type { File, Framework } from '../templates'
import { generateReactScript } from '../preview/react'
import { generateSolidScript } from '../preview/solid'
import { generateSvelteScript } from '../preview/svelte'
import { generateVueScript } from '../preview/vue'
import { FRAMEWORKS } from '../templates'

/**
 * Core dependencies for each framework (fixed, not user-modifiable)
 */
const CORE_IMPORTS: Record<Framework, Record<string, string>> = {
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

export function generateHtml(framework: Framework, files: File[], userImportMap?: object) {
  const config = FRAMEWORKS[framework]
  const cdns = config.cdn.slice()
  const cdnScripts = cdns.map((url: string) => `<script src="${url}"></script>`).join('\n')

  // Merge core imports with user imports
  // Core imports are fixed and cannot be overridden by user
  const coreImports = CORE_IMPORTS[framework]
  const userImports = (userImportMap as any)?.imports || {}

  // Filter out core dependencies from user imports (prevent override)
  const filteredUserImports: Record<string, string> = {}
  for (const [key, value] of Object.entries(userImports)) {
    if (!(key in coreImports)) {
      filteredUserImports[key] = value as string
    }
  }

  // Combine: core imports + user imports
  const finalImportMap = {
    imports: {
      ...coreImports,
      ...filteredUserImports,
    },
  }

  const importMapScript = `<script type="importmap">${JSON.stringify(finalImportMap)}</script>`

  const filesMap = files.reduce((acc, file) => {
    acc[file.name] = file.content
    return acc
  }, {} as Record<string, string>)

  const serializedFiles = JSON.stringify(filesMap).replace(/<\//g, '\\x3C/')

  const errorHandling = `
    <script>
      // Error overlay container
      window.__errorOverlay__ = null;

      function showError(message, stack) {
        // Create or reuse error overlay
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

      // Expose functions globally so update functions can call them
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

  let scriptContent = ''

  if (framework === 'vue') {
    scriptContent = generateVueScript(serializedFiles)
  }
  else if (framework === 'react') {
    scriptContent = generateReactScript(serializedFiles)
  }
  else if (framework === 'solid') {
    scriptContent = generateSolidScript(serializedFiles)
  }
  else if (framework === 'svelte') {
    scriptContent = generateSvelteScript(serializedFiles)
  }

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

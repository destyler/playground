import type { File, Framework } from '../templates'
import { generateReactScript } from '../preview/react'
import { generateSolidScript } from '../preview/solid'
import { generateSvelteScript } from '../preview/svelte'
import { generateVueScript } from '../preview/vue'
import { FRAMEWORKS } from '../templates'

export function generateHtml(framework: Framework, files: File[], importMap?: object) {
  const config = FRAMEWORKS[framework]

  // Parse import map to potentially override CDN versions
  let cdns = config.cdn.slice() // Clone the array
  const imports = (importMap as any)?.imports || {}

  // Extract version helper
  function extractVersion(url: string): string | null {
    const match = url.match(/@(\d+(?:\.\d+)?(?:\.\d+)?)/)
    return match ? match[1] : null
  }

  // For Vue, check if version is overridden in import map
  if (framework === 'vue' && imports.vue) {
    const version = extractVersion(imports.vue)
    if (version) {
      cdns = [
        `https://unpkg.com/vue@${version}/dist/vue.global.js`,
        'https://unpkg.com/vue3-sfc-loader/dist/vue3-sfc-loader.js',
      ]
    }
  }

  // For React, check if version is overridden in import map
  let reactVersion: string | null = null
  if (framework === 'react' && imports.react) {
    reactVersion = extractVersion(imports.react)
    if (reactVersion) {
      const majorVersion = Number.parseInt(reactVersion.split('.')[0], 10)
      // React 19+ uses ESM, so we don't need UMD CDNs
      if (majorVersion >= 19) {
        cdns = [] // ESM will be loaded in the script
      }
      else {
        cdns = [
          `https://unpkg.com/react@${reactVersion}/umd/react.development.js`,
          `https://unpkg.com/react-dom@${reactVersion}/umd/react-dom.development.js`,
          'https://unpkg.com/@babel/standalone/babel.min.js',
        ]
      }
    }
  }

  const cdnScripts = cdns.map((url: string) => `<script src="${url}"></script>`).join('\n')

  let scriptContent = ''

  // Generate import map script if provided
  const importMapScript = importMap
    ? `<script type="importmap">${JSON.stringify(importMap)}</script>`
    : ''

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

  if (framework === 'vue') {
    scriptContent = generateVueScript(serializedFiles)
  }
  else if (framework === 'react') {
    scriptContent = generateReactScript(serializedFiles, reactVersion || undefined)
  }
  else if (framework === 'solid') {
    const solidVersion = imports['solid-js'] ? extractVersion(imports['solid-js']) : null
    scriptContent = generateSolidScript(serializedFiles, solidVersion || undefined)
  }
  else if (framework === 'svelte') {
    const svelteVersion = imports.svelte ? extractVersion(imports.svelte) : null
    scriptContent = generateSvelteScript(serializedFiles, svelteVersion || undefined)
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

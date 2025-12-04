import type { File, Framework } from './templates/types'
import { generateReactScript } from '../workers/react'
import { generateSolidScript } from '../workers/solid'
import { generateSvelteScript } from '../workers/svelte'
import { generateVueScript } from '../workers/vue'
import { REACT_TEMPLATE } from './templates/react'
import { SOLID_TEMPLATE } from './templates/solid'
import { SVELTE_TEMPLATE } from './templates/svelte'
import { VUE_TEMPLATE } from './templates/vue'

export type { File, Framework }

export const FRAMEWORKS: Record<Framework, { name: string, color: string, cdn: string[], defaultFiles: File[] }> = {
  vue: VUE_TEMPLATE,
  react: REACT_TEMPLATE,
  solid: SOLID_TEMPLATE,
  svelte: SVELTE_TEMPLATE,
}

export function generateHtml(framework: Framework, files: File[]) {
  const config = FRAMEWORKS[framework]
  const cdns = config.cdn.map((url: string) => `<script src="${url}"></script>`).join('\n')

  let scriptContent = ''
  const extraSetup = ''

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
  ${extraSetup}
  ${errorHandling}
  ${cdns}
</head>
<body>
  <div id="root"></div>
  <div id="app"></div>
  ${scriptContent}
</body>
</html>
  `
}

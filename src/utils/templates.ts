import type { Framework, File } from './templates/types';
import { VUE_TEMPLATE, generateVueScript } from './templates/vue';
import { SOLID_TEMPLATE, generateSolidScript } from './templates/solid';
import { REACT_TEMPLATE, generateReactScript } from './templates/react';
import { SVELTE_TEMPLATE, generateSvelteScript } from './templates/svelte';

export type { Framework, File };

export const FRAMEWORKS: Record<Framework, { name: string; color: string; cdn: string[]; defaultFiles: File[] }> = {
  vue: VUE_TEMPLATE,
  react: REACT_TEMPLATE,
  solid: SOLID_TEMPLATE,
  svelte: SVELTE_TEMPLATE
};

export function generateHtml(framework: Framework, files: File[]) {
  const config = FRAMEWORKS[framework];
  const cdns = config.cdn.map((url: string) => `<script src="${url}"></script>`).join('\n');
  
  let scriptContent = '';
  let extraSetup = '';

  const filesMap = files.reduce((acc, file) => {
    acc[file.name] = file.content;
    return acc;
  }, {} as Record<string, string>);

  const serializedFiles = JSON.stringify(filesMap).replace(/<\//g, '\\x3C/');

  const errorHandling = `
    <script>
      window.onerror = function(msg, url, line, col, error) {
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:20px;background:#fff0f0;color:red;z-index:9999;border-bottom:1px solid red;font-family:monospace;';
        el.textContent = 'Error: ' + msg + '\\n' + (error ? error.stack : '');
        document.body.appendChild(el);
        console.error(error || msg);
        return false;
      };
      window.onunhandledrejection = function(e) {
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:20px;background:#fff0f0;color:red;z-index:9999;border-bottom:1px solid red;font-family:monospace;';
        el.textContent = 'Async Error: ' + e.reason;
        document.body.appendChild(el);
        console.error(e.reason);
      };
    </script>
  `;

  if (framework === 'vue') {
    scriptContent = generateVueScript(serializedFiles);
  } else if (framework === 'react') {
    scriptContent = generateReactScript(serializedFiles);
  } else if (framework === 'solid') {
    scriptContent = generateSolidScript(serializedFiles);
  } else if (framework === 'svelte') {
    scriptContent = generateSvelteScript(serializedFiles);
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; }
    .container { padding: 20px; border: 1px solid #eee; border-radius: 8px; }
    button { padding: 8px 16px; cursor: pointer; }
  </style>
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
  `;
}

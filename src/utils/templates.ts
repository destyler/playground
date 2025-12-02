
export type Framework = 'vue' | 'react' | 'solid' | 'svelte';

export interface File {
  name: string;
  content: string;
  active?: boolean;
}

export const FRAMEWORKS: Record<Framework, { name: string; color: string; cdn: string[]; defaultFiles: File[] }> = {
  vue: {
    name: 'Vue',
    color: '#42b883',
    cdn: [
      'https://unpkg.com/vue@3/dist/vue.global.js',
      'https://unpkg.com/vue3-sfc-loader/dist/vue3-sfc-loader.js'
    ],
    defaultFiles: [
      {
        name: 'App.vue',
        content: `<script setup>
import { ref } from 'vue'
import Comp from './Comp.vue'

const msg = ref('Hello World!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg">
  <Comp />
</template>`,
        active: true
      },
      {
        name: 'Comp.vue',
        content: `<template>
  <div class="comp">
    I am a component
  </div>
</template>

<style scoped>
.comp {
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
}
</style>`
      }
    ]
  },
  react: {
    name: 'React',
    color: '#61dafb',
    cdn: [
      'https://unpkg.com/react@18/umd/react.development.js',
      'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
      'https://unpkg.com/@babel/standalone/babel.min.js'
    ],
    defaultFiles: [
      {
        name: 'App.tsx',
        content: `import React, { useState } from 'react';
import Counter from './Counter';

export default function App() {
  return (
    <div className="container">
      <h1>React App</h1>
      <Counter />
    </div>
  );
}`,
        active: true
      },
      {
        name: 'Counter.tsx',
        content: `import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count is: {count}
    </button>
  );
}`
      }
    ]
  },
  solid: {
    name: 'Solid',
    color: '#2c4f7c',
    cdn: [],
    defaultFiles: [
      {
        name: 'App.tsx',
        content: `import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import html from 'solid-js/html';
import Counter from './Counter';

function App() {
  return html\`
    <div class="container">
      <h1>Solid App</h1>
      <\${Counter} />
    </div>
  \`;
}

render(() => html\`<\${App} />\`, document.getElementById('app'));`,
        active: true
      },
      {
        name: 'Counter.tsx',
        content: `import { createSignal } from 'solid-js';
import html from 'solid-js/html';

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return html\`
    <button onClick=\${() => setCount(c => c + 1)}>
      Count is: \${count()}
    </button>
  \`;
}`
      }
    ]
  },
  svelte: {
    name: 'Svelte',
    color: '#ff3e00',
    cdn: [],
    defaultFiles: [
      {
        name: 'App.svelte',
        content: `<script>
  import Counter from './Counter.svelte';
</script>

<div class="container">
  <h1>Svelte App</h1>
  <Counter />
</div>

<style>
  h1 { color: #ff3e00; }
</style>`,
        active: true
      },
      {
        name: 'Counter.svelte',
        content: `<script>
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Count is: {count}
</button>`
      }
    ]
  }
}

export function generateHtml(framework: Framework, files: File[]) {
  const config = FRAMEWORKS[framework];
  const cdns = config.cdn.map((url: string) => `<script src="${url}"></script>`).join('\n');
  
  let scriptContent = '';
  let extraSetup = '';

  const filesMap = files.reduce((acc, file) => {
    acc[file.name] = file.content;
    return acc;
  }, {} as Record<string, string>);

  if (framework === 'vue') {
    // Vue 3 SFC Loader approach
    scriptContent = `<script>
      const { loadModule } = window['vue3-sfc-loader'];
      
      const options = {
        moduleCache: {
          vue: Vue
        },
        async getFile(url) {
          const content = ${JSON.stringify(filesMap)}[url.replace(/^\\.\\//, '')];
          if (!content) throw new Error('File not found: ' + url);
          return content;
        },
        addStyle(textContent) {
          const style = document.createElement('style');
          style.textContent = textContent;
          const ref = document.head.getElementsByTagName('style')[0] || null;
          document.head.insertBefore(style, ref);
        },
      }
      
      Vue.createApp(Vue.defineAsyncComponent(() => loadModule('./App.vue', options)))
        .mount('#app');
    </script>`;
  } else if (framework === 'react') {
    // React with Babel Standalone and Import Maps (simulated via Blob URLs)
    // We need to transform all files and create Blob URLs
    scriptContent = `<script>
      (async () => {
        const files = ${JSON.stringify(filesMap)};
        const importMap = { imports: {} };
        
        // Helper to transform and create blob
        const processFile = (filename, content) => {
          // Simple transform for JSX
          const output = Babel.transform(content, {
            presets: ['react', 'env'],
            filename: filename
          }).code;
          
          const blob = new Blob([output], { type: 'text/javascript' });
          return URL.createObjectURL(blob);
        };

        // Process all files
        Object.entries(files).forEach(([name, content]) => {
          const blobUrl = processFile(name, content);
          importMap.imports['./' + name] = blobUrl;
          // Also map without extension if needed
          const nameNoExt = name.replace(/\\.[^/.]+$/, "");
          importMap.imports['./' + nameNoExt] = blobUrl;
        });

        // Inject Import Map
        const mapScript = document.createElement('script');
        mapScript.type = 'importmap';
        mapScript.textContent = JSON.stringify(importMap);
        document.head.appendChild(mapScript);

        // Load Entry
        const entryBlob = importMap.imports['./App.tsx'] || importMap.imports['./App'];
        import(entryBlob).then(m => {
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(m.default));
        });
      })();
    </script>`;
  } else if (framework === 'solid') {
    scriptContent = `<script>
      (async () => {
        const files = ${JSON.stringify(filesMap)};
        const importMap = { 
          imports: {
            "solid-js": "https://esm.sh/solid-js@1.8.16",
            "solid-js/web": "https://esm.sh/solid-js@1.8.16/web",
            "solid-js/html": "https://esm.sh/solid-js@1.8.16/html?deps=solid-js@1.8.16,solid-js@1.8.16/web"
          } 
        };

        // Create Blobs for all files
        Object.entries(files).forEach(([name, content]) => {
          const blob = new Blob([content], { type: 'text/javascript' });
          const url = URL.createObjectURL(blob);
          importMap.imports['./' + name] = url;
          const nameNoExt = name.replace(/\\.[^/.]+$/, "");
          importMap.imports['./' + nameNoExt] = url;
        });

        // Inject Import Map
        const mapScript = document.createElement('script');
        mapScript.type = 'importmap';
        mapScript.textContent = JSON.stringify(importMap);
        document.head.appendChild(mapScript);

        // Load Entry
        import('./App.tsx');
      })();
    </script>`;
  } else if (framework === 'svelte') {
    scriptContent = `<script>
      (async () => {
        const svelte = await import('https://esm.sh/svelte@4.2.12/compiler');
        const files = ${JSON.stringify(filesMap)};
        const importMap = { 
          imports: {
            "svelte/internal": "https://esm.sh/svelte@4.2.12/internal",
            "svelte/internal/disclose-version": "https://esm.sh/svelte@4.2.12/internal/disclose-version",
            "svelte/store": "https://esm.sh/svelte@4.2.12/store",
            "svelte": "https://esm.sh/svelte@4.2.12"
          } 
        };
        const { compile } = svelte;

        // Compile all files
        for (const [name, content] of Object.entries(files)) {
          if (name.endsWith('.svelte')) {
             try {
              const { js, css } = compile(content, {
                css: 'injected',
                name: name.replace('.svelte', ''),
                format: 'esm'
              });
              
              // Inject CSS
              if (css.code) {
                const style = document.createElement('style');
                style.textContent = css.code;
                document.head.appendChild(style);
              }

              const blob = new Blob([js.code], { type: 'text/javascript' });
              const url = URL.createObjectURL(blob);
              importMap.imports['./' + name] = url;
            } catch (e) {
              console.error('Error compiling ' + name, e);
            }
          } else {
             // JS files
             const blob = new Blob([content], { type: 'text/javascript' });
             const url = URL.createObjectURL(blob);
             importMap.imports['./' + name] = url;
          }
        }

        // Inject Import Map
        const mapScript = document.createElement('script');
        mapScript.type = 'importmap';
        mapScript.textContent = JSON.stringify(importMap);
        document.head.appendChild(mapScript);

        // Load Entry
        import('./App.svelte').then(module => {
           new module.default({ target: document.getElementById('app') });
        });
      })();
    </script>`;
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

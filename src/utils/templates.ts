
export type Framework = 'vue' | 'react' | 'solid' | 'svelte';

export const FRAMEWORKS: Record<Framework, { name: string; color: string; cdn: string[]; defaultCode: string }> = {
  vue: {
    name: 'Vue',
    color: '#42b883',
    cdn: [
      'https://unpkg.com/vue@3/dist/vue.global.js'
    ],
    defaultCode: `const { createApp, ref } = Vue

createApp({
  setup() {
    const count = ref(0)
    return { count }
  },
  template: \`
    <div class="container">
      <h1>Vue Counter</h1>
      <button @click="count++">Count is: {{ count }}</button>
    </div>
  \`
}).mount('#app')`
  },
  react: {
    name: 'React',
    color: '#61dafb',
    cdn: [
      'https://unpkg.com/react@18/umd/react.development.js',
      'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
      'https://unpkg.com/@babel/standalone/babel.min.js'
    ],
    defaultCode: `const { useState } = React;

function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="container">
      <h1>React Counter</h1>
      <button onClick={() => setCount(count + 1)}>
        Count is: {count}
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
  },
  solid: {
    name: 'Solid',
    color: '#2c4f7c',
    cdn: [],
    defaultCode: `import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import html from 'solid-js/html';

function App() {
  const [count, setCount] = createSignal(0);
  return html\`
    <div class="container">
      <h1>Solid Counter</h1>
      <button onClick=\${() => setCount(c => c + 1)}>
        Count is: \${count()}
      </button>
    </div>
  \`;
}

render(() => html\`<\${App} />\`, document.getElementById('app'));`
  },
  svelte: {
    name: 'Svelte',
    color: '#ff3e00',
    cdn: [],
    defaultCode: `<script>
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<div class="container">
  <h1>Svelte Counter</h1>
  <button on:click={increment}>
    Count is: {count}
  </button>
</div>

<style>
  h1 { color: #ff3e00; }
</style>`
  }
}

export function generateHtml(framework: Framework, code: string) {
  const config = FRAMEWORKS[framework];
  const cdns = config.cdn.map((url: string) => `<script src="${url}"></script>`).join('\n');
  
  let scriptContent = '';
  let extraSetup = '';

  if (framework === 'react') {
    scriptContent = `<script type="text/babel">
      ${code}
    </script>`;
  } else if (framework === 'vue') {
    scriptContent = `<script>
      ${code}
    </script>`;
  } else if (framework === 'solid') {
    extraSetup = `<script type="importmap">
      {
        "imports": {
          "solid-js": "https://esm.sh/solid-js@1.8.16",
          "solid-js/web": "https://esm.sh/solid-js@1.8.16/web",
          "solid-js/html": "https://esm.sh/solid-js@1.8.16/html?deps=solid-js@1.8.16,solid-js@1.8.16/web"
        }
      }
    </script>`;
    scriptContent = `<script type="module">
      ${code}
    </script>`;
  } else if (framework === 'svelte') {
    // Svelte compilation logic inside the iframe
    // We need to escape </script> tags in the source code to prevent breaking the parent script tag
    const safeSource = JSON.stringify(code).replace(/<\/script>/g, '<\\/script>');
    
    scriptContent = `<script type="module">
      import * as svelte from 'https://esm.sh/svelte@4.2.12/compiler';

      (async () => {
        try {
          const { compile } = svelte;
          const source = ${safeSource};
          const { js, css } = compile(source, {
            css: 'injected',
            name: 'App',
            format: 'esm' // Use ESM format
          });
          
          // Inject CSS
          if (css.code) {
            const style = document.createElement('style');
            style.textContent = css.code;
            document.head.appendChild(style);
          }

          const blob = new Blob([js.code], { type: 'text/javascript' });
          const url = URL.createObjectURL(blob);
          
          import(url).then(module => {
            new module.default({ target: document.getElementById('app') });
          });
          
        } catch (e) {
          document.body.innerHTML = '<pre style="color:red">' + e.message + '</pre>';
        }
      })();
    </script>`;
    
    // Add import map for Svelte ESM
    extraSetup = `<script type="importmap">
      {
        "imports": {
          "svelte/internal": "https://esm.sh/svelte@4.2.12/internal",
          "svelte/internal/disclose-version": "https://esm.sh/svelte@4.2.12/internal/disclose-version",
          "svelte/store": "https://esm.sh/svelte@4.2.12/store",
          "svelte": "https://esm.sh/svelte@4.2.12"
        }
      }
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

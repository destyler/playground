import type { File } from './types'

export const SVELTE_TEMPLATE: { name: string, color: string, cdn: string[], defaultFiles: File[] } = {
  name: 'Svelte',
  color: '#ff3e00',
  cdn: [
    'https://unpkg.com/@babel/standalone/babel.min.js',
  ],
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
      active: true,
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
</button>`,
    },
  ],
}

export function generateSvelteScript(serializedFiles: string) {
  return `
    <script type="module">
      import * as Svelte from "https://esm.sh/svelte@4.2.12";
      import * as SvelteInternal from "https://esm.sh/svelte@4.2.12/internal?deps=svelte@4.2.12";
      import * as SvelteStore from "https://esm.sh/svelte@4.2.12/store?deps=svelte@4.2.12";
      
      window.Svelte = Svelte;
      window.SvelteInternal = SvelteInternal;
      window.SvelteStore = SvelteStore;
      
      if (window.startApp) window.startApp();
    </script>
    <script>
      window.startApp = async function() {
        if (!window.Svelte) return;

        const svelte = await import('https://esm.sh/svelte@4.2.12/compiler');
        const { compile } = svelte;
        
        let app = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};
        
        const modules = {
          'svelte': window.Svelte,
          'svelte/internal': window.SvelteInternal,
          'svelte/store': window.SvelteStore,
          'svelte/internal/disclose-version': { default: () => {} }
        };

        function require(id) {
          if (modules[id]) return modules[id];
          if (id.startsWith('./')) {
             const name = id.replace('./', '').replace(/\\.(svelte|js|ts)$/, '');
             const filename = Object.keys(window.__FILES__).find(k => k.replace(/\\.(svelte|js|ts)$/, '') === name);
             if (!filename) throw new Error('File not found: ' + id);
             
             if (window.__COMPILED_FILES__[filename]) {
               return window.__COMPILED_FILES__[filename].exports;
             }
             
             const code = window.__COMPILED_FILES__[filename + '_code'];
             if (!code) throw new Error('Module not compiled: ' + filename);
             
             const module = { exports: {} };
             const fn = new Function('require', 'module', 'exports', code);
             fn(require, module, module.exports);
             
             window.__COMPILED_FILES__[filename] = module;
             return module.exports;
          }
          throw new Error('Module not found: ' + id);
        }

        async function update(files) {
          if (files) window.__FILES__ = files;
          
          if (app) {
            app.$destroy();
            app = null;
          }
          document.getElementById('app').innerHTML = '';
          window.__COMPILED_FILES__ = {};

          // Compile all files
          for (const [name, content] of Object.entries(window.__FILES__)) {
             if (name.endsWith('.svelte')) {
               try {
                 const { js } = compile(content, {
                   css: 'injected',
                   name: name.replace('.svelte', ''),
                   filename: name
                 });
                 
                 // Svelte 4 outputs ESM, so we need to transform it to CJS
                 const cjsOutput = Babel.transform(js.code, {
                   presets: [['env', { modules: 'commonjs' }]],
                   filename: name + '.js'
                 }).code;

                 window.__COMPILED_FILES__[name + '_code'] = cjsOutput;
               } catch (e) {
                 console.error('Error compiling ' + name, e);
                 throw e;
               }
             } else {
               // JS files
               try {
                 const output = Babel.transform(content, {
                   presets: [['env', { modules: 'commonjs' }]],
                   filename: name
                 }).code;
                 window.__COMPILED_FILES__[name + '_code'] = output;
               } catch (e) {
                 console.error('Error compiling ' + name, e);
                 throw e;
               }
             }
          }

          // Mount
          try {
            const App = require('./App.svelte').default;
            app = new App({ target: document.getElementById('app') });
          } catch (e) {
            console.error('Runtime error', e);
            throw e;
          }
        }

        update();
        
        window.addEventListener('message', (e) => {
          if (e.data.type === 'UPDATE_FILES') {
            update(e.data.files);
          }
        });
      };
      
      if (window.Svelte) window.startApp();
    </script>`
}

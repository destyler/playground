import type { File } from './types';

export const SOLID_TEMPLATE: { name: string; color: string; cdn: string[]; defaultFiles: File[] } = {
  name: 'Solid',
  color: '#2c4f7c',
  cdn: [
    'https://unpkg.com/@babel/standalone/babel.min.js'
  ],
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
};

export const generateSolidScript = (serializedFiles: string) => `
    <script type="module">
      import * as SolidJS from "https://esm.sh/solid-js@1.8.16";
      import * as SolidWeb from "https://esm.sh/solid-js@1.8.16/web";
      import SolidHTML from "https://esm.sh/solid-js@1.8.16/html?deps=solid-js@1.8.16,solid-js@1.8.16/web";

      window.SolidJS = SolidJS;
      window.SolidWeb = SolidWeb;
      window.SolidHTML = SolidHTML;
      
      if (window.startApp) window.startApp();
    </script>
    <script>
      window.startApp = function() {
        if (!window.SolidJS) return; // Wait for module load
        
        let dispose = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};
        
        // SolidHTML is likely the default export from the module
        const htmlFn = window.SolidHTML.default || window.SolidHTML;

        const modules = {
          'solid-js': window.SolidJS,
          'solid-js/web': window.SolidWeb,
          'solid-js/html': htmlFn // Directly expose the function as the module export
        };

        function require(id) {
          if (modules[id]) return modules[id];
          if (id.startsWith('./')) {
             const name = id.replace('./', '').replace(/\\.(tsx|ts|jsx|js)$/, '');
             const filename = Object.keys(window.__FILES__).find(k => k.replace(/\\.(tsx|ts|jsx|js)$/, '') === name);
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
          // Fallback for solid-js/html if it's imported as default
          if (id === 'solid-js/html') return modules['solid-js/html'];
          
          throw new Error('Module not found: ' + id);
        }

        async function update(files) {
          if (files) window.__FILES__ = files;
          
          if (dispose) {
            dispose();
            dispose = null;
          }
          document.getElementById('app').innerHTML = '';
          window.__COMPILED_FILES__ = {};

          // Compile all files
          for (const [name, content] of Object.entries(window.__FILES__)) {
             try {
               const output = Babel.transform(content, {
                 presets: [['env', { modules: 'commonjs' }]],
                 filename: name
               }).code;
               window.__COMPILED_FILES__[name + '_code'] = output;
             } catch (e) {
               console.error('Compilation error in ' + name, e);
               throw e;
             }
          }

          // Mount
          try {
            // Patch render to capture dispose
            const originalRender = window.SolidWeb.render;
            window.SolidWeb.render = (code, element) => {
               dispose = originalRender(code, element);
               return dispose;
            };
            
            require('./App');
            
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
      
      if (window.SolidJS) window.startApp();
    </script>`;

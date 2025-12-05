/**
 * React Preview Runtime Script Generator
 *
 * Generates the runtime script for React component compilation and mounting
 * in the preview iframe. Uses Babel for runtime JSX/TypeScript transformation.
 *
 * @module preview/react
 */



/**
 * Generates the React preview runtime script
 *
 * @param serializedFiles - JSON serialized file contents
 * @returns HTML script tags for React runtime
 */
export function generateReactScript(serializedFiles: string) {
  return `
    <script type="module">
      import * as React from "https://esm.sh/react";
      import * as ReactDOM from "https://esm.sh/react-dom";
      import * as ReactDOMClient from "https://esm.sh/react-dom/client";

      window.React = React;
      window.ReactDOM = ReactDOM;
      window.ReactDOMClient = ReactDOMClient;

      if (window.Babel) window.startReactApp();
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js" onload="if(window.React) window.startReactApp()"></script>
    <script>
      window.process = { env: { NODE_ENV: 'development' } };

      window.startReactApp = function() {
        if (!window.React || !window.Babel) return;

        let root = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};

        const modules = {
          'react': window.React,
          'react-dom/client': window.ReactDOMClient,
          'react-dom': window.ReactDOM
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
          throw new Error('Module not found: ' + id);
        }

        async function update(files) {
          if (window.__clearError__) window.__clearError__();
          if (files) window.__FILES__ = files;

          if (root) {
            root.unmount();
            root = null;
          }
          document.getElementById('root').innerHTML = '';
          window.__COMPILED_FILES__ = {};

          for (const [name, content] of Object.entries(window.__FILES__)) {
             try {
               const output = Babel.transform(content, {
                 presets: ['react', 'env'],
                 filename: name
               }).code;
               window.__COMPILED_FILES__[name + '_code'] = output;
             } catch (e) {
               console.error('Compilation error in ' + name, e);
               if (window.__showError__) {
                 window.__showError__('Compilation error in ' + name + ': ' + e.message, e.stack);
               }
               return;
             }
          }

          try {
            const App = require('./App').default;
            root = window.ReactDOMClient.createRoot(document.getElementById('root'));
            root.render(window.React.createElement(App));
          } catch (e) {
            console.error('Runtime error', e);
            if (window.__showError__) {
              window.__showError__('Runtime error: ' + e.message, e.stack);
            }
          }
        }

        update();

        window.addEventListener('message', (e) => {
          if (e.data.type === 'UPDATE_FILES') {
            update(e.data.files);
          }
        });
      };
    </script>`
}

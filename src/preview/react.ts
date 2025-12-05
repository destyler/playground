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
 * @param serializedImportMap - Optional import map for external modules
 * @returns HTML script tags for React runtime
 */
export function generateReactScript(serializedFiles: string, serializedImportMap?: string) {
  const importMapData = serializedImportMap || '{}'

  return `
    <script type="module">
      import * as React from "react";
      import * as ReactDOM from "react-dom";
      import * as ReactDOMClient from "react-dom/client";

      window.React = React;
      window.ReactDOM = ReactDOM;
      window.ReactDOMClient = ReactDOMClient;

      if (window.Babel) window.startReactApp();
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js" onload="if(window.React) window.startReactApp()"></script>
    <script>
      window.process = { env: { NODE_ENV: 'development' } };

      const importMapData = ${importMapData};
      const externalModules = importMapData.imports || {};

      // Pre-loaded external modules cache
      window.__EXTERNAL_MODULES__ = {};

      // Pre-load external modules
      async function preloadExternalModules() {
        for (const [moduleName, moduleUrl] of Object.entries(externalModules)) {
          // Skip core React modules
          if (moduleName === 'react' || moduleName.startsWith('react-dom')) continue;

          try {
            console.log('[React Playground] Pre-loading:', moduleName, 'from', moduleUrl);
            const module = await import(moduleUrl);
            console.log('[React Playground] Raw module:', moduleName, module);

            // Handle different module export formats
            // Babel compiles "import X from 'pkg'" to "require('pkg').default"
            // So we need to ensure .default is properly set

            let normalizedModule;

            if (typeof module.default === 'function') {
              // Module has a function as default export (like dayjs)
              // Create a callable wrapper that also has all properties
              normalizedModule = function(...args) {
                return module.default(...args);
              };
              // Copy all properties
              Object.keys(module).forEach(key => {
                normalizedModule[key] = module[key];
              });
              // Ensure default points to the function
              normalizedModule.default = module.default;
            } else if (module.default !== undefined) {
              // Module has a non-function default export
              normalizedModule = { ...module };
            } else {
              // Module only has named exports, no default
              // Create a module object with default pointing to the whole module
              normalizedModule = { ...module, default: module };
            }

            window.__EXTERNAL_MODULES__[moduleName] = normalizedModule;
            console.log('[React Playground] Normalized module:', moduleName, 'default:', typeof normalizedModule.default);
          } catch (e) {
            console.error('[React Playground] Failed to load:', moduleName, e);
          }
        }
      }

      window.startReactApp = async function() {
        if (!window.React || !window.Babel) return;

        // Pre-load external modules first
        await preloadExternalModules();

        let root = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};

        const modules = {
          'react': window.React,
          'react-dom/client': window.ReactDOMClient,
          'react-dom': window.ReactDOM,
          ...window.__EXTERNAL_MODULES__
        };

        function require(id) {
          // Check built-in and external modules
          if (modules[id]) return modules[id];

          // Handle local file imports
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

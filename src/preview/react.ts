/**
 * React Preview Runtime Script Generator
 *
 * Generates the runtime script for React component compilation and mounting
 * in the preview iframe. Uses Babel for runtime JSX/TypeScript transformation.
 *
 * @module preview/react
 */

import { generateRuntimeHelpers } from './runtime-helpers'

/**
 * Generates the React preview runtime script
 *
 * @param serializedFiles - JSON serialized file contents
 * @param serializedImportMap - Optional import map for external modules
 * @param destylerVersion - Selected destyler version (pins esm.sh URLs when not latest)
 * @returns HTML script tags for React runtime
 */
export function generateReactScript(serializedFiles: string, serializedImportMap?: string, destylerVersion: string = 'latest') {
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
      ${generateRuntimeHelpers(destylerVersion, ['react', 'react-dom', 'react-dom/client'])}

      window.__EXTERNAL_MODULES__ = {};

      function normalizeReactModule(module) {
        let normalizedModule;
        if (typeof module.default === 'function') {
          normalizedModule = function(...args) {
            return module.default(...args);
          };
          Object.keys(module).forEach(key => {
            normalizedModule[key] = module[key];
          });
          normalizedModule.default = module.default;
        } else if (module.default !== undefined) {
          normalizedModule = { ...module };
        } else {
          normalizedModule = { ...module, default: module };
        }
        return normalizedModule;
      }

      async function loadExternalModule(moduleName) {
        if (window.__EXTERNAL_MODULES__[moduleName]) {
          return window.__EXTERNAL_MODULES__[moduleName];
        }
        const moduleUrl = resolveExternalUrl(moduleName);
        if (!moduleUrl) return null;
        const module = await import(moduleUrl);
        const normalized = normalizeReactModule(module);
        window.__EXTERNAL_MODULES__[moduleName] = normalized;
        return normalized;
      }

      async function preloadExternalModules(fileMap) {
        const names = collectPreloadNames(fileMap);
        await runPool(names, PRELOAD_CONCURRENCY, loadExternalModule);
      }

      window.startReactApp = async function() {
        if (!window.React || !window.Babel) return;
        if (window.__PLAYGROUND_STARTED__) return;
        window.__PLAYGROUND_STARTED__ = true;

        let root = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};

        await preloadExternalModules(window.__FILES__);

        const modules = {
          'react': window.React,
          'react-dom/client': window.ReactDOMClient,
          'react-dom': window.ReactDOM,
          ...window.__EXTERNAL_MODULES__
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
          const generation = beginPreviewUpdate();
          if (files) window.__FILES__ = files;
          const nextFiles = window.__FILES__;

          await preloadExternalModules(nextFiles);
          if (!isCurrentPreviewUpdate(generation)) return;

          if (window.__clearError__) window.__clearError__();
          Object.assign(modules, window.__EXTERNAL_MODULES__);

          if (root) {
            root.unmount();
            root = null;
          }
          document.getElementById('root').innerHTML = '';
          window.__COMPILED_FILES__ = {};

          for (const [name, content] of Object.entries(nextFiles)) {
             if (!/\\.(tsx|ts|jsx|js)$/.test(name) || name === 'uno.config.ts') continue;
             try {
               const output = Babel.transform(content, {
                 presets: [
                   ['typescript', { onlyRemoveTypeImports: true }],
                   ['react', { runtime: 'classic' }],
                 ],
                 plugins: [['transform-modules-commonjs']],
                 filename: name,
                 sourceType: 'module',
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

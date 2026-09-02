/**
 * Svelte Preview Runtime Script Generator
 *
 * Generates the runtime script for Svelte 5 component compilation and mounting
 * in the preview iframe. Uses Svelte compiler with runes support and Babel
 * for TypeScript preprocessing.
 *
 * @module preview/svelte
 */

import { generateRuntimeHelpers } from './runtime-helpers'

/**
 * Generates the Svelte preview runtime script
 *
 * Features:
 * - Svelte 5 runes support
 * - TypeScript preprocessing in script blocks
 * - CSS injection
 * - Hot module replacement via message events
 *
 * @param serializedFiles - JSON serialized file contents
 * @param serializedImportMap - Optional import map for external modules
 * @param destylerVersion - Selected destyler version (pins esm.sh URLs when not latest)
 * @returns HTML script tags for Svelte runtime
 */
export function generateSvelteScript(serializedFiles: string, serializedImportMap?: string, destylerVersion: string = 'latest') {
  const importMapData = serializedImportMap || '{}'

  return `
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="module">
      import { compile } from "svelte/compiler";
      import * as Svelte from "svelte";
      import * as SvelteInternal from "svelte/internal/client";

      window.svelteCompile = compile;
      window.Svelte = Svelte;
      window.SvelteInternal = SvelteInternal;

      if (window.Babel) window.startApp();
    </script>
    <script>
      const importMapData = ${importMapData};
      const externalModules = importMapData.imports || {};
      ${generateRuntimeHelpers(destylerVersion)}

      window.__EXTERNAL_MODULES__ = {};

      function wrapModule(mod) {
        if (!mod || typeof mod !== 'object') return mod;
        if (mod.__esModule) return mod;
        return Object.assign({ __esModule: true }, mod);
      }

      function normalizeSvelteModule(module) {
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
        return wrapModule(normalizedModule);
      }

      async function loadExternalModule(moduleName) {
        if (window.__EXTERNAL_MODULES__[moduleName]) {
          return window.__EXTERNAL_MODULES__[moduleName];
        }
        const moduleUrl = resolveExternalUrl(moduleName);
        if (!moduleUrl) return null;
        const module = await import(moduleUrl);
        const normalized = normalizeSvelteModule(module);
        window.__EXTERNAL_MODULES__[moduleName] = normalized;
        return normalized;
      }

      async function preloadExternalModules(fileMap) {
        const names = collectPreloadNames(fileMap);
        await runPool(names, PRELOAD_CONCURRENCY, loadExternalModule);
      }

      window.startApp = async function() {
        if (!window.svelteCompile || !window.Babel) return;

        let app = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};

        await preloadExternalModules(window.__FILES__);

        const modules = {
          'svelte': wrapModule(window.Svelte),
          'svelte/internal/client': wrapModule(window.SvelteInternal),
          'svelte/internal/disclose-version': { __esModule: true },
          ...Object.fromEntries(
            Object.entries(window.__EXTERNAL_MODULES__).map(([k, v]) => [k, wrapModule(v)])
          )
        };

        const loadingModules = new Set();

        function require(id) {
          if (modules[id]) return modules[id];

          if (id.startsWith('./')) {
             let moduleName = id.replace('./', '');

             const filename = Object.keys(window.__FILES__).find(k => {
               const baseName = k.replace(/\\.(svelte|js|ts)$/, '');
               const requestedBase = moduleName.replace(/\\.(svelte|js|ts)$/, '');
               return baseName === requestedBase;
             });

             if (!filename) {
               throw new Error('File not found: ' + id);
             }

             if (window.__COMPILED_FILES__[filename] && window.__COMPILED_FILES__[filename].exports) {
               return window.__COMPILED_FILES__[filename].exports;
             }

             if (loadingModules.has(filename)) {
               console.warn('Circular dependency detected:', filename);
               return window.__COMPILED_FILES__[filename]?.exports || {};
             }

             const code = window.__COMPILED_FILES__[filename + '_code'];
             if (!code) {
               throw new Error('Module not compiled: ' + filename);
             }

             loadingModules.add(filename);

             const module = { exports: {} };
             window.__COMPILED_FILES__[filename] = module;

             try {
               const fn = new Function('require', 'module', 'exports', code);
               fn(require, module, module.exports);
             } finally {
               loadingModules.delete(filename);
             }

             return module.exports;
          }

          throw new Error('Module not found: ' + id);
        }

        function preprocessSvelteTypeScript(content) {
          const scriptRegex = /<script([^>]*lang=["']ts["'][^>]*)>([\\s\\S]*?)<\\/script>/gi;

          return content.replace(scriptRegex, (match, attrs, scriptContent) => {
            try {
              const strippedCode = Babel.transform(scriptContent, {
                presets: [['typescript', { onlyRemoveTypeImports: true }]],
                filename: 'script.ts',
                retainLines: true,
              }).code;

              const newAttrs = attrs.replace(/lang=["']ts["']/g, '').trim();
              return '<script' + (newAttrs ? ' ' + newAttrs : '') + '>' + strippedCode + '<\\/script>';
            } catch (e) {
              console.error('Error preprocessing TypeScript in Svelte file:', e);
              return match;
            }
          });
        }

        async function update(files) {
          if (window.__clearError__) window.__clearError__();

          if (files) window.__FILES__ = files;

          await preloadExternalModules(window.__FILES__);
          Object.assign(modules, Object.fromEntries(
            Object.entries(window.__EXTERNAL_MODULES__).map(([k, v]) => [k, wrapModule(v)])
          ));

          if (app) {
            if (typeof app === 'function') {
              app();
            } else if (app.$destroy) {
              app.$destroy();
            }
            app = null;
          }
          document.getElementById('app').innerHTML = '';
          window.__COMPILED_FILES__ = {};

          for (const [name, content] of Object.entries(window.__FILES__)) {
             if (name.endsWith('.svelte')) {
               try {
                 const preprocessedContent = preprocessSvelteTypeScript(content);
                 const { js } = window.svelteCompile(preprocessedContent, {
                   css: 'injected',
                   name: name.replace('.svelte', ''),
                   filename: name,
                   generate: 'client',
                   runes: true,
                 });

                 const cjsOutput = Babel.transform(js.code, {
                   presets: [['env', { modules: 'commonjs' }]],
                   filename: name + '.js'
                 }).code;

                 window.__COMPILED_FILES__[name + '_code'] = cjsOutput;
               } catch (e) {
                 console.error('Error compiling ' + name, e);
                 if (window.__showError__) {
                   window.__showError__('Compilation error in ' + name + ': ' + e.message, e.stack);
                 }
                 return;
               }
             } else if (name.endsWith('.ts')) {
               try {
                 const jsCode = Babel.transform(content, {
                   presets: ['typescript'],
                   filename: name,
                 }).code;

                 const output = Babel.transform(jsCode, {
                   presets: [['env', { modules: 'commonjs' }]],
                   filename: name.replace('.ts', '.js')
                 }).code;
                 window.__COMPILED_FILES__[name + '_code'] = output;
               } catch (e) {
                 console.error('Error compiling ' + name, e);
                 if (window.__showError__) {
                   window.__showError__('Compilation error in ' + name + ': ' + e.message, e.stack);
                 }
                 return;
               }
             } else {
               try {
                 const output = Babel.transform(content, {
                   presets: [['env', { modules: 'commonjs' }]],
                   filename: name
                 }).code;
                 window.__COMPILED_FILES__[name + '_code'] = output;
               } catch (e) {
                 console.error('Error compiling ' + name, e);
                 if (window.__showError__) {
                   window.__showError__('Compilation error in ' + name + ': ' + e.message, e.stack);
                 }
                 return;
               }
             }
          }

          try {
            const App = require('./App.svelte').default;
            const { mount } = window.Svelte;
            if (mount) {
              app = mount(App, { target: document.getElementById('app') });
            } else {
              app = new App({ target: document.getElementById('app') });
            }
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

      if (window.svelteCompile && window.Babel) window.startApp();
    </script>`
}

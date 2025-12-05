/**
 * Svelte Preview Runtime Script Generator
 *
 * Generates the runtime script for Svelte 5 component compilation and mounting
 * in the preview iframe. Uses Svelte compiler with runes support and Babel
 * for TypeScript preprocessing.
 *
 * @module preview/svelte
 */

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
 * @returns HTML script tags for Svelte runtime
 */
export function generateSvelteScript(serializedFiles: string, serializedImportMap?: string) {
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

      // Pre-loaded external modules cache
      window.__EXTERNAL_MODULES__ = {};

      // Pre-load external modules
      async function preloadExternalModules() {
        for (const [moduleName, moduleUrl] of Object.entries(externalModules)) {
          // Skip core Svelte modules
          if (moduleName === 'svelte' || moduleName.startsWith('svelte/')) continue;

          try {
            console.log('[Svelte Playground] Pre-loading:', moduleName, 'from', moduleUrl);
            const module = await import(moduleUrl);
            console.log('[Svelte Playground] Raw module:', moduleName, module);

            // Handle different module export formats
            let normalizedModule;

            if (typeof module.default === 'function') {
              // Module has a function as default export (like dayjs)
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

            window.__EXTERNAL_MODULES__[moduleName] = normalizedModule;
            console.log('[Svelte Playground] Normalized module:', moduleName, 'default:', typeof normalizedModule.default);
          } catch (e) {
            console.error('[Svelte Playground] Failed to load:', moduleName, e);
          }
        }
      }

      window.startApp = async function() {
        if (!window.svelteCompile || !window.Babel) return;

        // Pre-load external modules first
        await preloadExternalModules();

        let app = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};

        // Wrap modules with __esModule marker to ensure Babel's _interopRequireWildcard works correctly
        function wrapModule(mod) {
          if (!mod || typeof mod !== 'object') return mod;
          if (mod.__esModule) return mod;
          return Object.assign({ __esModule: true }, mod);
        }

        const modules = {
          'svelte': wrapModule(window.Svelte),
          'svelte/internal/client': wrapModule(window.SvelteInternal),
          'svelte/internal/disclose-version': { __esModule: true },
          ...Object.fromEntries(
            Object.entries(window.__EXTERNAL_MODULES__).map(([k, v]) => [k, wrapModule(v)])
          )
        };

        // Track which modules are currently being loaded to detect circular deps
        const loadingModules = new Set();

        function require(id) {
          // Handle built-in modules
          if (modules[id]) return modules[id];

          // Handle relative imports
          if (id.startsWith('./')) {
             // Normalize the module name
             let moduleName = id.replace('./', '');

             // Find the actual filename
             const filename = Object.keys(window.__FILES__).find(k => {
               const baseName = k.replace(/\\.(svelte|js|ts)$/, '');
               const requestedBase = moduleName.replace(/\\.(svelte|js|ts)$/, '');
               return baseName === requestedBase;
             });

             if (!filename) {
               throw new Error('File not found: ' + id);
             }

             // Return cached module if already loaded
             if (window.__COMPILED_FILES__[filename] && window.__COMPILED_FILES__[filename].exports) {
               return window.__COMPILED_FILES__[filename].exports;
             }

             // Check for circular dependency
             if (loadingModules.has(filename)) {
               console.warn('Circular dependency detected:', filename);
               return window.__COMPILED_FILES__[filename]?.exports || {};
             }

             const code = window.__COMPILED_FILES__[filename + '_code'];
             if (!code) {
               throw new Error('Module not compiled: ' + filename);
             }

             // Mark as loading
             loadingModules.add(filename);

             // Create module object
             const module = { exports: {} };
             window.__COMPILED_FILES__[filename] = module;

             try {
               // Execute the module code
               const fn = new Function('require', 'module', 'exports', code);
               fn(require, module, module.exports);
             } finally {
               // Unmark loading
               loadingModules.delete(filename);
             }

             return module.exports;
          }

          throw new Error('Module not found: ' + id);
        }

        // Preprocess Svelte file to strip TypeScript from <script lang="ts"> blocks
        function preprocessSvelteTypeScript(content) {
          // Match script tags with lang="ts" or lang='ts'
          const scriptRegex = /<script([^>]*lang=["']ts["'][^>]*)>([\\s\\S]*?)<\\/script>/gi;

          return content.replace(scriptRegex, (match, attrs, scriptContent) => {
            try {
              // Use Babel to strip TypeScript type annotations
              // Important: set onlyRemoveTypeImports to preserve value imports
              const strippedCode = Babel.transform(scriptContent, {
                presets: [['typescript', { onlyRemoveTypeImports: true }]],
                filename: 'script.ts',
                retainLines: true,
              }).code;

              // Remove lang="ts" from the script tag
              const newAttrs = attrs.replace(/lang=["']ts["']/g, '').trim();
              return '<script' + (newAttrs ? ' ' + newAttrs : '') + '>' + strippedCode + '<\\/script>';
            } catch (e) {
              console.error('Error preprocessing TypeScript in Svelte file:', e);
              // Return original if preprocessing fails
              return match;
            }
          });
        }

        async function update(files) {
          // Clear any previous errors
          if (window.__clearError__) window.__clearError__();

          if (files) window.__FILES__ = files;

          if (app) {
            // Svelte 5 unmount
            if (typeof app === 'function') {
              app();
            } else if (app.$destroy) {
              app.$destroy();
            }
            app = null;
          }
          document.getElementById('app').innerHTML = '';
          window.__COMPILED_FILES__ = {};

          // Compile all files
          for (const [name, content] of Object.entries(window.__FILES__)) {
             if (name.endsWith('.svelte')) {
               try {
                 // Preprocess TypeScript before Svelte compilation
                 const preprocessedContent = preprocessSvelteTypeScript(content);
                 console.log('[Svelte] Preprocessed ' + name + ':', preprocessedContent);

                 const { js } = window.svelteCompile(preprocessedContent, {
                   css: 'injected',
                   name: name.replace('.svelte', ''),
                   filename: name,
                   generate: 'client',
                   runes: true,
                 });

                 console.log('[Svelte] Compiled ' + name + ':', js.code);

                 // Debug: Check if runes were correctly transformed
                 if (js.code.includes('$state(') || js.code.includes('$derived(') || js.code.includes('$effect(')) {
                   console.error('[Svelte] WARNING: Raw runes still present in compiled output!');
                   console.error('[Svelte] This indicates the Svelte compiler did not process runes correctly.');
                 } else {
                   console.log('[Svelte] Runes correctly transformed to $.state, $.derived, etc.');
                 }

                 // Transform ESM to CJS
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
               // TypeScript files - first strip types, then transform to CJS
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
               // JS files
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

          // Mount using Svelte 5 mount API
          try {
            const App = require('./App.svelte').default;
            const { mount } = window.Svelte;
            if (mount) {
              app = mount(App, { target: document.getElementById('app') });
            } else {
              // Fallback for class-based components
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

/**
 * Svelte preview script generator
 * This file only contains the preview runtime script generation
 */

export function generateSvelteScript(serializedFiles: string, version?: string) {
  const svelteVersion = version || '5.14.1'

  return `
    <script src="https://unpkg.com/@babel/standalone@7.26.2/babel.min.js"></script>
    <script type="module">
      import { compile } from "https://esm.sh/svelte@${svelteVersion}/compiler";
      import * as Svelte from "https://esm.sh/svelte@${svelteVersion}";
      import * as SvelteInternal from "https://esm.sh/svelte@${svelteVersion}/internal/client";

      window.svelteCompile = compile;
      window.Svelte = Svelte;
      window.SvelteInternal = SvelteInternal;

      if (window.Babel) window.startApp();
    </script>
    <script>
      window.startApp = async function() {
        if (!window.svelteCompile || !window.Babel) return;

        let app = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};

        const modules = {
          'svelte': window.Svelte,
          'svelte/internal/client': window.SvelteInternal,
          'svelte/internal/disclose-version': { },
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

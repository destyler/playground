/**
 * Solid.js Preview Runtime Script Generator
 *
 * Generates the runtime script for Solid.js component compilation and mounting
 * in the preview iframe. Uses Babel with babel-preset-solid for JSX transformation.
 *
 * @module preview/solid
 */



/**
 * Generates the Solid.js preview runtime script
 *
 * @param serializedFiles - JSON serialized file contents
 * @param serializedImportMap - Optional import map for external modules
 * @returns HTML script tags for Solid.js runtime
 */
export function generateSolidScript(serializedFiles: string, serializedImportMap?: string) {
  const importMapData = serializedImportMap || '{}'

  return `
    <script type="module">
      import * as SolidJS from "solid-js";
      import * as SolidWeb from "solid-js/web";

      window.SolidJS = SolidJS;
      window.SolidWeb = SolidWeb;

      if (window.startApp) window.startApp();
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="module">
      import babelPresetSolid from "https://esm.sh/babel-preset-solid";

      window.babelPresetSolid = babelPresetSolid;

      if (window.SolidJS && window.Babel) window.startApp();
    </script>
    <script>
      const importMapData = ${importMapData};
      const externalModules = importMapData.imports || {};

      // Pre-loaded external modules cache
      window.__EXTERNAL_MODULES__ = {};

      // Pre-load external modules
      async function preloadExternalModules() {
        for (const [moduleName, moduleUrl] of Object.entries(externalModules)) {
          // Skip core Solid modules
          if (moduleName === 'solid-js' || moduleName.startsWith('solid-js/')) continue;

          try {
            console.log('[Solid Playground] Pre-loading:', moduleName, 'from', moduleUrl);
            const module = await import(moduleUrl);
            console.log('[Solid Playground] Raw module:', moduleName, module);

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
            console.log('[Solid Playground] Normalized module:', moduleName, 'default:', typeof normalizedModule.default);
          } catch (e) {
            console.error('[Solid Playground] Failed to load:', moduleName, e);
          }
        }
      }

      window.startApp = async function() {
        if (!window.SolidJS || !window.Babel || !window.babelPresetSolid) return;

        // Pre-load external modules first
        await preloadExternalModules();

        let dispose = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};

        const modules = {
          'solid-js': window.SolidJS,
          'solid-js/web': window.SolidWeb,
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
          // Clear any previous errors
          if (window.__clearError__) window.__clearError__();

          if (files) window.__FILES__ = files;

          if (dispose) {
            dispose();
            dispose = null;
          }
          document.getElementById('app').innerHTML = '';
          window.__COMPILED_FILES__ = {};

          // Compile all files with babel-preset-solid
          for (const [name, content] of Object.entries(window.__FILES__)) {
             try {
               const result = window.Babel.transform(content, {
                 presets: [
                   [window.babelPresetSolid, { generate: 'dom', hydratable: false }],
                   ['typescript', { onlyRemoveTypeImports: true }],
                 ],
                 plugins: [['transform-modules-commonjs']],
                 filename: name
               });
               window.__COMPILED_FILES__[name + '_code'] = result.code;
             } catch (e) {
               console.error('Compilation error in ' + name, e);
               if (window.__showError__) {
                 window.__showError__('Compilation error in ' + name + ': ' + e.message, e.stack);
               }
               return;
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

        // Try to start if everything is loaded
      if (window.SolidJS && window.Babel && window.babelPresetSolid) {
        window.startApp();
      }
    </script>`
}

/**
 * Solid.js Preview Runtime Script Generator
 *
 * Generates the runtime script for Solid.js component compilation and mounting
 * in the preview iframe. Uses Babel with babel-preset-solid for JSX transformation.
 *
 * @module preview/solid
 */

import { generateRuntimeHelpers } from './runtime-helpers'

/**
 * Generates the Solid.js preview runtime script
 *
 * @param serializedFiles - JSON serialized file contents
 * @param serializedImportMap - Optional import map for external modules
 * @param destylerVersion - Selected destyler version (pins esm.sh URLs when not latest)
 * @returns HTML script tags for Solid.js runtime
 */
export function generateSolidScript(serializedFiles: string, serializedImportMap?: string, destylerVersion: string = 'latest') {
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
      import * as babelPresetSolidMod from "https://esm.sh/babel-preset-solid?bundle";

      window.babelPresetSolid = babelPresetSolidMod.default || babelPresetSolidMod;

      if (window.SolidJS && window.Babel) window.startApp();
    </script>
    <script>
      const importMapData = ${importMapData};
      const externalModules = importMapData.imports || {};
      ${generateRuntimeHelpers(destylerVersion, ['solid-js', 'solid-js/web'])}

      window.__EXTERNAL_MODULES__ = {};

      function normalizeSolidModule(module) {
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
        const normalized = normalizeSolidModule(module);
        window.__EXTERNAL_MODULES__[moduleName] = normalized;
        return normalized;
      }

      async function preloadExternalModules(fileMap) {
        const names = collectPreloadNames(fileMap);
        await runPool(names, PRELOAD_CONCURRENCY, loadExternalModule);
      }

      window.startApp = async function() {
        if (!window.SolidJS || !window.Babel || !window.babelPresetSolid) return;
        if (window.__PLAYGROUND_STARTED__) return;

        function resolveSolidPreset() {
          let solidPreset = window.babelPresetSolid;
          while (solidPreset && typeof solidPreset !== 'function' && solidPreset.default)
            solidPreset = solidPreset.default;
          return typeof solidPreset === 'function' ? solidPreset : null;
        }

        if (!resolveSolidPreset()) return;
        window.__PLAYGROUND_STARTED__ = true;

        let dispose = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};

        await preloadExternalModules(window.__FILES__);

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
          const generation = beginPreviewUpdate();

          if (files) window.__FILES__ = files;
          const nextFiles = window.__FILES__;

          await preloadExternalModules(nextFiles);
          if (!isCurrentPreviewUpdate(generation)) return;

          if (window.__clearError__) window.__clearError__();
          Object.assign(modules, window.__EXTERNAL_MODULES__);

          if (dispose) {
            dispose();
            dispose = null;
          }
          document.getElementById('app').innerHTML = '';
          window.__COMPILED_FILES__ = {};

          for (const [name, content] of Object.entries(nextFiles)) {
             if (!/\\.(tsx|ts|jsx|js)$/.test(name) || name === 'uno.config.ts') continue;
             try {
               const solidPreset = resolveSolidPreset();
               if (!solidPreset) throw new Error('babel-preset-solid did not load');
               const filename = /\\.tsx$/.test(name) ? name : name.replace(/\\.ts$/, '.tsx');
               const result = window.Babel.transform(content, {
                 filename,
                 sourceType: 'module',
                 parserOpts: {
                   sourceType: 'module',
                   plugins: ['jsx', 'typescript'],
                 },
                 presets: [
                   [solidPreset, { generate: 'dom', hydratable: false }],
                 ],
                 plugins: [
                   ['transform-typescript', { onlyRemoveTypeImports: true }],
                   ['transform-modules-commonjs'],
                 ],
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

          try {
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

      if (window.SolidJS && window.Babel && window.babelPresetSolid) {
        window.startApp();
      }
    </script>`
}

/**
 * Solid.js preview script generator
 * This file only contains the preview runtime script generation
 */

export function generateSolidScript(serializedFiles: string) {
  return `
    <script type="module">
      import * as SolidJS from "https://esm.sh/solid-js";
      import * as SolidWeb from "https://esm.sh/solid-js/web";

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
      window.startApp = function() {
        if (!window.SolidJS || !window.Babel || !window.babelPresetSolid) return;

        let dispose = null;
        window.__FILES__ = ${serializedFiles};
        window.__COMPILED_FILES__ = {};

        const modules = {
          'solid-js': window.SolidJS,
          'solid-js/web': window.SolidWeb,
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

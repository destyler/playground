/**
 * React preview script generator
 * This file only contains the preview runtime script generation
 */

export function generateReactScript(serializedFiles: string, version?: string) {
  // If version is specified, check if it's React 18 or below for UMD
  if (version) {
    const majorVersion = Number.parseInt(version.split('.')[0], 10)
    if (majorVersion < 19) {
      return generateReactUMDScript(serializedFiles)
    }
    return generateReactESMScript(serializedFiles, version)
  }

  // Default: use ESM (latest React)
  return generateReactESMScript(serializedFiles)
}

/**
 * Generate React script using ESM imports (for React 19+)
 */
function generateReactESMScript(serializedFiles: string, version?: string) {
  const versionSuffix = version ? `@${version}` : ''
  return `
    <script type="module">
      import * as React from "https://unpkg.com/react${versionSuffix}?module";
      import * as ReactDOM from "https://unpkg.com/react-dom${versionSuffix}?module";
      import * as ReactDOMClient from "https://unpkg.com/react-dom${versionSuffix}/client?module";

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

/**
 * Generate React script using UMD globals (for React 18 and below)
 */
function generateReactUMDScript(serializedFiles: string) {
  return `
    <script>
      window.process = { env: { NODE_ENV: 'development' } };

      let root = null;
      window.__FILES__ = ${serializedFiles};
      window.__COMPILED_FILES__ = {};

      // Shim for require
      const modules = {
        'react': React,
        'react-dom/client': ReactDOM,
        'react-dom': ReactDOM
      };

      function require(id) {
        if (modules[id]) return modules[id];
        if (id.startsWith('./')) {
           const name = id.replace('./', '').replace(/\\.(tsx|ts|jsx|js)$/, '');
           // Find the full filename in __FILES__ keys
           const filename = Object.keys(window.__FILES__).find(k => k.replace(/\\.(tsx|ts|jsx|js)$/, '') === name);
           if (!filename) throw new Error('File not found: ' + id);

           if (window.__COMPILED_FILES__[filename]) {
             return window.__COMPILED_FILES__[filename].exports;
           }

           // Execute
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

        if (root) {
          root.unmount();
          root = null;
        }
        document.getElementById('root').innerHTML = '';
        window.__COMPILED_FILES__ = {}; // Clear cache

        // Compile all files
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

        // Mount
        try {
          const App = require('./App').default;
          root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(App));
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
    </script>`
}

import type { File } from './types';

export const REACT_TEMPLATE: { name: string; color: string; cdn: string[]; defaultFiles: File[] } = {
  name: 'React',
  color: '#61dafb',
  cdn: [
    'https://unpkg.com/react@18/umd/react.development.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    'https://unpkg.com/@babel/standalone/babel.min.js'
  ],
  defaultFiles: [
    {
      name: 'App.tsx',
      content: `import React, { useState } from 'react';
import Counter from './Counter';

export default function App() {
  return (
    <div className="container">
      <h1>React App</h1>
      <Counter />
    </div>
  );
}`,
      active: true
    },
    {
      name: 'Counter.tsx',
      content: `import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count is: {count}
    </button>
  );
}`
    }
  ]
};

export const generateReactScript = (serializedFiles: string) => `
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
        }
      }

      update();
      
      window.addEventListener('message', (e) => {
        if (e.data.type === 'UPDATE_FILES') {
          update(e.data.files);
        }
      });
    </script>`;

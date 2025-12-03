import type { File } from './types'

export const SOLID_TEMPLATE: { name: string, color: string, cdn: string[], defaultFiles: File[] } = {
  name: 'Solid',
  color: '#2c4f7c',
  cdn: [
    'https://unpkg.com/@babel/standalone/babel.min.js',
  ],
  defaultFiles: [
    {
      name: 'App.tsx',
      content: `import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import html from 'solid-js/html';
import Counter from './Counter';

function App() {
  return html\`
    <div class="container">
      <h1>Solid App</h1>
      <\${Counter} />
    </div>
  \`;
}

render(() => html\`<\${App} />\`, document.getElementById('app'));`,
      active: true,
    },
    {
      name: 'Counter.tsx',
      content: `import { createSignal } from 'solid-js';
import html from 'solid-js/html';

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return html\`
    <button onClick=\${() => setCount(c => c + 1)}>
      Count is: \${count()}
    </button>
  \`;
}`,
    },
  ],
}



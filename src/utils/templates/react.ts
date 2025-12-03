import type { File } from './types'

export const REACT_TEMPLATE: { name: string, color: string, cdn: string[], defaultFiles: File[] } = {
  name: 'React',
  color: '#61dafb',
  cdn: [
    'https://unpkg.com/react@18/umd/react.development.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
  ],
  defaultFiles: [
    {
      name: 'App.tsx',
      content: `import Counter from './Counter.tsx';

export default function App() {
  return (
    <div className="container">
      <h1>React App</h1>
      <Counter />
    </div>
  );
}`,
      active: true,
    },
    {
      name: 'Counter.tsx',
      content: `import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count is: {count}
    </button>
  );
}`,
    },
  ],
}

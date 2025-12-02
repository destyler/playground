import React, { useState, useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { FRAMEWORKS, generateHtml, type Framework } from '../utils/templates';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

if (typeof window !== 'undefined') {
  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new jsonWorker();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      return new editorWorker();
    }
  };
}

export default function Playground() {
  const [activeFramework, setActiveFramework] = useState<Framework>('vue');
  const [code, setCode] = useState(FRAMEWORKS['vue'].defaultCode);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize Editor
  useEffect(() => {
    if (editorContainerRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        value: code,
        language: 'javascript', // Default, will change based on framework
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        padding: { top: 16 }
      });

      editorRef.current.onDidChangeModelContent(() => {
        const newValue = editorRef.current?.getValue();
        if (newValue !== undefined) {
          setCode(newValue);
        }
      });
    }

    return () => {
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, []);

  // Handle Framework Change
  const handleFrameworkChange = (framework: Framework) => {
    setActiveFramework(framework);
    const newCode = FRAMEWORKS[framework].defaultCode;
    setCode(newCode);
    
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
      // Update language if needed
      const model = editorRef.current.getModel();
      if (model) {
        if (framework === 'react') {
          monaco.editor.setModelLanguage(model, 'javascript'); // JSX is handled by JS mode usually in Monaco or 'typescript'
        } else if (framework === 'vue' || framework === 'svelte') {
          monaco.editor.setModelLanguage(model, 'html'); // Vue/Svelte often treated as HTML in simple editors
        } else {
          monaco.editor.setModelLanguage(model, 'javascript');
        }
      }
    }
  };

  // Update Iframe
  useEffect(() => {
    const updateIframe = () => {
      if (iframeRef.current) {
        const html = generateHtml(activeFramework, code);
        iframeRef.current.srcdoc = html;
      }
    };

    // Debounce
    const timer = setTimeout(updateIframe, 500);
    return () => clearTimeout(timer);
  }, [code, activeFramework]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff' }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        gap: '10px', 
        padding: '10px 20px', 
        borderBottom: '1px solid #333',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, marginRight: '20px', fontSize: '1.2rem' }}>Playground</h2>
        {Object.entries(FRAMEWORKS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => handleFrameworkChange(key as Framework)}
            style={{
              padding: '6px 12px',
              backgroundColor: activeFramework === key ? config.color : '#333',
              color: activeFramework === key ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            {config.name}
          </button>
        ))}
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editor */}
        <div style={{ flex: 1, borderRight: '1px solid #333', position: 'relative' }}>
          <div ref={editorContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Preview */}
        <div style={{ flex: 1, backgroundColor: '#fff' }}>
          <iframe
            ref={iframeRef}
            title="preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
            sandbox="allow-scripts allow-same-origin allow-modals"
          />
        </div>
      </div>
    </div>
  );
}

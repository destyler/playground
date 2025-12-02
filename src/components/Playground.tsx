import React, { useState, useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { FRAMEWORKS, generateHtml, type Framework, type File } from '../utils/templates';

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
  const [files, setFiles] = useState<File[]>(FRAMEWORKS['vue'].defaultFiles);
  const [activeFile, setActiveFile] = useState<string>(FRAMEWORKS['vue'].defaultFiles.find(f => f.active)?.name || FRAMEWORKS['vue'].defaultFiles[0].name);
  
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize Editor
  useEffect(() => {
    if (editorContainerRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        value: files.find(f => f.name === activeFile)?.content || '',
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
          setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, content: newValue } : f));
        }
      });
    }

    return () => {
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, []); // Run once on mount

  // Update editor content when activeFile changes
  useEffect(() => {
    if (editorRef.current) {
      const file = files.find(f => f.name === activeFile);
      if (file) {
        const currentValue = editorRef.current.getValue();
        if (currentValue !== file.content) {
          editorRef.current.setValue(file.content);
        }
        
        // Update language
        const model = editorRef.current.getModel();
        if (model) {
          const ext = file.name.split('.').pop();
          if (ext === 'vue' || ext === 'html' || ext === 'svelte') {
            monaco.editor.setModelLanguage(model, 'html');
          } else if (ext === 'ts' || ext === 'tsx') {
            monaco.editor.setModelLanguage(model, 'typescript');
          } else if (ext === 'js' || ext === 'jsx') {
            monaco.editor.setModelLanguage(model, 'javascript');
          } else if (ext === 'css') {
            monaco.editor.setModelLanguage(model, 'css');
          } else if (ext === 'json') {
            monaco.editor.setModelLanguage(model, 'json');
          }
        }
      }
    }
  }, [activeFile]); // Don't depend on files content to avoid loop, just activeFile switch

  // Handle Framework Change
  const handleFrameworkChange = (framework: Framework) => {
    setActiveFramework(framework);
    const newFiles = FRAMEWORKS[framework].defaultFiles;
    setFiles(newFiles);
    setActiveFile(newFiles.find(f => f.active)?.name || newFiles[0].name);
  };

  // Update Iframe
  useEffect(() => {
    const updateIframe = () => {
      if (iframeRef.current) {
        const html = generateHtml(activeFramework, files);
        iframeRef.current.srcdoc = html;
      }
    };

    // Debounce
    const timer = setTimeout(updateIframe, 1000);
    return () => clearTimeout(timer);
  }, [files, activeFramework]);

  const addNewFile = () => {
    const name = prompt('Enter file name (e.g., Component.vue):');
    if (name && !files.find(f => f.name === name)) {
      setFiles([...files, { name, content: '' }]);
      setActiveFile(name);
    }
  };

  const deleteFile = (name: string) => {
    if (files.length <= 1) return;
    const newFiles = files.filter(f => f.name !== name);
    setFiles(newFiles);
    if (activeFile === name) {
      setActiveFile(newFiles[0].name);
    }
  };

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
        {/* Editor Section */}
        <div style={{ flex: 1, borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* File Tabs */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#252526', 
            borderBottom: '1px solid #333',
            overflowX: 'auto'
          }}>
            {files.map(file => (
              <div 
                key={file.name}
                onClick={() => setActiveFile(file.name)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: activeFile === file.name ? '#1e1e1e' : 'transparent',
                  color: activeFile === file.name ? '#fff' : '#999',
                  borderRight: '1px solid #333',
                  borderTop: activeFile === file.name ? '2px solid #42b883' : '2px solid transparent', // Green highlight like Vue
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.9rem',
                  userSelect: 'none',
                  minWidth: 'fit-content'
                }}
              >
                <span>{file.name}</span>
                {files.length > 1 && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.name); }}
                    style={{ 
                      marginLeft: '8px', 
                      fontSize: '0.8rem', 
                      opacity: 0.6,
                      cursor: 'pointer' 
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                  >
                    ✕
                  </span>
                )}
              </div>
            ))}
            <button 
              onClick={addNewFile}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                padding: '0 12px',
                fontSize: '1.2rem',
                outline: 'none'
              }}
              title="New File"
            >
              +
            </button>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div ref={editorContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
          </div>
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

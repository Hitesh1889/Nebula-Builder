import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Copy, Check, FileCode, FileJson, FileType } from 'lucide-react';
import { GeneratedContent } from '../types';

interface CodeEditorProps {
  content: GeneratedContent | null;
  onChange: (type: 'html' | 'css' | 'javascript', value: string) => void;
}

type Tab = 'html' | 'css' | 'javascript';

// Declare Prism on window for TS
declare global {
  interface Window {
    Prism: any;
  }
}

const CodeEditor: React.FC<CodeEditorProps> = ({ content, onChange }) => {
  const [activeTab, setActiveTab] = useState<Tab>('html');
  const [copied, setCopied] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const getActiveCode = () => {
    if (!content) return '';
    return content[activeTab];
  };

  const code = getActiveCode();

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sync scrolling between textarea and pre
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Generate highlighted HTML
  const highlightedCode = useMemo(() => {
    if (!code) return '';
    
    // Safety check if Prism isn't loaded yet
    if (typeof window === 'undefined' || !window.Prism) {
      return code.replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
    }

    let grammar;
    let lang: string = activeTab;

    switch(activeTab) {
      case 'html': 
        grammar = window.Prism.languages.markup; 
        lang = 'markup';
        break;
      case 'css': 
        grammar = window.Prism.languages.css; 
        break;
      case 'javascript': 
        grammar = window.Prism.languages.javascript; 
        break;
    }

    if (!grammar) return code;
    
    return window.Prism.highlight(code, grammar, lang);
  }, [code, activeTab]);

  if (!content) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-600 font-mono text-sm">
        // Generate a website to see and edit the code...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950">
      {/* Tab Bar */}
      <div className="flex items-center bg-slate-900 border-b border-slate-800 shrink-0">
        <button
          onClick={() => setActiveTab('html')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-r border-slate-800 ${
            activeTab === 'html' ? 'text-indigo-400 bg-slate-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          index.html
        </button>
        <button
          onClick={() => setActiveTab('css')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-r border-slate-800 ${
            activeTab === 'css' ? 'text-indigo-400 bg-slate-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileType className="w-4 h-4" />
          style.css
        </button>
        <button
          onClick={() => setActiveTab('javascript')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-r border-slate-800 ${
            activeTab === 'javascript' ? 'text-indigo-400 bg-slate-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileJson className="w-4 h-4" />
          script.js
        </button>

        <div className="flex-1" />
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 mr-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden bg-[#2d2d2d]"> {/* Match Prism Tomorrow bg */}
        {/* Container for both layers */}
        <div className="relative w-full h-full">
          
          {/* 1. Syntax Highlighting Layer (Bottom) */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full m-0 p-4 pointer-events-none overflow-hidden font-mono text-[14px] leading-[1.5]"
            style={{ 
              whiteSpace: 'pre', /* Ensure we handle scrolling same as textarea */
              fontFamily: "'Fira Code', monospace" 
            }}
          >
             <code 
                className={`language-${activeTab === 'html' ? 'markup' : activeTab}`}
                dangerouslySetInnerHTML={{ __html: highlightedCode + '<br />' }} /* Add break for EOF consistency */
             />
          </pre>

          {/* 2. Input Layer (Top) */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(activeTab, e.target.value)}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full p-4 resize-none bg-transparent text-transparent caret-white focus:outline-none font-mono text-[14px] leading-[1.5] custom-scrollbar"
            style={{ 
               whiteSpace: 'pre',
               fontFamily: "'Fira Code', monospace",
               color: 'transparent',
               caretColor: '#fff' 
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
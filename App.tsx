import React, { useState, useEffect } from 'react';
import { Eye, Code, Download, ExternalLink, PanelLeftClose, PanelLeftOpen, Maximize, Minimize } from 'lucide-react';
import JSZip from 'jszip';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import PreviewFrame from './components/PreviewFrame';
import CodeEditor from './components/CodeEditor';
import HistorySidebar from './components/HistorySidebar';
import SidebarTools from './components/SidebarTools';
import { generateWebsite } from './services/geminiService';
import { GenerationStatus, ViewMode, WebsiteHistoryItem, GeneratedContent } from './types';
import { INITIAL_PROMPT } from './constants';
import { useUndoRedoState } from './hooks/useAppHistory';

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('nebula_theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  // Apply theme class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nebula_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Use custom hook for state with Undo/Redo
  const { 
    prompt, 
    setPrompt, 
    content: generatedContent, 
    setContent: setGeneratedContent, 
    updateContent,
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useUndoRedoState(INITIAL_PROMPT);

  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [viewMode, setViewMode] = useState<ViewMode>('PREVIEW');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<WebsiteHistoryItem[]>([]);
  const [iframeKey, setIframeKey] = useState(0);

  // Debounced content for preview to avoid flashing/lagging on every keystroke
  const [previewContent, setPreviewContent] = useState<GeneratedContent | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (!generatedContent) {
        setPreviewContent(null);
        setIsPreviewLoading(false);
        return;
    }

    // Optimization: If content hasn't actually changed reference (e.g. from immediate generation), skip debounce
    if (generatedContent === previewContent) {
        setIsPreviewLoading(false);
        return;
    }

    setIsPreviewLoading(true);

    const timer = setTimeout(() => {
        setPreviewContent(generatedContent);
        setIframeKey(prev => prev + 1); // Force iframe refresh to ensure clean state
        setIsPreviewLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, [generatedContent, previewContent]);

  const handleGenerationSuccess = (content: GeneratedContent) => {
    setGeneratedContent(content); 
    setPreviewContent(content); 
    setIsPreviewLoading(false);
  }

  const handleHistorySelect = (content: GeneratedContent) => {
     setGeneratedContent(content);
     setPreviewContent(content); 
     setIsPreviewLoading(false);
  }

  const handleCodeChange = (type: 'html' | 'css' | 'javascript', value: string) => {
    if (!generatedContent) return;
    const newContent = { ...generatedContent, [type]: value };
    updateContent(newContent); 
  };

  useEffect(() => {
    const saved = localStorage.getItem('nebula_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToSidebarHistory = (newItem: WebsiteHistoryItem) => {
    const updated = [newItem, ...history].slice(0, 50); 
    setHistory(updated);
    localStorage.setItem('nebula_history', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nebula_history');
  }

  const handleGenerate = async (modelId: string) => {
    setStatus(GenerationStatus.GENERATING);
    setViewMode('PREVIEW'); 
    
    if (window.innerWidth < 1024) {
      setIsSidebarCollapsed(true);
    }
    
    try {
      const content = await generateWebsite(prompt, modelId);
      handleGenerationSuccess(content);
      setStatus(GenerationStatus.COMPLETED);
      setIframeKey(prev => prev + 1); 

      saveToSidebarHistory({
        id: crypto.randomUUID(),
        prompt,
        content,
        timestamp: Date.now(),
        model: modelId
      });

    } catch (error) {
      console.error(error);
      setStatus(GenerationStatus.ERROR);
      alert("Failed to generate website. Please ensure your API Key is valid.");
    }
  };

  const getFullHtml = () => {
    if (!generatedContent) return '';
    
    let doc = generatedContent.html;
    const styleTag = `<style>\n${generatedContent.css}\n</style>`;
    const scriptTag = `<script>\n${generatedContent.javascript}\n</script>`;

    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `${styleTag}\n</head>`);
    } else if (/<body/i.test(doc)) {
      doc = doc.replace(/<body/i, `${styleTag}\n<body`);
    } else {
      doc = `${styleTag}\n${doc}`;
    }

    if (/<\/body>/i.test(doc)) {
      doc = doc.replace(/<\/body>/i, `${scriptTag}\n</body>`);
    } else if (/<\/html>/i.test(doc)) {
      doc = doc.replace(/<\/html>/i, `${scriptTag}\n</html>`);
    } else {
      doc = `${doc}\n${scriptTag}`;
    }

    return doc;
  }

  const handleDownload = async () => {
    if (!generatedContent) return;

    try {
      const zip = new JSZip();
      zip.file("style.css", generatedContent.css);
      zip.file("script.js", generatedContent.javascript);

      let html = generatedContent.html;
      const cssLink = '<link rel="stylesheet" href="style.css">';
      const jsScript = '<script src="script.js"></script>';

      if (/<\/head>/i.test(html)) {
        html = html.replace(/<\/head>/i, `${cssLink}\n</head>`);
      } else if (/<body/i.test(html)) {
         html = html.replace(/<body/i, `${cssLink}\n<body`);
      } else {
        html = `${cssLink}\n${html}`;
      }

      if (/<\/body>/i.test(html)) {
        html = html.replace(/<\/body>/i, `${jsScript}\n</body>`);
      } else if (/<\/html>/i.test(html)) {
        html = html.replace(/<\/html>/i, `${jsScript}\n</html>`);
      } else {
        html = `${html}\n${jsScript}`;
      }

      zip.file("index.html", html);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nebula-website.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Failed to zip website:", error);
      alert("Failed to create zip file.");
    }
  };

  const handleOpenNewTab = () => {
    const fullHtml = getFullHtml();
    if(!fullHtml) return;
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(fullHtml);
        newWindow.document.close();
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden transition-colors duration-300">
      {!isFullscreen && <Header theme={theme} onToggleTheme={toggleTheme} />}

      <main className="flex-1 flex flex-row overflow-hidden relative">
        
        {/* Sidebar: Input & Controls */}
        <aside 
          className={`
            border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col transition-all duration-300 ease-in-out relative z-10
            ${(isSidebarCollapsed || isFullscreen) ? 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden opacity-0' : 'w-full lg:w-[400px] opacity-100'}
          `}
        >
          <div className="p-4 lg:p-6 overflow-hidden h-full flex flex-col gap-6 w-full lg:w-[400px]">
             <PromptInput 
               prompt={prompt} 
               setPrompt={setPrompt} 
               status={status} 
               onGenerate={handleGenerate}
               onShowHistory={() => setIsHistoryOpen(true)}
               undo={undo}
               redo={redo}
               canUndo={canUndo}
               canRedo={canRedo}
             />

             <div className="hidden lg:flex flex-1 min-h-0">
               <SidebarTools setPrompt={setPrompt} />
             </div>
          </div>
        </aside>

        {/* Toggle Button (Floating) */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`
            absolute top-3 z-30 p-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-lg
            ${isSidebarCollapsed ? 'left-4' : 'left-[416px] hidden lg:block'}
            ${isFullscreen ? 'hidden' : ''}
          `}
          title={isSidebarCollapsed ? "Show Controls" : "Hide Controls"}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {/* Main Panel: Preview & Code */}
        <div className="flex-1 flex flex-col h-full relative bg-slate-100 dark:bg-slate-950 min-w-0 transition-colors duration-300">
          
          {/* Toolbar */}
          <div className={`h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 transition-all duration-300 ${!isFullscreen ? 'pl-16' : ''}`}>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('PREVIEW')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'PREVIEW' 
                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setViewMode('CODE')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'CODE' 
                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Code className="w-4 h-4" />
                Code
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-2 rounded-md transition-colors ${
                  isFullscreen 
                    ? 'text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>

              <button
                onClick={handleOpenNewTab}
                disabled={!generatedContent}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownload}
                disabled={!generatedContent}
                className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download ZIP</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
             {status === GenerationStatus.ERROR && (
               <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm">
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 p-6 rounded-xl max-w-md text-center">
                    <p className="text-red-600 dark:text-red-400 mb-2 font-medium">Generation Failed</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">There was an issue connecting to the AI service. Please try again.</p>
                  </div>
               </div>
             )}

             {viewMode === 'PREVIEW' ? (
                <div className="w-full h-full p-4 lg:p-8 bg-slate-100 dark:bg-slate-950 flex flex-col transition-colors duration-300">
                   <div className="flex-1 relative w-full h-full">
                         {status === GenerationStatus.GENERATING && (
                            <div className="absolute inset-0 z-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center flex-col gap-4 rounded-xl">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-900 dark:text-white font-medium animate-pulse">Designing your website...</p>
                            </div>
                         )}
                         <PreviewFrame 
                           content={previewContent} 
                           refreshKey={iframeKey} 
                           isLoading={isPreviewLoading}
                         />
                   </div>
                </div>
             ) : (
                <CodeEditor 
                  content={generatedContent} 
                  onChange={handleCodeChange}
                />
             )}
          </div>
        </div>
      </main>

      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          setPrompt(item.prompt);
          handleHistorySelect(item.content);
          setIframeKey(k => k + 1);
          setViewMode('PREVIEW');
        }}
        onClear={handleClearHistory}
      />
    </div>
  );
};

export default App;
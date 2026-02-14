
import React, { useState, useEffect } from 'react';
import { Eye, Code, Download, ExternalLink, PanelLeftClose, PanelLeftOpen, Maximize, Minimize, XCircle, Smartphone, Tablet, Monitor, Pencil } from 'lucide-react';
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
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<WebsiteHistoryItem[]>([]);
  const [iframeKey, setIframeKey] = useState(0);
  const [isEditable, setIsEditable] = useState(false);

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
    setIsEditable(false); // Reset edit mode on new generation
  }

  const handleHistorySelect = (content: GeneratedContent) => {
     setGeneratedContent(content);
     setPreviewContent(content); 
     setIsPreviewLoading(false);
     setIsEditable(false);
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
      // Removed alert to rely on the UI error state
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
    <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden transition-colors duration-300">
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

             <div className="flex flex-1 min-h-0">
               <SidebarTools setPrompt={setPrompt} />
             </div>
          </div>
        </aside>

        {/* Toggle Button (Floating) */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`
            absolute top-3 z-30 p-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-lg
            ${isSidebarCollapsed ? 'left-4' : 'left-4 lg:left-[416px]'}
            ${isFullscreen ? 'hidden' : ''}
          `}
          title={isSidebarCollapsed ? "Show Controls" : "Hide Controls"}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {/* Main Panel: Preview & Code */}
        <div className="flex-1 flex flex-col h-full relative bg-slate-100 dark:bg-slate-950 min-w-0 transition-colors duration-300">
          
          {/* Toolbar */}
          <div className={`h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 transition-all duration-300 ${!isFullscreen ? 'pl-16' : ''} relative`}>
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

            {/* Device Toggles (Centered) */}
            {viewMode === 'PREVIEW' && (
               <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm z-10">
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-md transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    title="Mobile View (375px)"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-1.5 rounded-md transition-all ${previewDevice === 'tablet' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    title="Tablet View (768px)"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-md transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    title="Desktop View"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                  <button
                    onClick={() => setIsEditable(!isEditable)}
                    className={`p-1.5 rounded-md transition-all ${isEditable ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    title={isEditable ? "Finish Editing" : "Edit Text"}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
               </div>
            )}

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
               <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm p-4">
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 p-6 rounded-xl max-w-md w-full text-center shadow-2xl relative">
                    <button 
                      onClick={() => setStatus(GenerationStatus.IDLE)}
                      className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Generation Failed</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                      The AI service could not be reached. This is most likely because the 
                      <span className="font-mono text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded mx-1">API_KEY</span> 
                      environment variable is missing or invalid.
                    </p>
                    <button 
                      onClick={() => setStatus(GenerationStatus.IDLE)}
                      className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                    >
                      Dismiss
                    </button>
                  </div>
               </div>
             )}

             {viewMode === 'PREVIEW' ? (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 lg:p-8 transition-colors duration-300 overflow-hidden">
                   <div className="w-full h-full flex flex-col items-center justify-center overflow-auto custom-scrollbar">
                        <div className={`
                            relative transition-all duration-500 ease-in-out shadow-2xl bg-white dark:bg-slate-900 shrink-0
                            ${previewDevice === 'mobile' ? 'w-[375px] h-[812px] rounded-[3rem] border-[8px] border-slate-800 dark:border-slate-800' : ''}
                            ${previewDevice === 'tablet' ? 'w-[768px] h-[1024px] rounded-[2rem] border-[8px] border-slate-800 dark:border-slate-800' : ''}
                            ${previewDevice === 'desktop' ? 'w-full h-full rounded-xl border border-slate-200 dark:border-slate-800' : ''}
                        `}>
                            {status === GenerationStatus.GENERATING && (
                                <div className="absolute inset-0 z-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center flex-col gap-4 rounded-inherit">
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-slate-900 dark:text-white font-medium animate-pulse">Designing your website...</p>
                                </div>
                            )}
                            <div className={`w-full h-full overflow-hidden bg-white ${previewDevice !== 'desktop' ? 'rounded-[2.4rem]' : 'rounded-xl'}`}>
                                <PreviewFrame 
                                content={previewContent} 
                                refreshKey={iframeKey} 
                                isLoading={isPreviewLoading}
                                isEditable={isEditable}
                                />
                            </div>
                        </div>
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

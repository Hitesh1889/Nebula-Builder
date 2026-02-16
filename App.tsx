
import React, { useState, useEffect, useRef } from 'react';
import { Eye, Code, Download, ExternalLink, Maximize, Minimize, XCircle, Smartphone, Tablet, Monitor, Pencil, Home, AppWindow, Play, ArrowLeft, ArrowRight, LayoutTemplate, Wand2, Palette, Sparkles, Rocket, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import PreviewFrame from './components/PreviewFrame';
import CodeEditor from './components/CodeEditor';
import HistorySidebar from './components/HistorySidebar';
import { generateWebsite } from './services/geminiService';
import { GenerationStatus, ViewMode, WebsiteHistoryItem, GeneratedContent } from './types';
import { useUndoRedoState } from './hooks/useAppHistory';

const LOADING_STEPS = [
  { text: "Analyzing your vision...", icon: Wand2, color: "text-orange-500" },
  { text: "Drafting the structure...", icon: Pencil, color: "text-emerald-500" },
  { text: "Selecting the perfect palette...", icon: Palette, color: "text-red-500" },
  { text: "Computing layout logic...", icon: LayoutTemplate, color: "text-indigo-400" },
  { text: "Writing production code...", icon: Code, color: "text-orange-400" },
  { text: "Polishing details...", icon: Sparkles, color: "text-emerald-400" },
  { text: "Preparing for launch...", icon: Rocket, color: "text-red-400" },
];

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
     setTheme(prev => prev === 'dark' ? 'light' : 'dark');
     if (theme === 'dark') document.documentElement.classList.remove('dark');
     else document.documentElement.classList.add('dark');
  };

  const { 
    prompt, 
    setPrompt, 
    content: generatedContent, 
    setContent: setGeneratedContent, 
    updateContent,
  } = useUndoRedoState(''); 

  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('PREVIEW');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<WebsiteHistoryItem[]>([]);
  const [iframeKey, setIframeKey] = useState(0);
  const [isEditable, setIsEditable] = useState(false);
  const [highlightNewTabBtn, setHighlightNewTabBtn] = useState(false);
  
  // Loading Animation State
  const [loadingStep, setLoadingStep] = useState(0);

  // Navigation State: 'LANDING' (Home) or 'WORKSPACE' (Preview)
  const [uiState, setUiState] = useState<'LANDING' | 'WORKSPACE'>('LANDING');

  // Determine if content is available
  const hasContent = !!generatedContent;

  // Background Blobs
  const Background = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-blob mix-blend-screen"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
    </div>
  );

  // [Internal Logic retained for functionality]
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartRef = useRef(0);
  const [previewContent, setPreviewContent] = useState<GeneratedContent | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const prevContentLength = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientY < 60) touchStartRef.current = e.touches[0].clientY;
      else touchStartRef.current = 0;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartRef.current;
      if (diff > 0) setPullDistance(Math.min(diff * 0.5, 150));
    };
    const handleTouchEnd = () => {
      if (touchStartRef.current && pullDistance > 100) window.location.reload();
      setPullDistance(0);
      touchStartRef.current = 0;
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance]);

  useEffect(() => {
    if (!generatedContent) {
        setPreviewContent(null);
        setIsPreviewLoading(false);
        return;
    }
    if (previewContent && generatedContent.html === previewContent.html && generatedContent.css === previewContent.css && generatedContent.javascript === previewContent.javascript) return;
    const currentLength = generatedContent.html.length + generatedContent.css.length;
    const isLargeChange = Math.abs(currentLength - prevContentLength.current) > 50;
    prevContentLength.current = currentLength;
    if (isLargeChange) {
       setPreviewContent(generatedContent);
       setIsPreviewLoading(false);
    } else {
       const timer = setTimeout(() => {
           setPreviewContent(generatedContent);
           setIsPreviewLoading(false);
       }, 150);
       return () => clearTimeout(timer);
    }
  }, [generatedContent, previewContent]);

  // Loading Cycle Effect
  useEffect(() => {
    if (status === GenerationStatus.GENERATING) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleGenerationSuccess = (content: GeneratedContent) => {
    setGeneratedContent(content); 
    setPreviewContent(content); 
    setIsPreviewLoading(false);
    setIsEditable(false); 
    setErrorMessage('');
    setIframeKey(prev => prev + 1); 
    setHighlightNewTabBtn(true);
    setUiState('WORKSPACE'); // Switch to workspace on success
  }

  const handleHistorySelect = (content: GeneratedContent) => {
     setGeneratedContent(content);
     setPreviewContent(content); 
     setIsPreviewLoading(false);
     setIsEditable(false);
     setErrorMessage('');
     setIframeKey(prev => prev + 1);
     setHighlightNewTabBtn(true);
     setUiState('WORKSPACE');
  }

  const handleCodeChange = (type: 'html' | 'css' | 'javascript', value: string) => {
    if (!generatedContent) return;
    const newContent = { ...generatedContent, [type]: value };
    updateContent(newContent); 
  };

  const handleVisualEditUpdate = (newHtml: string) => {
    if (!generatedContent) return;
    const newContent = { ...generatedContent, html: newHtml };
    updateContent(newContent);
  };

  useEffect(() => {
    const saved = localStorage.getItem('visinaro_history');
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
    localStorage.setItem('visinaro_history', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('visinaro_history');
  }

  const handleGenerate = async (modelId: string) => {
    setStatus(GenerationStatus.GENERATING);
    setErrorMessage('');
    setViewMode('PREVIEW'); 
    setHighlightNewTabBtn(false);
    // Stay on landing page while loading for better UX, or switch to workspace?
    // Requirement says 2 screens. Let's switch to workspace to show loading state there.
    setUiState('WORKSPACE'); 
    
    try {
      const content = await generateWebsite(prompt, modelId);
      handleGenerationSuccess(content);
      setStatus(GenerationStatus.COMPLETED);
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
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  // --- NAVIGATION LOGIC ---
  const handleToggleScreen = () => {
      if (uiState === 'WORKSPACE') {
          setUiState('LANDING'); // Go to Input Screen
      } else if (uiState === 'LANDING' && (hasContent || status === GenerationStatus.GENERATING)) {
          setUiState('WORKSPACE'); // Go to Result Screen
      }
  };
  
  const handleGoHome = () => {
      setUiState('LANDING');
  }

  const imageHandlerScript = `
    <script>
      function fixImage(img) {
        if (img.dataset.retries) return;
        img.dataset.retries = '1';
        const str = (img.alt || '') + (img.getAttribute('src') || '');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0; 
        }
        const seed = Math.abs(hash);
        img.src = "https://picsum.photos/seed/" + seed + "/800/600";
        img.style.objectFit = 'cover';
      }
      window.addEventListener('error', function(e) {
        if (e.target && e.target.tagName === 'IMG') fixImage(e.target);
      }, true);
      window.addEventListener('DOMContentLoaded', () => {
         document.querySelectorAll('img').forEach(img => {
            if (!img.src || img.src === window.location.href || img.src.includes('null') || img.src.includes('undefined')) {
                fixImage(img);
            }
         });
      });
    </script>
  `;

  // --- TAILWIND INJECTION STRING ---
  const tailwindInjection = `
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
              serif: ['Playfair Display', 'serif'],
            },
          },
        },
      }
    </script>
  `;

  const getFullHtml = () => {
    if (!generatedContent) return '';
    let doc = generatedContent.html;
    const styleTag = `<style>\n${generatedContent.css}\n</style>`;
    const scriptTag = `<script>\n${generatedContent.javascript}\n</script>`;
    
    // Inject CSS & Tailwind
    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `${tailwindInjection}\n${styleTag}\n${imageHandlerScript}\n</head>`);
    } else if (/<body/i.test(doc)) {
      doc = doc.replace(/<body/i, `${tailwindInjection}\n${styleTag}\n${imageHandlerScript}\n<body`);
    } else {
      doc = `${tailwindInjection}\n${styleTag}\n${imageHandlerScript}\n${doc}`;
    }

    // Inject JS
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
        html = html.replace(/<\/head>/i, `${tailwindInjection}\n${cssLink}\n${imageHandlerScript}\n</head>`);
      } else if (/<body/i.test(html)) {
         html = html.replace(/<body/i, `${tailwindInjection}\n${cssLink}\n${imageHandlerScript}\n<body`);
      } else {
        html = `${tailwindInjection}\n${cssLink}\n${imageHandlerScript}\n${html}`;
      }
      if (/<\/body>/i.test(html)) {
        html = html.replace(/<\/body>/i, `${jsScript}\n</body>`);
      } else if (/<\/html>/i.test(html)) {
        html = html.replace(/<\/html>/i, `${jsScript}\n</html>`);
      } else {
        html = `${html}\n${jsScript}`;
      }
      zip.file("index.html", html);
      const titleMatch = generatedContent.html.match(/<title>(.*?)<\/title>/i);
      let filename = 'visinaro-website';
      if (titleMatch && titleMatch[1]) {
        const cleanTitle = titleMatch[1].replace(/[^a-z0-9\s-_]/gi, '').trim().replace(/\s+/g, '-').toLowerCase();
        if (cleanTitle.length > 0) filename = cleanTitle;
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to zip website:", error);
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

  // --- RENDER ---
  return (
    <div className={`h-[100dvh] flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative ${theme}`}>
      <Background />
      
      {/* Universal Header (Glass) */}
      {!isFullscreen && (
          <div className="z-50 relative">
             <Header theme={theme} onToggleTheme={toggleTheme} onGoHome={handleGoHome} />
          </div>
      )}

      {/* --- MASTER NAVIGATION TOGGLE --- */}
      {(uiState === 'WORKSPACE' || (uiState === 'LANDING' && (hasContent || status === GenerationStatus.GENERATING))) && !isFullscreen && (
          <div className="absolute bottom-6 left-6 z-[60] flex items-center gap-2 transition-all duration-300">
             <button
                onClick={handleToggleScreen}
                className="p-3 bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400/30 text-white rounded-full transition-all backdrop-blur-md shadow-xl shadow-indigo-900/30 group flex items-center gap-2 hover:scale-105 active:scale-95"
                title={uiState === 'WORKSPACE' ? "Back to Edit Prompt" : "Back to Preview"}
            >
                {uiState === 'WORKSPACE' ? (
                     <LayoutTemplate className="w-5 h-5" />
                ) : (
                    <AppWindow className="w-5 h-5" />
                )}
            </button>
          </div>
      )}

      {/* --- SCREEN 1: LANDING (INPUT) --- */}
      {uiState === 'LANDING' && (
          <main className="flex-1 flex flex-col items-center justify-center relative z-20 p-6 animate-fade-in">
             <div className="w-full max-w-2xl flex flex-col items-center gap-8">
                {/* Hero Text */}
                <div className="text-center space-y-4">
                   <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                      What do you want to build?
                   </h1>
                   <p className="text-lg text-slate-400 max-w-md mx-auto">
                      Generate production-ready websites in seconds.
                   </p>
                </div>

                {/* Central Prompt Input */}
                <div className="w-full">
                    <PromptInput 
                        prompt={prompt} 
                        setPrompt={setPrompt} 
                        status={status} 
                        onGenerate={handleGenerate} 
                        onShowHistory={() => setIsHistoryOpen(true)}
                        isLanding={true}
                    />
                </div>

                {/* Footer Credits */}
                <div className="text-slate-600 text-sm mt-12 flex gap-4">
                   <span>Powered by Gemini 3.0</span>
                   <span>•</span>
                   <span>Tailwind CSS</span>
                </div>
             </div>
          </main>
      )}

      {/* --- SCREEN 2: WORKSPACE (PREVIEW ONLY - NO SIDEBAR) --- */}
      {uiState === 'WORKSPACE' && (
        <main className="flex-1 flex flex-row overflow-hidden relative z-10 animate-fade-in">
            {/* Main Content (Preview/Code) */}
            <div className="flex-1 flex flex-col h-full relative min-w-0">
                 {/* Workspace Toolbar */}
                 <div className="h-14 border-b border-white/5 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-4">
                     
                     {/* View Toggles */}
                     <div className="flex bg-white/5 p-1 rounded-lg">
                        <button onClick={() => setViewMode('PREVIEW')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${viewMode === 'PREVIEW' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button onClick={() => setViewMode('CODE')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${viewMode === 'CODE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Code className="w-3.5 h-3.5" /> Code
                        </button>
                     </div>

                     {/* Device Toggles (Middle) */}
                     {viewMode === 'PREVIEW' && (
                        <div className="hidden md:flex bg-white/5 p-1 rounded-lg border border-white/5">
                            <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded hover:bg-white/10 ${previewDevice === 'mobile' ? 'text-indigo-400' : 'text-slate-500'}`}><Smartphone className="w-4 h-4" /></button>
                            <button onClick={() => setPreviewDevice('tablet')} className={`p-1.5 rounded hover:bg-white/10 ${previewDevice === 'tablet' ? 'text-indigo-400' : 'text-slate-500'}`}><Tablet className="w-4 h-4" /></button>
                            <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded hover:bg-white/10 ${previewDevice === 'desktop' ? 'text-indigo-400' : 'text-slate-500'}`}><Monitor className="w-4 h-4" /></button>
                        </div>
                     )}

                     {/* Actions */}
                     <div className="flex items-center gap-2">
                         <button onClick={() => setIsEditable(!isEditable)} className={`p-2 rounded-lg transition-colors ${isEditable ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400 hover:text-white'}`} title="Visual Editor">
                            <Pencil className="w-4 h-4" />
                         </button>
                         <div className="w-px h-4 bg-white/10 mx-1" />
                         <button onClick={() => { handleOpenNewTab(); setHighlightNewTabBtn(false); }} className={`p-2 rounded-lg transition-colors ${highlightNewTabBtn ? 'text-indigo-400 animate-pulse' : 'text-slate-400 hover:text-white'}`} title="New Tab">
                             <ExternalLink className="w-4 h-4" />
                         </button>
                         <button onClick={handleDownload} className="bg-white text-slate-900 hover:bg-slate-200 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors">
                             <Download className="w-3.5 h-3.5" /> Export
                         </button>
                     </div>
                 </div>

                 {/* Content Frame */}
                 <div className="flex-1 relative overflow-hidden bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center">
                    {status === GenerationStatus.ERROR && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="bg-slate-900 border border-red-500/30 p-8 rounded-xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
                                <p className="text-white text-lg font-medium mb-6 font-serif">{errorMessage}</p>
                                <button onClick={() => setStatus(GenerationStatus.IDLE)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full transition-colors text-sm font-medium uppercase tracking-wide">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {viewMode === 'PREVIEW' ? (
                        <div className="w-full h-full p-0 lg:p-4 overflow-hidden flex items-center justify-center">
                            <div className={`
                                relative transition-all duration-500 shadow-2xl bg-white
                                ${previewDevice === 'mobile' ? 'w-[375px] h-[812px] rounded-[3rem] border-[8px] border-slate-800 shadow-xl overflow-hidden' : ''}
                                ${previewDevice === 'tablet' ? 'w-[768px] h-[1024px] rounded-[2rem] border-[8px] border-slate-800 shadow-xl overflow-hidden' : ''}
                                ${previewDevice === 'desktop' ? 'w-full h-full rounded-none border-0' : ''}
                            `}>
                                {status === GenerationStatus.GENERATING && (
                                    <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center rounded-inherit transition-all duration-500">
                                       <div className="relative">
                                           {/* Ping effect behind */}
                                           <div className={`absolute inset-0 ${LOADING_STEPS[loadingStep].color.replace('text-', 'bg-')}/20 rounded-full animate-ping`}></div>
                                           
                                           <div className="relative bg-slate-900 border border-white/10 p-4 rounded-full shadow-2xl mb-8">
                                               {React.createElement(LOADING_STEPS[loadingStep].icon, { 
                                                   className: `w-10 h-10 ${LOADING_STEPS[loadingStep].color} animate-pulse` 
                                               })}
                                           </div>
                                       </div>
                                       
                                       <h3 className="text-xl md:text-2xl font-serif italic text-white mb-2 animate-fade-in text-center px-4 tracking-wide">
                                          {LOADING_STEPS[loadingStep].text}
                                       </h3>
                                       
                                       {/* Progress Bar (Fake) */}
                                       <div className="w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden mt-6">
                                          <div className={`h-full ${LOADING_STEPS[loadingStep].color.replace('text-', 'bg-')} animate-[pulse_1s_ease-in-out_infinite] w-full origin-left`}></div>
                                       </div>
                                    </div>
                                )}
                                <div className={`w-full h-full overflow-hidden bg-white ${previewDevice !== 'desktop' ? 'rounded-[2.4rem]' : ''}`}>
                                    <PreviewFrame content={previewContent} refreshKey={iframeKey} isLoading={isPreviewLoading} isEditable={isEditable} onContentUpdate={handleVisualEditUpdate} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <CodeEditor content={generatedContent} onChange={handleCodeChange} />
                    )}
                 </div>
            </div>
        </main>
      )}

      {/* History Sidebar - Kept for accessibility but minimal */}
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} onSelect={(item) => { setPrompt(item.prompt); handleHistorySelect(item.content); setIframeKey(k => k + 1); setViewMode('PREVIEW'); }} onClear={handleClearHistory} />
    </div>
  );
};

export default App;

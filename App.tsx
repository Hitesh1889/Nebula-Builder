
import React, { useState, useEffect, useRef } from 'react';
import { Eye, Code, Download, ExternalLink, Maximize, Minimize, XCircle, Smartphone, Tablet, Monitor, Pencil, Home, AppWindow, Play, ArrowLeft, ArrowRight, LayoutTemplate, Wand2, Palette, Sparkles, Rocket, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import PreviewFrame from './components/PreviewFrame';
import CodeEditor from './components/CodeEditor';
import HistorySidebar from './components/HistorySidebar';
import SEOAgent from './components/SEOAgent';
import ModelSelector from './components/ModelSelector';
import { generateWebsite, clearApiKey, getQuotaWaitSeconds } from './services/aiService';
import { GenerationStatus, ViewMode, WebsiteHistoryItem, GeneratedContent } from './types';
import { useUndoRedoState } from './hooks/useAppHistory';
import { DEFAULT_MODEL, AVAILABLE_MODELS } from './constants';
import ApiKeySetup from './components/ApiKeySetup';
import { hasApiKey } from './services/aiService';

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
  // API Key Gate — only shown when no key is available
  const [keyReady, setKeyReady] = useState<boolean>(hasApiKey());

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
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [quotaCountdown, setQuotaCountdown] = useState<number>(0);
  const [activeModel, setActiveModel] = useState<string>('');
  const quotaTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const generationStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
    if (timerRef.current) clearInterval(timerRef.current);
    setGeneratedContent(content); 
    setPreviewContent(content); 
    setIsPreviewLoading(false);
    setIsEditable(false); 
    setErrorMessage('');
    setIframeKey(prev => prev + 1); 
    setHighlightNewTabBtn(true);
    setUiState('WORKSPACE');
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
    const model = modelId || selectedModel;
    setStatus(GenerationStatus.GENERATING);
    setErrorMessage('');
    setViewMode('PREVIEW');
    setHighlightNewTabBtn(false);
    setUiState('WORKSPACE');
    setElapsedTime(0);
    generationStartRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - generationStartRef.current) / 1000));
    }, 1000);
    try {
      const result = await generateWebsite(prompt, model, (partialText: string, tryingModel?: string) => {
        if (tryingModel) setActiveModel(tryingModel);
        try {
          const partial = JSON.parse(partialText);
          if (partial?.html) {
            setGeneratedContent(partial);
            setPreviewContent(partial);
          }
        } catch { /* expected during streaming */ }
      });
      handleGenerationSuccess(result.content);
      setActiveModel(result.usedModel + ' (' + result.usedProvider + ')');
      setStatus(GenerationStatus.COMPLETED);
      saveToSidebarHistory({ id: crypto.randomUUID(), prompt, content: result.content, timestamp: Date.now(), model: result.usedModel });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      if (msg === 'API_KEY_MISSING' || msg === 'API_KEY_INVALID') {
        clearApiKey();
        setKeyReady(false);
        return;
      }
      if (timerRef.current) clearInterval(timerRef.current);
      // Handle quota-all-blocked with auto-retry countdown
      if (msg.startsWith('QUOTA_ALL_BLOCKED:')) {
        const secs = parseInt(msg.split(':')[1]) || 60;
        setQuotaCountdown(secs);
        if (quotaTimerRef.current) clearInterval(quotaTimerRef.current);
        quotaTimerRef.current = setInterval(() => {
          setQuotaCountdown(prev => {
            if (prev <= 1) {
              clearInterval(quotaTimerRef.current!);
              quotaTimerRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setStatus(GenerationStatus.ERROR);
        setErrorMessage('QUOTA_BLOCKED');
        return;
      }
      setStatus(GenerationStatus.ERROR);
      setErrorMessage(msg);
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
      // Picsum: reliable, fast, always works — seed-based for consistency
      function fixImage(img) {
        if (img.dataset.fixed) return;
        img.dataset.fixed = '1';
        const raw = (img.alt || img.dataset.seed || 'photo').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0,20) || 'photo';
        img.src = 'https://picsum.photos/seed/' + raw + '/800/500';
        img.style.objectFit = 'cover';
        img.onerror = null;
      }
      window.addEventListener('error', function(e) {
        if (e.target && e.target.tagName === 'IMG') fixImage(e.target);
      }, true);
      window.addEventListener('DOMContentLoaded', () => {
         document.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            if (!src || src === window.location.href || src.includes('null') || src.includes('undefined') || src === '#' || src.startsWith('data:') === false && src.length < 5) {
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
    // FIX: Use Blob URL instead of document.write
    // document.write strips injected scripts and breaks SPA navigation
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Revoke after a delay to allow the tab to load
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  // --- RENDER ---
  if (!keyReady) {
    return <ApiKeySetup onKeySet={() => setKeyReady(true)} />;
  }

  return (
    <div className={`h-[100dvh] flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative ${theme}`}>
      <Background />
      
      {/* Universal Header (Glass) */}
      {!isFullscreen && (
          <div className="z-50 relative">
             <Header theme={theme} onToggleTheme={toggleTheme} onGoHome={handleGoHome} onChangeKey={() => setKeyReady(false)} />
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
          <main className="flex-1 flex flex-col items-center justify-center relative z-20 p-6 animate-fade-in overflow-y-auto">
             <div className="w-full max-w-2xl flex flex-col items-center gap-6 py-8">

                {/* Badge */}
                <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full backdrop-blur-md">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-xs font-semibold text-indigo-300 tracking-wider uppercase">Powered by Groq + OpenRouter</span>
                </div>

                {/* Hero Text */}
                <div className="text-center space-y-3">
                   <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
                      Build any website<br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">in under 10 seconds</span>
                   </h1>
                   <p className="text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
                      Describe your dream website. Visinaro generates a full 5-page site — with unique images, SEO meta tags, responsive design, and working navigation — instantly.
                   </p>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['🖼️ Unique Images', '🎨 Custom Logo', '📱 Responsive', '🔍 SEO Ready', '⚡ 5 Pages', '📥 Exportable'].map(f => (
                    <span key={f} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 backdrop-blur-md">{f}</span>
                  ))}
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
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                    />
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-center">
                  {[
                    { val: '10s', label: 'Avg. Generation' },
                    { val: '5', label: 'Pages Generated' },
                    { val: '100%', label: 'Copyright-Free' },
                  ].map(({ val, label }) => (
                    <div key={label} className="flex flex-col items-center gap-0.5">
                      <span className="text-xl font-bold text-white">{val}</span>
                      <span className="text-xs text-slate-500">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="text-slate-700 text-xs flex gap-3 items-center">
                   <span>Visinaro v2.0</span><span>•</span>
                   <span>Groq + OpenRouter</span><span>•</span>
                   <span>Tailwind CSS</span><span>•</span>
                   <span>Free to use</span>
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
                         <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} disabled={status === GenerationStatus.GENERATING} />
                         <div className="w-px h-4 bg-white/10 mx-1" />
                         <SEOAgent content={generatedContent} prompt={prompt} onContentUpdate={(c) => { updateContent(c); setPreviewContent(c); setIframeKey(k => k+1); }} />
                         <div className="w-px h-4 bg-white/10 mx-1" />
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
                                
                                {errorMessage === 'QUOTA_BLOCKED' ? (
                                  <>
                                    <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                                      <span className="text-2xl font-bold text-amber-400">{quotaCountdown}</span>
                                    </div>
                                    <h3 className="text-white text-lg font-bold mb-2">API Rate Limit Reached</h3>
                                    <p className="text-slate-400 text-sm mb-2">
                                      All Gemini models have hit their free-tier quota limit.<br/>
                                      Auto-retrying in <span className="text-amber-400 font-bold">{quotaCountdown}s</span>...
                                    </p>
                                    <p className="text-slate-600 text-xs mb-6">
                                      Free tier allows ~60 requests/minute. Try switching to a different model or wait a moment.
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                      <button 
                                        onClick={() => { setStatus(GenerationStatus.IDLE); if(quotaTimerRef.current) clearInterval(quotaTimerRef.current); setQuotaCountdown(0); }}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full transition-colors text-sm font-medium"
                                      >
                                        Dismiss
                                      </button>
                                      <button 
                                        onClick={() => { setStatus(GenerationStatus.IDLE); if(quotaTimerRef.current) clearInterval(quotaTimerRef.current); setQuotaCountdown(0); setTimeout(() => handleGenerate(selectedModel), 100); }}
                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full transition-colors text-sm font-bold"
                                      >
                                        Retry Now
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                    <p className="text-white text-base font-medium mb-6 font-serif">{errorMessage}</p>
                                    <button onClick={() => setStatus(GenerationStatus.IDLE)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full transition-colors text-sm font-medium uppercase tracking-wide">
                                        Close
                                    </button>
                                  </>
                                )}
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
                                {status === GenerationStatus.GENERATING && (() => {
                                    const modelInfo = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];
                                    const progress = Math.min((elapsedTime / modelInfo.estimatedTime) * 100, 95);
                                    return (
                                    <div className="absolute inset-0 z-20 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center rounded-inherit transition-all duration-500 gap-6">
                                       {/* Animated icon */}
                                       <div className="relative">
                                           <div className={`absolute inset-0 ${LOADING_STEPS[loadingStep].color.replace('text-', 'bg-')}/20 rounded-full animate-ping`}></div>
                                           <div className="relative bg-slate-900 border border-white/10 p-5 rounded-full shadow-2xl">
                                               {React.createElement(LOADING_STEPS[loadingStep].icon, { 
                                                   className: `w-10 h-10 ${LOADING_STEPS[loadingStep].color} animate-pulse` 
                                               })}
                                           </div>
                                       </div>
                                       
                                       {/* Status text */}
                                       <div className="text-center">
                                         <h3 className="text-xl font-serif italic text-white mb-1 animate-fade-in tracking-wide">
                                           {LOADING_STEPS[loadingStep].text}
                                         </h3>
                                         <div className="flex items-center justify-center gap-2 mt-1">
                                           <p className="text-slate-500 text-sm">
                                             Using {AVAILABLE_MODELS.find(m => m.id === (activeModel || selectedModel))?.name || modelInfo.name}
                                           </p>
                                           {activeModel && activeModel !== selectedModel && (
                                             <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                                               auto-switched
                                             </span>
                                           )}
                                         </div>
                                       </div>

                                       {/* Real progress bar */}
                                       <div className="w-64 space-y-2">
                                         <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                           <div 
                                             className={`h-full ${LOADING_STEPS[loadingStep].color.replace('text-', 'bg-')} rounded-full transition-all duration-1000`}
                                             style={{ width: `${progress}%` }}
                                           />
                                         </div>
                                         <div className="flex justify-between text-xs text-slate-600">
                                           <span>{elapsedTime}s elapsed</span>
                                           <span>~{modelInfo.estimatedTime}s estimated</span>
                                         </div>
                                       </div>
                                    </div>
                                    );
                                })()}
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

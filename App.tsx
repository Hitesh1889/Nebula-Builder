import React, { useState, useEffect, useRef } from 'react';
import {
  Eye, Code, Download, ExternalLink, Maximize, Monitor, Smartphone, Tablet,
  Pencil, Sparkles, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2,
  History, Wand2, Palette, Layers, Zap, Globe, ShoppingCart, Lock,
  ChevronRight, Play, LayoutGrid
} from 'lucide-react';
import JSZip from 'jszip';
import PreviewFrame from './components/PreviewFrame';
import CodeEditor from './components/CodeEditor';
import HistorySidebar from './components/HistorySidebar';
import SEOAgent from './components/SEOAgent';
import { generateWebsite, clearApiKey, hasApiKey } from './services/aiService';
import { GenerationStatus, ViewMode, WebsiteHistoryItem, GeneratedContent } from './types';
import { useUndoRedoState } from './hooks/useAppHistory';
import { DEFAULT_MODEL, AVAILABLE_MODELS } from './constants';
import ApiKeySetup from './components/ApiKeySetup';

// ─── Loading steps ────────────────────────────────────────────────────────────
const STEPS = [
  { text: 'Analyzing your vision…',      icon: Wand2,   color: '#a78bfa' },
  { text: 'Drafting layout structure…',  icon: Layers,  color: '#34d399' },
  { text: 'Picking the perfect palette…',icon: Palette, color: '#f472b6' },
  { text: 'Writing production HTML…',    icon: Code,    color: '#60a5fa' },
  { text: 'Adding images & icons…',      icon: Globe,   color: '#fb923c' },
  { text: 'Polishing every detail…',     icon: Sparkles,color: '#facc15' },
];

// ─── Quick-prompt chips ───────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: 'Coffee Shop',   value: 'Modern coffee shop website with warm tones, hero, menu, team, and contact.' },
  { label: 'Portfolio',     value: 'Minimalist dark portfolio for a UI/UX designer with case studies and contact.' },
  { label: 'SaaS Landing',  value: 'SaaS landing page with pricing, features, testimonials, and CTA sections.' },
  { label: 'E-commerce',    value: 'Fashion e-commerce store with product grid, cart, checkout, Razorpay & Stripe payment.' },
  { label: 'Gym Website',   value: 'High-energy gym website with classes, trainers, membership plans, and BMI calculator.' },
  { label: 'Restaurant',    value: 'Elegant restaurant website with full-screen food photos, menu, reservation, and map.' },
  { label: 'Music Festival',value: 'Vibrant neon music festival page with lineup, ticket pricing, and countdown timer.' },
  { label: 'Agency',        value: 'Premium creative agency website with services, case studies, team, and contact form.' },
];

// ─── Visinaro Logo SVG ────────────────────────────────────────────────────────
const Logo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M6 5V27"  stroke="#f97316" strokeWidth="5" strokeLinecap="round"/>
    <path d="M26 5V27" stroke="#10b981" strokeWidth="5" strokeLinecap="round"/>
    <path d="M6 27L26 5" stroke="#ef4444" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

// ─── Animated background particles ────────────────────────────────────────────
const Bg = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div style={{position:'absolute',top:'-20%',left:'-15%',width:700,height:700,background:'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)',borderRadius:'50%'}}/>
    <div style={{position:'absolute',top:'40%',right:'-20%',width:600,height:600,background:'radial-gradient(circle,rgba(139,92,246,0.10) 0%,transparent 70%)',borderRadius:'50%'}}/>
    <div style={{position:'absolute',bottom:'-15%',left:'30%',width:500,height:500,background:'radial-gradient(circle,rgba(236,72,153,0.07) 0%,transparent 70%)',borderRadius:'50%'}}/>
    {/* subtle grid */}
    <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
  </div>
);

// ─── Feature cards for landing ────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap,          label:'Instant',        desc:'Full site in 3–5 sec with Groq LPU'      },
  { icon: Globe,        label:'5 Pages',         desc:'Home, About, Services, Portfolio, Contact'},
  { icon: ShoppingCart, label:'E-commerce',      desc:'Cart, checkout, Razorpay & Stripe ready'  },
  { icon: Lock,         label:'Auth Ready',      desc:'Login, signup, Google, Facebook, Instagram'},
  { icon: Smartphone,   label:'Responsive',      desc:'Looks perfect on every device'            },
  { icon: LayoutGrid,   label:'Export & Deploy', desc:'Download zip or open in new tab'          },
];

// ─── Main App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [keyReady, setKeyReady]     = useState<boolean>(hasApiKey());
  const [screen, setScreen]         = useState<'landing'|'workspace'>('landing');
  const [status, setStatus]         = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [errorMsg, setErrorMsg]     = useState<string>('');
  const [activeModelName, setActiveModelName] = useState<string>('');
  const [elapsed, setElapsed]       = useState(0);
  const [step, setStep]             = useState(0);
  const [viewMode, setViewMode]     = useState<ViewMode>('PREVIEW');
  const [device, setDevice]         = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [iframeKey, setIframeKey]   = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory]       = useState<WebsiteHistoryItem[]>([]);
  const [isEditable, setIsEditable] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  const timerRef  = useRef<ReturnType<typeof setInterval>|null>(null);
  const stepRef   = useRef<ReturnType<typeof setInterval>|null>(null);
  const startRef  = useRef<number>(0);

  const { prompt, setPrompt, content, setContent, updateContent } = useUndoRedoState('');
  const [previewContent, setPreviewContent] = useState<GeneratedContent|null>(null);

  // Load history
  useEffect(() => {
    try { const s = localStorage.getItem('visinaro_history'); if (s) setHistory(JSON.parse(s)); } catch {}
  }, []);

  // Loading step animation
  useEffect(() => {
    if (status === GenerationStatus.GENERATING) {
      setStep(0);
      stepRef.current = setInterval(() => setStep(p => (p+1) % STEPS.length), 2200);
    } else {
      if (stepRef.current) clearInterval(stepRef.current);
    }
    return () => { if (stepRef.current) clearInterval(stepRef.current); };
  }, [status]);

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setStatus(GenerationStatus.GENERATING);
    setErrorMsg('');
    setScreen('workspace');
    setViewMode('PREVIEW');
    setElapsed(0);
    setActiveModelName('');
    startRef.current = Date.now();
    stopTimer();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now()-startRef.current)/1000)), 1000);

    try {
      const result = await generateWebsite(prompt, selectedModel, (partial, modelName) => {
        if (modelName) setActiveModelName(modelName);
        try {
          const p = JSON.parse(partial);
          if (p?.html) { setContent(p); setPreviewContent(p); }
        } catch {}
      });
      stopTimer();
      setContent(result.content);
      setPreviewContent(result.content);
      setActiveModelName(result.usedModel);
      setIframeKey(k => k+1);
      setStatus(GenerationStatus.COMPLETED);
      const item: WebsiteHistoryItem = { id: crypto.randomUUID(), prompt, content: result.content, timestamp: Date.now(), model: result.usedModel };
      const updated = [item, ...history].slice(0, 50);
      setHistory(updated);
      localStorage.setItem('visinaro_history', JSON.stringify(updated));
    } catch (err: any) {
      stopTimer();
      const msg = err?.message || 'Generation failed.';
      if (msg === 'API_KEY_MISSING' || msg === 'API_KEY_INVALID') { clearApiKey(); setKeyReady(false); return; }
      setStatus(GenerationStatus.ERROR);
      // Clean up the error for display
      const clean = msg.replace(/HTTP_\d+:\s*/,'').replace(/\{.*\}/s,'').trim() || 'All AI providers failed. Please try again.';
      setErrorMsg(clean.length > 200 ? clean.slice(0,200)+'…' : clean);
    }
  };

  const handleCodeChange = (t:'html'|'css'|'javascript', v:string) => {
    if (!content) return;
    const nc = {...content,[t]:v}; updateContent(nc); setPreviewContent(nc);
  };

  const handleDownload = async () => {
    if (!content) return;
    const zip = new JSZip();
    // Build a standalone HTML from the iframe logic
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"><\/script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"><style>${content.css}</style></head><body>${content.html}<script>${content.javascript}<\/script></body></html>`;
    zip.file('index.html', html);
    const blob = await zip.generateAsync({type:'blob'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'visinaro-website.zip'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    if (!content) return;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"><\/script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"><style>${content.css}</style></head><body>${content.html}<script>${content.javascript}<\/script></body></html>`;
    const blob = new Blob([html],{type:'text/html'});
    const url = URL.createObjectURL(blob);
    window.open(url,'_blank');
    setTimeout(()=>URL.revokeObjectURL(url),15000);
  };

  // ── Key gate ──────────────────────────────────────────────────────────────
  if (!keyReady) return <ApiKeySetup onKeySet={() => setKeyReady(true)} />;

  // ── LANDING SCREEN ────────────────────────────────────────────────────────
  if (screen === 'landing') return (
    <div style={{minHeight:'100dvh',background:'#06060f',color:'white',fontFamily:'Inter,sans-serif',position:'relative',overflowY:'auto',overflowX:'hidden'}}>
      <Bg/>

      {/* ── NAV ── */}
      <nav style={{position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',background:'rgba(6,6,15,0.7)'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Logo size={26}/>
            <span style={{fontWeight:700,fontSize:18,letterSpacing:'-0.3px'}}>Visinaro</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {history.length > 0 && (
              <button onClick={()=>setIsHistoryOpen(true)}
                style={{padding:'6px 14px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#94a3b8',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                <History style={{width:14,height:14}}/> History
              </button>
            )}
            <button onClick={()=>setKeyReady(false)}
              style={{padding:'6px 14px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#94a3b8',fontSize:13,cursor:'pointer'}}>
              API Keys
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{maxWidth:800,margin:'0 auto',padding:'80px 24px 60px',textAlign:'center',position:'relative',zIndex:10}}>

        {/* Status pill */}
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 16px',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:999,marginBottom:36}}>
          <span style={{width:7,height:7,background:'#4ade80',borderRadius:'50%',display:'block',animation:'pulse 2s infinite'}}/>
          <span style={{fontSize:11,fontWeight:600,color:'#a5b4fc',letterSpacing:'0.08em',textTransform:'uppercase'}}>AI-Powered · Groq + OpenRouter · No Limits</span>
        </div>

        {/* Headline */}
        <h1 style={{fontSize:'clamp(40px,7vw,72px)',fontWeight:800,lineHeight:1.08,letterSpacing:'-2px',margin:'0 0 24px'}}>
          <span style={{color:'white'}}>Build any website</span><br/>
          <span style={{background:'linear-gradient(135deg,#818cf8,#c084fc,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>in seconds, not hours</span>
        </h1>

        <p style={{fontSize:18,color:'#64748b',maxWidth:540,margin:'0 auto 48px',lineHeight:1.7}}>
          Describe your dream website. Visinaro generates a complete, production-ready site — images, navigation, e-commerce, login — instantly.
        </p>

        {/* ── PROMPT BOX ── */}
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:20,marginBottom:20,boxShadow:'0 0 80px rgba(99,102,241,0.08)'}}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && (e.ctrlKey||e.metaKey)) handleGenerate(); }}
            placeholder="Describe your website… e.g. 'Modern coffee shop with warm colors, menu, team photos, and online ordering'"
            rows={4}
            style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'white',fontSize:15,lineHeight:1.7,resize:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}
          />

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:12,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            {/* Model selector */}
            <div style={{display:'flex',gap:6}}>
              {AVAILABLE_MODELS.map(m => (
                <button key={m.id} onClick={()=>setSelectedModel(m.id)}
                  style={{padding:'5px 12px',borderRadius:8,fontSize:11,fontWeight:600,cursor:'pointer',
                    background: selectedModel===m.id ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                    border: selectedModel===m.id ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: selectedModel===m.id ? '#a5b4fc' : '#475569',
                    transition:'all 0.15s'}}>
                  {m.name} <span style={{opacity:0.6}}>~{m.estimatedTime}s</span>
                </button>
              ))}
            </div>

            {/* Generate button */}
            <button onClick={handleGenerate}
              disabled={!prompt.trim()}
              style={{display:'flex',alignItems:'center',gap:8,padding:'10px 24px',
                background: prompt.trim() ? 'white' : 'rgba(255,255,255,0.08)',
                color: prompt.trim() ? '#0f172a' : '#475569',
                borderRadius:12,fontWeight:700,fontSize:14,cursor:prompt.trim()?'pointer':'default',
                border:'none',transition:'all 0.2s',boxShadow:prompt.trim()?'0 4px 20px rgba(255,255,255,0.15)':'none'}}>
              <Play style={{width:14,height:14}}/> Generate
            </button>
          </div>
        </div>

        {/* Quick prompts */}
        <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:48}}>
          {QUICK_PROMPTS.map(q => (
            <button key={q.label} onClick={()=>{setPrompt(q.value);}}
              style={{padding:'6px 14px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:999,color:'#64748b',fontSize:12,cursor:'pointer',transition:'all 0.15s',display:'flex',alignItems:'center',gap:5}}>
              ✦ {q.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{display:'flex',justifyContent:'center',gap:40}}>
          {[['3–5s','Generation Speed'],['8+','Pages & Sections'],['100%','Copyright-Free']].map(([v,l])=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:800,color:'white',lineHeight:1}}>{v}</div>
              <div style={{fontSize:12,color:'#334155',marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{maxWidth:1100,margin:'0 auto',padding:'0 24px 80px',position:'relative',zIndex:10}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <p style={{fontSize:11,fontWeight:700,color:'#6366f1',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12}}>Everything included</p>
          <h2 style={{fontSize:32,fontWeight:700,color:'white',letterSpacing:'-0.5px',margin:0}}>Everything you need, zero compromises</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
          {FEATURES.map(({icon:Icon,label,desc}) => (
            <div key={label} style={{padding:'24px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,display:'flex',alignItems:'flex-start',gap:14,transition:'all 0.2s'}}>
              <div style={{width:40,height:40,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon style={{width:18,height:18,color:'#818cf8'}}/>
              </div>
              <div>
                <div style={{fontWeight:600,color:'white',fontSize:15,marginBottom:4}}>{label}</div>
                <div style={{color:'#475569',fontSize:13,lineHeight:1.5}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{maxWidth:800,margin:'0 auto',padding:'0 24px 80px',position:'relative',zIndex:10,textAlign:'center'}}>
        <p style={{fontSize:11,fontWeight:700,color:'#6366f1',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12}}>Simple as 1-2-3</p>
        <h2 style={{fontSize:32,fontWeight:700,color:'white',letterSpacing:'-0.5px',margin:'0 0 40px'}}>How it works</h2>
        <div style={{display:'flex',flexDirection:'column',gap:0}}>
          {[
            ['01', 'Describe', 'Type what kind of website you want in plain English. Be as specific as you like.'],
            ['02', 'Generate', 'Our AI builds a complete multi-page site with images, navigation, and interactivity in seconds.'],
            ['03', 'Export',   'Preview, edit the code, optimize for SEO, then download as a ZIP or open in a new tab.'],
          ].map(([num,title,desc],i)=>(
            <div key={num} style={{display:'flex',gap:24,textAlign:'left',padding:'28px 0',borderBottom:i<2?'1px solid rgba(255,255,255,0.05)':'none'}}>
              <div style={{fontSize:13,fontWeight:700,color:'rgba(99,102,241,0.4)',minWidth:32,paddingTop:4}}>{num}</div>
              <div>
                <div style={{fontWeight:700,color:'white',fontSize:18,marginBottom:6}}>{title}</div>
                <div style={{color:'#475569',fontSize:14,lineHeight:1.6}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.05)',padding:'24px',textAlign:'center',color:'#1e293b',fontSize:12,position:'relative',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8}}>
          <Logo size={16}/> <span style={{color:'#334155',fontWeight:600}}>Visinaro</span>
        </div>
        Powered by Groq · OpenRouter · Tailwind CSS · Free to use
      </footer>

      <HistorySidebar isOpen={isHistoryOpen} onClose={()=>setIsHistoryOpen(false)} history={history}
        onSelect={(item)=>{setPrompt(item.prompt);setContent(item.content);setPreviewContent(item.content);setScreen('workspace');setIframeKey(k=>k+1);}}
        onClear={()=>{setHistory([]);localStorage.removeItem('visinaro_history');}} />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        textarea::placeholder { color:#1e293b; }
        button:hover { opacity:0.85; }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  );

  // ── WORKSPACE SCREEN ──────────────────────────────────────────────────────
  const modelInfo = AVAILABLE_MODELS.find(m=>m.id===selectedModel)||AVAILABLE_MODELS[0];
  const progress  = Math.min((elapsed / (modelInfo.estimatedTime||10)) * 100, 94);
  const curStep   = STEPS[step % STEPS.length];

  return (
    <div style={{height:'100dvh',display:'flex',flexDirection:'column',background:'#06060f',color:'white',fontFamily:'Inter,sans-serif',overflow:'hidden'}}>

      {/* ── WORKSPACE NAV ── */}
      <div style={{height:52,background:'rgba(6,6,15,0.95)',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',flexShrink:0,zIndex:50,backdropFilter:'blur(20px)'}}>
        {/* Left */}
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>setScreen('landing')} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#64748b',fontSize:12,cursor:'pointer'}}>
            <ArrowLeft style={{width:13,height:13}}/> Home
          </button>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <Logo size={20}/>
            <span style={{fontWeight:600,fontSize:14,color:'#e2e8f0'}}>Visinaro</span>
          </div>
          {activeModelName && (
            <span style={{fontSize:11,padding:'3px 10px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:99,color:'#818cf8'}}>
              {activeModelName.split('/').pop()}
            </span>
          )}
          {status===GenerationStatus.COMPLETED && (
            <span style={{fontSize:11,padding:'3px 10px',background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.2)',borderRadius:99,color:'#34d399',display:'flex',alignItems:'center',gap:4}}>
              <CheckCircle2 style={{width:10,height:10}}/> Ready
            </span>
          )}
        </div>

        {/* Center — view tabs */}
        <div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:8,padding:3,gap:2}}>
          {(['PREVIEW','CODE'] as const).map(v=>(
            <button key={v} onClick={()=>setViewMode(v)}
              style={{padding:'5px 14px',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer',border:'none',
                background:viewMode===v?'rgba(255,255,255,0.1)':'transparent',
                color:viewMode===v?'white':'#475569',transition:'all 0.15s'}}>
              {v==='PREVIEW'?'Preview':'Code'}
            </button>
          ))}
        </div>

        {/* Right — actions */}
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          {viewMode==='PREVIEW' && (
            <div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:8,padding:3,gap:2}}>
              {([['mobile',Smartphone],['tablet',Tablet],['desktop',Monitor]] as const).map(([d,Icon])=>(
                <button key={d} onClick={()=>setDevice(d as any)}
                  style={{padding:'5px 8px',borderRadius:6,cursor:'pointer',border:'none',
                    background:device===d?'rgba(255,255,255,0.1)':'transparent',
                    color:device===d?'white':'#475569',transition:'all 0.15s'}}>
                  <Icon style={{width:14,height:14}}/>
                </button>
              ))}
            </div>
          )}
          <div style={{width:1,height:20,background:'rgba(255,255,255,0.08)'}}/>
          <SEOAgent content={content} prompt={prompt} onContentUpdate={c=>{updateContent(c);setPreviewContent(c);setIframeKey(k=>k+1);}}/>
          <button onClick={()=>setIsEditable(!isEditable)}
            style={{padding:'5px 8px',borderRadius:6,cursor:'pointer',border:'none',
              background:isEditable?'rgba(99,102,241,0.15)':'transparent',
              color:isEditable?'#818cf8':'#475569'}}>
            <Pencil style={{width:14,height:14}}/>
          </button>
          <button onClick={handleOpenNewTab} title="Open in new tab"
            style={{padding:'5px 8px',borderRadius:6,cursor:'pointer',border:'none',background:'transparent',color:'#475569'}}>
            <ExternalLink style={{width:14,height:14}}/>
          </button>
          <button onClick={handleDownload} disabled={!content}
            style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',background:content?'white':'rgba(255,255,255,0.06)',color:content?'#0f172a':'#334155',borderRadius:8,fontWeight:700,fontSize:12,cursor:content?'pointer':'default',border:'none'}}>
            <Download style={{width:12,height:12}}/> Export
          </button>
          <button onClick={handleGenerate}
            style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',color:'#a5b4fc',borderRadius:8,fontWeight:700,fontSize:12,cursor:'pointer'}}>
            <RefreshCw style={{width:12,height:12}}/> Regenerate
          </button>
        </div>
      </div>

      {/* ── PROMPT BAR ── */}
      <div style={{background:'rgba(6,6,15,0.8)',borderBottom:'1px solid rgba(255,255,255,0.04)',padding:'8px 16px',display:'flex',gap:10,flexShrink:0}}>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={1}
          onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))handleGenerate();}}
          placeholder="Describe your website…"
          style={{flex:1,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'8px 12px',color:'white',fontSize:13,fontFamily:'Inter,sans-serif',resize:'none',outline:'none',lineHeight:1.5}}
        />
        <button onClick={handleGenerate}
          style={{padding:'8px 20px',background:'white',color:'#0f172a',borderRadius:8,fontWeight:700,fontSize:13,cursor:'pointer',border:'none',flexShrink:0,display:'flex',alignItems:'center',gap:6}}>
          <Play style={{width:12,height:12}}/> Generate
        </button>
      </div>

      {/* ── CONTENT AREA ── */}
      <div style={{flex:1,overflow:'hidden',position:'relative',display:'flex',flexDirection:'column'}}>

        {/* Loading overlay */}
        {status===GenerationStatus.GENERATING && (
          <div style={{position:'absolute',inset:0,zIndex:40,background:'rgba(6,6,15,0.95)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:28}}>
            <div style={{position:'relative'}}>
              <div style={{position:'absolute',inset:-12,borderRadius:'50%',border:`2px solid ${curStep.color}`,opacity:0.2,animation:'ping 1.5s infinite'}}/>
              <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {React.createElement(curStep.icon,{style:{width:28,height:28,color:curStep.color}})}
              </div>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:18,fontWeight:600,color:'white',marginBottom:6}}>{curStep.text}</p>
              <p style={{fontSize:13,color:'#334155'}}>{activeModelName || 'Connecting to AI…'}</p>
            </div>
            <div style={{width:280}}>
              <div style={{height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:2,background:`linear-gradient(90deg,#6366f1,${curStep.color})`,width:`${progress}%`,transition:'width 1s ease'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:11,color:'#1e293b'}}>
                <span>{elapsed}s elapsed</span><span>~{modelInfo.estimatedTime}s</span>
              </div>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {status===GenerationStatus.ERROR && (
          <div style={{position:'absolute',inset:0,zIndex:40,background:'rgba(6,6,15,0.9)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
            <div style={{background:'#0f172a',border:'1px solid rgba(239,68,68,0.3)',borderRadius:16,padding:32,maxWidth:440,width:'100%',textAlign:'center',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#ef4444,#f97316)'}}/>
              <AlertTriangle style={{width:40,height:40,color:'#ef4444',margin:'0 auto 16px'}}/>
              <h3 style={{color:'white',fontWeight:700,fontSize:16,marginBottom:8}}>Generation Failed</h3>
              <p style={{color:'#64748b',fontSize:13,lineHeight:1.6,marginBottom:20}}>{errorMsg || 'All AI providers were unavailable. Please try again or check your API keys.'}</p>
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button onClick={()=>{setStatus(GenerationStatus.IDLE);setErrorMsg('');}}
                  style={{padding:'8px 20px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#94a3b8',fontSize:13,cursor:'pointer'}}>
                  Dismiss
                </button>
                <button onClick={()=>{setStatus(GenerationStatus.IDLE);setErrorMsg('');setTimeout(handleGenerate,100);}}
                  style={{padding:'8px 20px',background:'#6366f1',border:'none',borderRadius:8,color:'white',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                  <RefreshCw style={{width:13,height:13}}/> Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!content && status===GenerationStatus.IDLE && (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,color:'#1e293b'}}>
            <div style={{width:60,height:60,borderRadius:16,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Globe style={{width:24,height:24,color:'#334155'}}/>
            </div>
            <p style={{fontSize:14,color:'#334155'}}>Enter a prompt above and click Generate</p>
          </div>
        )}

        {/* Preview / Code */}
        {(content || status===GenerationStatus.GENERATING) && viewMode==='PREVIEW' && (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',padding: device==='desktop'?0:'16px',background:'#0a0a14'}}>
            <div style={{
              width: device==='mobile'?375:device==='tablet'?768:'100%',
              height: device==='mobile'?812:device==='tablet'?1024:'100%',
              borderRadius: device==='desktop'?0:device==='mobile'?40:24,
              border: device==='desktop'?'none':'8px solid #1e293b',
              overflow:'hidden',
              background:'white',
              boxShadow: device==='desktop'?'none':'0 40px 80px rgba(0,0,0,0.8)',
              transition:'all 0.4s ease',
              flexShrink: device==='desktop'?1:0,
            }}>
              <PreviewFrame content={previewContent} refreshKey={iframeKey} isEditable={isEditable} onContentUpdate={newHtml=>{if(content){const nc={...content,html:newHtml};updateContent(nc);setPreviewContent(nc);}}}/>
            </div>
          </div>
        )}
        {content && viewMode==='CODE' && (
          <div style={{flex:1,overflow:'hidden'}}>
            <CodeEditor content={content} onChange={handleCodeChange}/>
          </div>
        )}
      </div>

      <HistorySidebar isOpen={isHistoryOpen} onClose={()=>setIsHistoryOpen(false)} history={history}
        onSelect={(item)=>{setPrompt(item.prompt);setContent(item.content);setPreviewContent(item.content);setIframeKey(k=>k+1);setViewMode('PREVIEW');setStatus(GenerationStatus.COMPLETED);}}
        onClear={()=>{setHistory([]);localStorage.removeItem('visinaro_history');}}/>

      <style>{`
        @keyframes ping { 75%,100%{transform:scale(1.5);opacity:0} }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  );
};

export default App;

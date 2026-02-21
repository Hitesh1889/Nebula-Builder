import React, { useState, useEffect, useRef } from 'react';
import {
  Eye, Code, Download, ExternalLink, Monitor, Smartphone, Tablet,
  Pencil, Sparkles, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2,
  History, Wand2, Palette, Layers, Globe, Play
} from 'lucide-react';
import JSZip from 'jszip';
import PreviewFrame from './components/PreviewFrame';
import CodeEditor from './components/CodeEditor';
import HistorySidebar from './components/HistorySidebar';
import SEOAgent from './components/SEOAgent';
import { generateWebsite } from './services/aiService';
import { GenerationStatus, ViewMode, WebsiteHistoryItem, GeneratedContent } from './types';
import { useUndoRedoState } from './hooks/useAppHistory';
import { DEFAULT_MODEL, AVAILABLE_MODELS } from './constants';

const STEPS = [
  { text: 'Analyzing your vision…',       icon: Wand2,    color: '#a78bfa' },
  { text: 'Drafting layout structure…',   icon: Layers,   color: '#34d399' },
  { text: 'Selecting the perfect palette…',icon: Palette, color: '#f472b6' },
  { text: 'Writing production HTML…',     icon: Code,     color: '#60a5fa' },
  { text: 'Adding images & details…',     icon: Globe,    color: '#fb923c' },
  { text: 'Polishing every pixel…',       icon: Sparkles, color: '#facc15' },
];

const QUICK_PROMPTS = [
  { label: 'Coffee Shop',   value: 'Modern coffee shop website with warm amber tones, hero section with full image, menu grid with prices, team section, and contact form.' },
  { label: 'Portfolio',     value: 'Minimalist dark portfolio for a UI/UX designer with case studies, skills section, and contact.' },
  { label: 'SaaS Landing',  value: 'SaaS landing page with pricing table, feature highlights, testimonials, and strong CTA.' },
  { label: 'E-commerce',    value: 'Fashion e-commerce store with product grid, cart, checkout, Razorpay and Stripe payment options.' },
  { label: 'Gym & Fitness', value: 'High-energy gym website with class schedule, trainer profiles, membership plans, and BMI calculator.' },
  { label: 'Restaurant',    value: 'Elegant restaurant website with food photography hero, interactive menu, reservation form, and map.' },
  { label: 'Creative Agency',value: 'Premium creative agency with services, case studies, team profiles, and contact form.' },
  { label: 'Personal Blog', value: 'Clean personal blog with featured posts, category filters, newsletter signup, and about page.' },
];

// Safe storage — works even when tracking prevention blocks localStorage
const safeStore = {
  get(k: string) { try { return localStorage.getItem(k) || sessionStorage.getItem(k) || ''; } catch { try { return sessionStorage.getItem(k)||''; } catch { return ''; } } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch {} try { sessionStorage.setItem(k, v); } catch {} },
  del(k: string) { try { localStorage.removeItem(k); } catch {} try { sessionStorage.removeItem(k); } catch {} },
};

const Logo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M6 5V27"  stroke="#f97316" strokeWidth="5" strokeLinecap="round"/>
    <path d="M26 5V27" stroke="#10b981" strokeWidth="5" strokeLinecap="round"/>
    <path d="M6 27L26 5" stroke="#ef4444" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

const App: React.FC = () => {
  const [screen, setScreen]   = useState<'landing'|'workspace'>('landing');
  const [status, setStatus]   = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [errorMsg, setErrorMsg]     = useState('');
  const [activeModelName, setActiveModelName] = useState('');
  const [elapsed, setElapsed]       = useState(0);
  const [step, setStep]             = useState(0);
  const [viewMode, setViewMode]     = useState<ViewMode>('PREVIEW');
  const [device, setDevice]         = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [iframeKey, setIframeKey]   = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory]       = useState<WebsiteHistoryItem[]>([]);
  const [isEditable, setIsEditable] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [groqKeyInput, setGroqKeyInput]   = useState('');
  const [orKeyInput, setOrKeyInput]       = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const stepRef  = useRef<ReturnType<typeof setInterval>|null>(null);
  const startRef = useRef<number>(0);

  const { prompt, setPrompt, content, setContent, updateContent } = useUndoRedoState('');
  const [previewContent, setPreviewContent] = useState<GeneratedContent|null>(null);

  useEffect(() => {
    try { const s = safeStore.get('visinaro_history'); if (s) setHistory(JSON.parse(s)); } catch {}
  }, []);

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
    setApiKeyMissing(false);
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
        try { const p = JSON.parse(partial); if (p?.html) { setContent(p); setPreviewContent(p); } } catch {}
      });
      stopTimer();
      setContent(result.content);
      setPreviewContent(result.content);
      setActiveModelName(result.usedModel);
      setIframeKey(k=>k+1);
      setStatus(GenerationStatus.COMPLETED);
      const item: WebsiteHistoryItem = { id: crypto.randomUUID(), prompt, content: result.content, timestamp: Date.now(), model: result.usedModel };
      const updated = [item, ...history].slice(0, 30);
      setHistory(updated);
      try { safeStore.set('visinaro_history', JSON.stringify(updated)); } catch {}
    } catch (err: any) {
      stopTimer();
      const msg = err?.message || 'Generation failed.';
      if (msg === 'API_KEY_MISSING') { setApiKeyMissing(true); setStatus(GenerationStatus.IDLE); setScreen('landing'); return; }
      setStatus(GenerationStatus.ERROR);
      const clean = msg.replace(/HTTP_\d+:\s*/,'').replace(/\{[\s\S]*?\}/g,'').trim();
      setErrorMsg(clean.length > 180 ? clean.slice(0,180)+'…' : clean || 'Generation failed. Please try again.');
    }
  };

  const handleSaveKeys = () => {
    if (groqKeyInput.trim()) { try { localStorage.setItem('visinaro_groq_key', groqKeyInput.trim()); } catch {} try { sessionStorage.setItem('visinaro_groq_key', groqKeyInput.trim()); } catch {} }
    if (orKeyInput.trim())   { try { localStorage.setItem('visinaro_or_key',   orKeyInput.trim());   } catch {} try { sessionStorage.setItem('visinaro_or_key',   orKeyInput.trim());   } catch {} }
    setApiKeyMissing(false);
    setTimeout(handleGenerate, 100);
  };

  const handleCodeChange = (t:'html'|'css'|'javascript', v:string) => {
    if (!content) return; const nc={...content,[t]:v}; updateContent(nc); setPreviewContent(nc);
  };

  const handleDownload = async () => {
    if (!content) return;
    const zip = new JSZip();
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"><\/script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"><style>${content.css}</style></head><body>${content.html}<script>${content.javascript}<\/script></body></html>`;
    zip.file('index.html', html);
    const blob = await zip.generateAsync({type:'blob'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'visinaro-website.zip';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    if (!content) return;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"><\/script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"><style>${content.css}</style></head><body>${content.html}<script>${content.javascript}<\/script></body></html>`;
    const blob = new Blob([html],{type:'text/html'});
    const url = URL.createObjectURL(blob);
    window.open(url,'_blank');
    setTimeout(()=>URL.revokeObjectURL(url),15000);
  };

  const modelInfo = AVAILABLE_MODELS.find(m=>m.id===selectedModel)||AVAILABLE_MODELS[0];
  const progress  = Math.min((elapsed/(modelInfo.estimatedTime||10))*100, 94);
  const curStep   = STEPS[step%STEPS.length];

  // ── API KEY MODAL ─────────────────────────────────────────────────────────
  if (apiKeyMissing) return (
    <div style={{minHeight:'100dvh',background:'#06060f',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{background:'#0f172a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:36,maxWidth:440,width:'100%',boxShadow:'0 40px 80px rgba(0,0,0,0.6)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <Logo size={36}/>
          <h2 style={{color:'white',fontSize:20,fontWeight:700,margin:'12px 0 6px'}}>Connect AI to Generate</h2>
          <p style={{color:'#475569',fontSize:13,lineHeight:1.6}}>Add your free API key to start building. Keys are stored only in your browser.</p>
        </div>

        <div style={{marginBottom:16}}>
          <label style={{display:'block',color:'#94a3b8',fontSize:12,fontWeight:600,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em'}}>
            Groq API Key <span style={{color:'#34d399',fontWeight:700}}>★ Primary · Free · Fastest</span>
          </label>
          <input value={groqKeyInput} onChange={e=>setGroqKeyInput(e.target.value)}
            placeholder="gsk_..."
            style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'10px 14px',color:'white',fontSize:13,fontFamily:'monospace',outline:'none',boxSizing:'border-box'}}/>
          <p style={{color:'#334155',fontSize:11,marginTop:5}}>Get free key at <strong style={{color:'#6366f1'}}>console.groq.com/keys</strong> (no credit card)</p>
        </div>

        <div style={{marginBottom:24}}>
          <label style={{display:'block',color:'#94a3b8',fontSize:12,fontWeight:600,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em'}}>
            OpenRouter Key <span style={{color:'#475569'}}>Optional · Backup</span>
          </label>
          <input value={orKeyInput} onChange={e=>setOrKeyInput(e.target.value)}
            placeholder="sk-or-v1-..."
            style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'10px 14px',color:'white',fontSize:13,fontFamily:'monospace',outline:'none',boxSizing:'border-box'}}/>
          <p style={{color:'#334155',fontSize:11,marginTop:5}}>Get free key at <strong style={{color:'#6366f1'}}>openrouter.ai/keys</strong></p>
        </div>

        <button onClick={handleSaveKeys} disabled={!groqKeyInput.trim() && !orKeyInput.trim()}
          style={{width:'100%',padding:'12px',background:groqKeyInput.trim()||orKeyInput.trim()?'white':'rgba(255,255,255,0.06)',color:groqKeyInput.trim()||orKeyInput.trim()?'#0f172a':'#475569',borderRadius:12,fontWeight:700,fontSize:15,cursor:'pointer',border:'none',boxSizing:'border-box'}}>
          Save & Generate Website
        </button>
        <button onClick={()=>{setApiKeyMissing(false);setStatus(GenerationStatus.IDLE);}}
          style={{width:'100%',padding:'10px',background:'transparent',color:'#334155',border:'none',cursor:'pointer',fontSize:13,marginTop:8}}>
          Cancel
        </button>
      </div>
    </div>
  );

  // ── LANDING ───────────────────────────────────────────────────────────────
  if (screen === 'landing') return (
    <div style={{minHeight:'100dvh',background:'#06060f',color:'white',fontFamily:'Inter,system-ui,sans-serif',position:'relative',overflowX:'hidden',overflowY:'auto'}}>
      {/* Background */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',top:'-15%',left:'-10%',width:600,height:600,background:'radial-gradient(circle,rgba(99,102,241,0.13) 0%,transparent 70%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',top:'30%',right:'-15%',width:500,height:500,background:'radial-gradient(circle,rgba(139,92,246,0.10) 0%,transparent 70%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',bottom:'-10%',left:'25%',width:450,height:450,background:'radial-gradient(circle,rgba(236,72,153,0.07) 0%,transparent 70%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)',backgroundSize:'64px 64px'}}/>
      </div>

      {/* Nav */}
      <nav style={{position:'sticky',top:0,zIndex:50,borderBottom:'1px solid rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',background:'rgba(6,6,15,0.75)'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Logo size={24}/>
            <span style={{fontWeight:800,fontSize:17,letterSpacing:'-0.4px'}}>Visinaro</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {history.length>0 && (
              <button onClick={()=>setIsHistoryOpen(true)}
                style={{padding:'6px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#64748b',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                <History style={{width:13,height:13}}/> History
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{maxWidth:780,margin:'0 auto',padding:'88px 24px 64px',textAlign:'center',position:'relative',zIndex:10}}>
        {/* Eyebrow */}
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 16px',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.18)',borderRadius:999,marginBottom:36}}>
          <span style={{width:6,height:6,background:'#4ade80',borderRadius:'50%',display:'block',boxShadow:'0 0 6px #4ade80'}}/>
          <span style={{fontSize:11,fontWeight:700,color:'#a5b4fc',letterSpacing:'0.1em',textTransform:'uppercase'}}>AI Website Builder · Live</span>
        </div>

        {/* Headline */}
        <h1 style={{fontSize:'clamp(38px,7vw,70px)',fontWeight:800,lineHeight:1.06,letterSpacing:'-2.5px',margin:'0 0 22px',fontFamily:'Inter,system-ui,sans-serif'}}>
          <span style={{color:'white'}}>Build any website</span><br/>
          <span style={{background:'linear-gradient(130deg,#818cf8 0%,#c084fc 50%,#f472b6 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>in seconds, not days</span>
        </h1>

        <p style={{fontSize:17,color:'#475569',maxWidth:520,margin:'0 auto 52px',lineHeight:1.75}}>
          Describe your website in plain English. Get a complete, production-ready site with pages, images, login, and e-commerce — instantly.
        </p>

        {/* Prompt box */}
        <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:20,padding:20,marginBottom:16,boxShadow:'0 0 80px rgba(99,102,241,0.07)',textAlign:'left'}}>
          <textarea
            value={prompt}
            onChange={e=>setPrompt(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))handleGenerate();}}
            placeholder={`Describe your website…\ne.g. "Modern coffee shop with warm colors, hero image, menu, team, and contact form"`}
            rows={4}
            style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'white',fontSize:15,lineHeight:1.7,resize:'none',fontFamily:'Inter,system-ui,sans-serif',boxSizing:'border-box',display:'block'}}
          />
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.06)',flexWrap:'wrap',gap:10}}>
            {/* Model tabs */}
            <div style={{display:'flex',gap:6}}>
              {AVAILABLE_MODELS.map(m=>(
                <button key={m.id} onClick={()=>setSelectedModel(m.id)}
                  style={{padding:'5px 12px',borderRadius:8,fontSize:11,fontWeight:600,cursor:'pointer',transition:'all 0.15s',
                    background:selectedModel===m.id?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.03)',
                    border:selectedModel===m.id?'1px solid rgba(99,102,241,0.45)':'1px solid rgba(255,255,255,0.07)',
                    color:selectedModel===m.id?'#a5b4fc':'#374151'}}>
                  {m.name} <span style={{opacity:0.55}}>~{m.estimatedTime}s</span>
                </button>
              ))}
            </div>
            {/* Generate */}
            <button onClick={handleGenerate} disabled={!prompt.trim()}
              style={{display:'flex',alignItems:'center',gap:8,padding:'10px 26px',
                background:prompt.trim()?'white':'rgba(255,255,255,0.06)',
                color:prompt.trim()?'#0f172a':'#374151',
                borderRadius:12,fontWeight:700,fontSize:14,cursor:prompt.trim()?'pointer':'default',border:'none',
                boxShadow:prompt.trim()?'0 4px 24px rgba(255,255,255,0.12)':'none',transition:'all 0.2s'}}>
              <Play style={{width:13,height:13}}/> Generate
            </button>
          </div>
        </div>

        {/* Quick prompts */}
        <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:56}}>
          {QUICK_PROMPTS.map(q=>(
            <button key={q.label} onClick={()=>setPrompt(q.value)}
              style={{padding:'6px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',
                borderRadius:999,color:'#4b5563',fontSize:12,cursor:'pointer',transition:'all 0.15s',fontFamily:'Inter,sans-serif'}}>
              {q.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{display:'flex',justifyContent:'center',gap:48,borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:32}}>
          {[['5+','Pages & Sections'],['100%','Copyright-Free Images'],['0','Credit Card Needed']].map(([v,l])=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:26,fontWeight:800,color:'white',lineHeight:1}}>{v}</div>
              <div style={{fontSize:12,color:'#1e293b',marginTop:5,fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{maxWidth:1060,margin:'0 auto',padding:'0 24px 80px',position:'relative',zIndex:10}}>
        <div style={{textAlign:'center',marginBottom:44}}>
          <p style={{fontSize:11,fontWeight:700,color:'#6366f1',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:10}}>What you get</p>
          <h2 style={{fontSize:30,fontWeight:700,color:'white',letterSpacing:'-0.5px',margin:0}}>Everything included. Zero extras needed.</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:14}}>
          {[
            ['⚡','Instant Generation','Full website built in 3–5 seconds with smart AI'],
            ['🖼️','Real Images','Auto-filled with topic-specific photos, never broken'],
            ['🛒','E-commerce Ready','Product grid, cart, checkout with Razorpay & Stripe'],
            ['🔐','Login & Auth','Sign in / sign up with Google, Facebook, Instagram'],
            ['📱','Fully Responsive','Looks perfect on mobile, tablet, and desktop'],
            ['📥','Export & Deploy','Download ZIP or open in a new tab instantly'],
          ].map(([icon,label,desc])=>(
            <div key={label} style={{padding:22,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,display:'flex',gap:14,alignItems:'flex-start'}}>
              <span style={{fontSize:22,lineHeight:1,marginTop:2}}>{icon}</span>
              <div>
                <div style={{fontWeight:600,color:'white',fontSize:14,marginBottom:4}}>{label}</div>
                <div style={{color:'#374151',fontSize:13,lineHeight:1.5}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.04)',padding:'20px 24px',textAlign:'center',position:'relative',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:6}}>
          <Logo size={15}/>
          <span style={{color:'#1e293b',fontWeight:600,fontSize:12}}>Visinaro</span>
        </div>
        <p style={{color:'#111827',fontSize:11,margin:0}}>AI-powered website builder · Free to use</p>
      </footer>

      <HistorySidebar isOpen={isHistoryOpen} onClose={()=>setIsHistoryOpen(false)} history={history}
        onSelect={item=>{setPrompt(item.prompt);setContent(item.content);setPreviewContent(item.content);setScreen('workspace');setIframeKey(k=>k+1);}}
        onClear={()=>{setHistory([]);safeStore.del('visinaro_history');}}/>

      <style>{`*{box-sizing:border-box}textarea::placeholder{color:#1e293b} button:hover{opacity:0.8}`}</style>
    </div>
  );

  // ── WORKSPACE ─────────────────────────────────────────────────────────────
  return (
    <div style={{height:'100dvh',display:'flex',flexDirection:'column',background:'#06060f',color:'white',fontFamily:'Inter,system-ui,sans-serif',overflow:'hidden'}}>

      {/* Top bar */}
      <div style={{height:50,background:'rgba(6,6,15,0.97)',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px',flexShrink:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>setScreen('landing')}
            style={{display:'flex',alignItems:'center',gap:5,padding:'5px 11px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:7,color:'#64748b',fontSize:12,cursor:'pointer'}}>
            <ArrowLeft style={{width:12,height:12}}/> Home
          </button>
          <Logo size={19}/>
          <span style={{fontWeight:700,fontSize:14,color:'#e2e8f0'}}>Visinaro</span>
          {activeModelName && <span style={{fontSize:11,padding:'2px 9px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:99,color:'#818cf8'}}>{activeModelName.split('/').pop()}</span>}
          {status===GenerationStatus.COMPLETED && <span style={{fontSize:11,padding:'2px 9px',background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.2)',borderRadius:99,color:'#34d399',display:'flex',alignItems:'center',gap:3}}><CheckCircle2 style={{width:9,height:9}}/> Ready</span>}
        </div>

        <div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:7,padding:3,gap:2}}>
          {(['PREVIEW','CODE'] as const).map(v=>(
            <button key={v} onClick={()=>setViewMode(v)}
              style={{padding:'4px 13px',borderRadius:5,fontSize:12,fontWeight:600,cursor:'pointer',border:'none',
                background:viewMode===v?'rgba(255,255,255,0.1)':'transparent',
                color:viewMode===v?'white':'#4b5563',transition:'all 0.15s'}}>
              {v==='PREVIEW'?'Preview':'Code'}
            </button>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:5}}>
          {viewMode==='PREVIEW' && (
            <div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:7,padding:3,gap:1}}>
              {([['mobile',Smartphone],['tablet',Tablet],['desktop',Monitor]] as const).map(([d,Icon])=>(
                <button key={d} onClick={()=>setDevice(d as any)}
                  style={{padding:'4px 7px',borderRadius:5,cursor:'pointer',border:'none',
                    background:device===d?'rgba(255,255,255,0.1)':'transparent',
                    color:device===d?'white':'#4b5563',transition:'all 0.15s'}}>
                  <Icon style={{width:13,height:13}}/>
                </button>
              ))}
            </div>
          )}
          <div style={{width:1,height:18,background:'rgba(255,255,255,0.07)'}}/>
          <SEOAgent content={content} prompt={prompt} onContentUpdate={c=>{updateContent(c);setPreviewContent(c);setIframeKey(k=>k+1);}}/>
          <button onClick={()=>setIsEditable(!isEditable)} title="Edit mode"
            style={{padding:'4px 7px',borderRadius:5,cursor:'pointer',border:'none',
              background:isEditable?'rgba(99,102,241,0.15)':'transparent',
              color:isEditable?'#818cf8':'#4b5563'}}>
            <Pencil style={{width:13,height:13}}/>
          </button>
          <button onClick={handleOpenNewTab} title="Open in new tab"
            style={{padding:'4px 7px',borderRadius:5,cursor:'pointer',border:'none',background:'transparent',color:'#4b5563'}}>
            <ExternalLink style={{width:13,height:13}}/>
          </button>
          <button onClick={handleDownload} disabled={!content}
            style={{display:'flex',alignItems:'center',gap:5,padding:'5px 13px',background:content?'white':'rgba(255,255,255,0.05)',color:content?'#0f172a':'#374151',borderRadius:8,fontWeight:700,fontSize:12,cursor:content?'pointer':'default',border:'none'}}>
            <Download style={{width:11,height:11}}/> Export
          </button>
          <button onClick={()=>{setStatus(GenerationStatus.IDLE);setErrorMsg('');setTimeout(handleGenerate,100);}}
            style={{display:'flex',alignItems:'center',gap:5,padding:'5px 13px',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.25)',color:'#a5b4fc',borderRadius:8,fontWeight:700,fontSize:12,cursor:'pointer'}}>
            <RefreshCw style={{width:11,height:11}}/> Regenerate
          </button>
        </div>
      </div>

      {/* Prompt bar */}
      <div style={{background:'rgba(6,6,15,0.85)',borderBottom:'1px solid rgba(255,255,255,0.04)',padding:'7px 14px',display:'flex',gap:9,flexShrink:0}}>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={1}
          onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))handleGenerate();}}
          placeholder="Describe your website…"
          style={{flex:1,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,padding:'7px 12px',color:'white',fontSize:13,fontFamily:'inherit',resize:'none',outline:'none',lineHeight:1.5}}/>
        <button onClick={handleGenerate}
          style={{padding:'7px 18px',background:'white',color:'#0f172a',borderRadius:8,fontWeight:700,fontSize:13,cursor:'pointer',border:'none',flexShrink:0,display:'flex',alignItems:'center',gap:5}}>
          <Play style={{width:11,height:11}}/> Generate
        </button>
      </div>

      {/* Content */}
      <div style={{flex:1,overflow:'hidden',position:'relative',display:'flex',flexDirection:'column'}}>

        {/* Loading */}
        {status===GenerationStatus.GENERATING && (
          <div style={{position:'absolute',inset:0,zIndex:40,background:'rgba(6,6,15,0.96)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:26}}>
            <div style={{position:'relative'}}>
              <div style={{position:'absolute',inset:-14,borderRadius:'50%',border:`2px solid ${curStep.color}22`,animation:'ping 1.5s infinite'}}/>
              <div style={{width:68,height:68,borderRadius:'50%',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.09)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {React.createElement(curStep.icon,{style:{width:26,height:26,color:curStep.color}})}
              </div>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:17,fontWeight:600,color:'white',margin:'0 0 5px'}}>{curStep.text}</p>
              <p style={{fontSize:12,color:'#334155',margin:0}}>{activeModelName||'Connecting to AI…'}</p>
            </div>
            <div style={{width:260}}>
              <div style={{height:3,background:'rgba(255,255,255,0.05)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:2,background:`linear-gradient(90deg,#6366f1,${curStep.color})`,width:`${progress}%`,transition:'width 1s ease'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:5,fontSize:11,color:'#1e293b'}}>
                <span>{elapsed}s</span><span>~{modelInfo.estimatedTime}s</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {status===GenerationStatus.ERROR && (
          <div style={{position:'absolute',inset:0,zIndex:40,background:'rgba(6,6,15,0.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
            <div style={{background:'#0f172a',border:'1px solid rgba(239,68,68,0.25)',borderRadius:16,padding:30,maxWidth:420,width:'100%',textAlign:'center',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#ef4444,#f97316)'}}/>
              <AlertTriangle style={{width:36,height:36,color:'#ef4444',margin:'0 auto 14px'}}/>
              <h3 style={{color:'white',fontWeight:700,fontSize:15,margin:'0 0 8px'}}>Generation Failed</h3>
              <p style={{color:'#475569',fontSize:13,lineHeight:1.6,margin:'0 0 20px'}}>{errorMsg||'All AI providers were unavailable. Please try again.'}</p>
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button onClick={()=>{setStatus(GenerationStatus.IDLE);setErrorMsg('');}}
                  style={{padding:'8px 18px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#94a3b8',fontSize:13,cursor:'pointer'}}>
                  Dismiss
                </button>
                <button onClick={()=>{setStatus(GenerationStatus.IDLE);setErrorMsg('');setTimeout(handleGenerate,100);}}
                  style={{padding:'8px 18px',background:'#6366f1',border:'none',borderRadius:8,color:'white',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                  <RefreshCw style={{width:12,height:12}}/> Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!content && status===GenerationStatus.IDLE && (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,color:'#1e293b'}}>
            <Globe style={{width:32,height:32,color:'#1e293b'}}/>
            <p style={{fontSize:13,margin:0}}>Enter a prompt above and click Generate</p>
          </div>
        )}

        {/* Preview */}
        {(content||status===GenerationStatus.GENERATING) && viewMode==='PREVIEW' && (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',padding:device==='desktop'?0:14,background:'#090912'}}>
            <div style={{
              width:device==='mobile'?375:device==='tablet'?768:'100%',
              height:device==='mobile'?812:device==='tablet'?1024:'100%',
              borderRadius:device==='desktop'?0:device==='mobile'?36:20,
              border:device==='desktop'?'none':'7px solid #1e293b',
              overflow:'hidden',background:'white',
              boxShadow:device==='desktop'?'none':'0 32px 72px rgba(0,0,0,0.7)',
              transition:'all 0.35s ease',flexShrink:device==='desktop'?1:0,
            }}>
              <PreviewFrame content={previewContent} refreshKey={iframeKey} isEditable={isEditable}
                onContentUpdate={newHtml=>{if(content){const nc={...content,html:newHtml};updateContent(nc);setPreviewContent(nc);}}}/>
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
        onSelect={item=>{setPrompt(item.prompt);setContent(item.content);setPreviewContent(item.content);setIframeKey(k=>k+1);setViewMode('PREVIEW');setStatus(GenerationStatus.COMPLETED);}}
        onClear={()=>{setHistory([]);safeStore.del('visinaro_history');}}/>

      <style>{`@keyframes ping{75%,100%{transform:scale(1.6);opacity:0}} *{box-sizing:border-box}`}</style>
    </div>
  );
};

export default App;

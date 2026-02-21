import React, { useState, useEffect, useRef } from 'react';
import {
  Eye, Code, Download, ExternalLink, Monitor, Smartphone, Tablet,
  Pencil, Sparkles, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2,
  History, Wand2, Palette, Layers, Globe, Play, Zap
} from 'lucide-react';
import JSZip from 'jszip';
import PreviewFrame from './components/PreviewFrame';
import CodeEditor from './components/CodeEditor';
import HistorySidebar from './components/HistorySidebar';
import SEOAgent from './components/SEOAgent';
import { generateWebsite, hasAnyKey, clearApiKey, saveGroqKey, saveOpenRouterKey } from './services/aiService';
import { GenerationStatus, ViewMode, WebsiteHistoryItem, GeneratedContent } from './types';
import { useUndoRedoState } from './hooks/useAppHistory';

// Loading animation steps
const STEPS = [
  { text: 'Understanding your vision…',   icon: Wand2,    color: '#a78bfa' },
  { text: 'Drafting the layout…',         icon: Layers,   color: '#34d399' },
  { text: 'Choosing the perfect colors…', icon: Palette,  color: '#f472b6' },
  { text: 'Writing the HTML & CSS…',      icon: Code,     color: '#60a5fa' },
  { text: 'Adding images & content…',     icon: Globe,    color: '#fb923c' },
  { text: 'Putting on the finishing touches…', icon: Sparkles, color: '#facc15' },
];

// Example prompts for quick start
const EXAMPLES = [
  { label: 'Coffee Shop',    text: 'Modern coffee shop called "Brew & Bean" with warm amber tones, hero section with coffee images, menu grid with prices, team section, and contact form.' },
  { label: 'Portfolio',      text: 'Minimalist dark portfolio for a UI/UX designer with case studies, skills, and contact.' },
  { label: 'SaaS Landing',   text: 'SaaS landing page with pricing table, feature highlights, testimonials, and strong CTA.' },
  { label: 'Online Store',   text: 'Fashion e-commerce store with product grid, cart, checkout with Razorpay and Stripe payments.' },
  { label: 'Gym & Fitness',  text: 'High-energy gym website with class schedule, trainers, membership plans, and BMI calculator.' },
  { label: 'Restaurant',     text: 'Elegant restaurant website with food photography, interactive menu, reservation form, and location map.' },
  { label: 'Agency',         text: 'Premium creative agency with services, case studies, team profiles, awards, and contact form.' },
  { label: 'Personal Blog',  text: 'Clean personal blog with featured posts, categories, newsletter signup, and about page.' },
];

// Safe storage — works even when browser blocks localStorage
const store = {
  get:(k:string)=>{ try{return localStorage.getItem(k)||'';}catch{try{return sessionStorage.getItem(k)||'';}catch{return '';}} },
  set:(k:string,v:string)=>{ try{localStorage.setItem(k,v);}catch{} try{sessionStorage.setItem(k,v);}catch{} },
  del:(k:string)=>{ try{localStorage.removeItem(k);}catch{} try{sessionStorage.removeItem(k);}catch{} },
};

const Logo=({size=28}:{size?:number})=>(
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M6 5V27"  stroke="#f97316" strokeWidth="5" strokeLinecap="round"/>
    <path d="M26 5V27" stroke="#10b981" strokeWidth="5" strokeLinecap="round"/>
    <path d="M6 27L26 5" stroke="#ef4444" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

export default function App(){
  const [screen, setScreen]     = useState<'landing'|'workspace'>('landing');
  const [status, setStatus]     = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed]   = useState(0);
  const [step, setStep]         = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('PREVIEW');
  const [device, setDevice]     = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [iframeKey, setIframeKey]   = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory]   = useState<WebsiteHistoryItem[]>([]);
  const [isEditable, setIsEditable] = useState(false);
  // Key setup state
  const [needsKey, setNeedsKey] = useState(false);
  const [groqInput, setGroqInput] = useState('');
  const [orInput, setOrInput]     = useState('');

  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const stepRef =useRef<ReturnType<typeof setInterval>|null>(null);
  const startRef=useRef(0);

  const {prompt,setPrompt,content,setContent,updateContent}=useUndoRedoState('');
  const [preview,setPreview]=useState<GeneratedContent|null>(null);

  useEffect(()=>{
    try{const s=store.get('visinaro_history');if(s)setHistory(JSON.parse(s));}catch{}
  },[]);

  useEffect(()=>{
    if(status===GenerationStatus.GENERATING){
      setStep(0);
      stepRef.current=setInterval(()=>setStep(p=>(p+1)%STEPS.length),2000);
    }else{ if(stepRef.current)clearInterval(stepRef.current); }
    return()=>{if(stepRef.current)clearInterval(stepRef.current);};
  },[status]);

  const stopTimer=()=>{if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null;}};

  const doGenerate=async()=>{
    if(!prompt.trim())return;
    if(!hasAnyKey()){setNeedsKey(true);return;}
    setNeedsKey(false);
    setStatus(GenerationStatus.GENERATING);
    setErrorMsg('');
    setScreen('workspace');
    setViewMode('PREVIEW');
    setElapsed(0);
    startRef.current=Date.now();
    stopTimer();
    timerRef.current=setInterval(()=>setElapsed(Math.floor((Date.now()-startRef.current)/1000)),1000);
    try{
      const result=await generateWebsite(prompt,'auto',(partial)=>{
        try{const p=JSON.parse(partial);if(p?.html){setContent(p);setPreview(p);}}catch{}
      });
      stopTimer();
      setContent(result.content);
      setPreview(result.content);
      setIframeKey(k=>k+1);
      setStatus(GenerationStatus.COMPLETED);
      const item:WebsiteHistoryItem={id:crypto.randomUUID(),prompt,content:result.content,timestamp:Date.now(),model:result.usedModel};
      const updated=[item,...history].slice(0,30);
      setHistory(updated);
      try{store.set('visinaro_history',JSON.stringify(updated));}catch{}
    }catch(err:any){
      stopTimer();
      const msg=err?.message||'';
      if(msg==='API_KEY_MISSING'){setNeedsKey(true);setStatus(GenerationStatus.IDLE);return;}
      setStatus(GenerationStatus.ERROR);
      // Clean error — strip HTTP codes and raw JSON
      const clean=msg.replace(/HTTP_\d+\|?.*/,'').replace(/\{[\s\S]*?\}/g,'').trim();
      setErrorMsg(clean.length>10?clean.slice(0,200):'Generation failed. Please try again.');
    }
  };

  const handleSaveKeys=()=>{
    if(groqInput.trim())saveGroqKey(groqInput.trim());
    if(orInput.trim())saveOpenRouterKey(orInput.trim());
    setNeedsKey(false);
    setTimeout(doGenerate,100);
  };

  const handleCodeChange=(t:'html'|'css'|'javascript',v:string)=>{
    if(!content)return;const nc={...content,[t]:v};updateContent(nc);setPreview(nc);
  };

  const getStandaloneHtml=()=>{
    if(!content)return'';
    return`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"><\/script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"><style>${content.css||''}</style></head><body>${content.html||''}<script>${content.javascript||''}<\/script></body></html>`;
  };

  const handleDownload=async()=>{
    if(!content)return;
    const zip=new JSZip();
    zip.file('index.html',getStandaloneHtml());
    const blob=await zip.generateAsync({type:'blob'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='website.zip';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
  };

  const handleNewTab=()=>{
    const html=getStandaloneHtml();if(!html)return;
    const blob=new Blob([html],{type:'text/html'});
    const url=URL.createObjectURL(blob);
    window.open(url,'_blank');
    setTimeout(()=>URL.revokeObjectURL(url),15000);
  };

  const curStep=STEPS[step%STEPS.length];
  const progress=Math.min((elapsed/12)*100,94);

  // ── KEY SETUP MODAL ────────────────────────────────────────────────────────
  if(needsKey) return(
    <div style={{minHeight:'100dvh',background:'#06060f',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{background:'#0d1117',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:36,maxWidth:440,width:'100%',boxShadow:'0 40px 80px rgba(0,0,0,0.6)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <Logo size={36}/>
          <h2 style={{color:'white',fontSize:20,fontWeight:700,margin:'14px 0 8px'}}>One-time Setup</h2>
          <p style={{color:'#475569',fontSize:13,lineHeight:1.7,margin:0}}>Add a free API key to start generating websites. Your key is saved in your browser only — never sent to our servers.</p>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:'block',color:'#6366f1',fontSize:12,fontWeight:700,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>
            Primary Key <span style={{color:'#34d399'}}>★ Recommended</span>
          </label>
          <input value={groqInput} onChange={e=>setGroqInput(e.target.value)}
            placeholder="Paste your key here…"
            style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'11px 14px',color:'white',fontSize:13,fontFamily:'monospace',outline:'none',boxSizing:'border-box'}}/>
          <p style={{color:'#1e3a5f',fontSize:11,marginTop:5}}>
            Get free key → <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{color:'#6366f1',textDecoration:'none',fontWeight:600}}>console.groq.com/keys</a> (no credit card)
          </p>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:'block',color:'#475569',fontSize:12,fontWeight:700,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>
            Backup Key <span style={{color:'#334155'}}>Optional</span>
          </label>
          <input value={orInput} onChange={e=>setOrInput(e.target.value)}
            placeholder="Paste backup key here…"
            style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'11px 14px',color:'white',fontSize:13,fontFamily:'monospace',outline:'none',boxSizing:'border-box'}}/>
          <p style={{color:'#1e3a5f',fontSize:11,marginTop:5}}>
            Get free key → <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{color:'#6366f1',textDecoration:'none',fontWeight:600}}>openrouter.ai/keys</a>
          </p>
        </div>
        <button onClick={handleSaveKeys} disabled={!groqInput.trim()&&!orInput.trim()}
          style={{width:'100%',padding:'13px',background:groqInput.trim()||orInput.trim()?'white':'rgba(255,255,255,0.06)',
            color:groqInput.trim()||orInput.trim()?'#0f172a':'#374151',
            borderRadius:12,fontWeight:700,fontSize:15,cursor:groqInput.trim()||orInput.trim()?'pointer':'default',border:'none',boxSizing:'border-box',transition:'all 0.2s'}}>
          Save & Build My Website
        </button>
        <button onClick={()=>{setNeedsKey(false);setScreen('landing');}}
          style={{width:'100%',padding:'10px',background:'transparent',color:'#334155',border:'none',cursor:'pointer',fontSize:13,marginTop:8,fontFamily:'inherit'}}>
          Cancel
        </button>
      </div>
      <style>{`*{box-sizing:border-box}`}</style>
    </div>
  );

  // ── LANDING PAGE ──────────────────────────────────────────────────────────
  if(screen==='landing') return(
    <div style={{minHeight:'100dvh',background:'#06060f',color:'white',fontFamily:'Inter,system-ui,sans-serif',overflowX:'hidden',overflowY:'auto',position:'relative'}}>

      {/* Ambient background */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-20%',left:'-15%',width:700,height:700,background:'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 65%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',top:'35%',right:'-20%',width:600,height:600,background:'radial-gradient(circle,rgba(139,92,246,0.09) 0%,transparent 65%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',bottom:'-5%',left:'20%',width:500,height:500,background:'radial-gradient(circle,rgba(236,72,153,0.07) 0%,transparent 65%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
      </div>

      {/* Nav */}
      <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(24px)',background:'rgba(6,6,15,0.8)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:1080,margin:'0 auto',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Logo size={22}/>
            <span style={{fontWeight:800,fontSize:17,letterSpacing:'-0.5px',color:'white'}}>Visinaro</span>
          </div>
          {history.length>0&&(
            <button onClick={()=>setIsHistoryOpen(true)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#64748b',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              <History style={{width:12,height:12}}/> Recent sites
            </button>
          )}
        </div>
      </nav>

      {/* Hero section */}
      <section style={{maxWidth:760,margin:'0 auto',padding:'96px 24px 72px',textAlign:'center',position:'relative',zIndex:10}}>

        {/* Live badge */}
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 16px',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:999,marginBottom:40}}>
          <span style={{width:6,height:6,background:'#4ade80',borderRadius:'50%',display:'block',boxShadow:'0 0 8px #4ade80'}}/>
          <span style={{fontSize:11,fontWeight:700,color:'#a5b4fc',letterSpacing:'0.1em',textTransform:'uppercase'}}>AI Website Builder · Live</span>
        </div>

        {/* Headline */}
        <h1 style={{fontSize:'clamp(40px,7vw,72px)',fontWeight:800,lineHeight:1.05,letterSpacing:'-2.5px',margin:'0 0 22px',fontFamily:'Inter,system-ui,sans-serif',color:'white'}}>
          Build any website<br/>
          <span style={{background:'linear-gradient(130deg,#818cf8 0%,#c084fc 50%,#f472b6 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
            in seconds, not days
          </span>
        </h1>

        <p style={{fontSize:17,color:'#475569',maxWidth:520,margin:'0 auto 56px',lineHeight:1.75}}>
          Describe your website in plain English. Get a complete, production-ready site with pages, images, login, and e-commerce — instantly.
        </p>

        {/* Prompt box */}
        <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:20,padding:20,marginBottom:14,boxShadow:'0 0 60px rgba(99,102,241,0.06)',textAlign:'left'}}>
          <textarea
            value={prompt}
            onChange={e=>setPrompt(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))doGenerate();}}
            placeholder={'Describe your website…\ne.g. "Modern coffee shop with warm colors, menu, team, and contact form"'}
            rows={4}
            style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'white',fontSize:15,lineHeight:1.75,resize:'none',fontFamily:'Inter,system-ui,sans-serif',boxSizing:'border-box',display:'block'}}
          />
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <button onClick={doGenerate} disabled={!prompt.trim()}
              style={{display:'flex',alignItems:'center',gap:8,padding:'11px 28px',
                background:prompt.trim()?'white':'rgba(255,255,255,0.05)',
                color:prompt.trim()?'#0f172a':'#374151',
                borderRadius:12,fontWeight:700,fontSize:15,cursor:prompt.trim()?'pointer':'default',border:'none',
                boxShadow:prompt.trim()?'0 4px 20px rgba(255,255,255,0.15)':'none',
                transition:'all 0.2s',fontFamily:'inherit'}}>
              <Zap style={{width:14,height:14}}/> Generate Website
            </button>
          </div>
        </div>

        {/* Quick examples */}
        <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:64}}>
          {EXAMPLES.map(e=>(
            <button key={e.label} onClick={()=>setPrompt(e.text)}
              style={{padding:'6px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',
                borderRadius:999,color:'#4b5563',fontSize:12,cursor:'pointer',fontFamily:'inherit',
                transition:'all 0.15s'}}>
              {e.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{display:'flex',justifyContent:'center',gap:56,borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:32}}>
          {[['5+','Pages per site'],['Free','No credit card'],['<10s','Generation speed']].map(([v,l])=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:24,fontWeight:800,color:'white',lineHeight:1}}>{v}</div>
              <div style={{fontSize:12,color:'#1e293b',marginTop:5}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{maxWidth:1040,margin:'0 auto',padding:'0 24px 88px',position:'relative',zIndex:10}}>
        <div style={{textAlign:'center',marginBottom:44}}>
          <p style={{fontSize:11,fontWeight:700,color:'#6366f1',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:10,margin:'0 0 10px'}}>What you get</p>
          <h2 style={{fontSize:28,fontWeight:700,color:'white',letterSpacing:'-0.5px',margin:0}}>Everything built-in. Nothing extra needed.</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
          {[
            ['⚡','Instant Results',       'Full website built in under 10 seconds with smart AI'],
            ['🖼️','Real Images',           'Every image auto-filled with topic-specific photos'],
            ['🛒','E-commerce',            'Product grid, cart, checkout — Razorpay & Stripe ready'],
            ['🔐','Login & Sign Up',       'Google, Facebook, Instagram social auth built in'],
            ['📱','Fully Responsive',      'Perfect on mobile, tablet, and desktop automatically'],
            ['📥','Export Instantly',      'Download as ZIP or preview in a new browser tab'],
          ].map(([icon,title,desc])=>(
            <div key={title} style={{padding:22,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,display:'flex',gap:14,alignItems:'flex-start'}}>
              <span style={{fontSize:20,lineHeight:1,paddingTop:2,flexShrink:0}}>{icon}</span>
              <div>
                <div style={{fontWeight:600,color:'white',fontSize:14,marginBottom:4}}>{title}</div>
                <div style={{color:'#374151',fontSize:13,lineHeight:1.55}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.04)',padding:'20px 24px',textAlign:'center',position:'relative',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:4}}>
          <Logo size={14}/><span style={{color:'#1e293b',fontSize:12,fontWeight:600}}>Visinaro</span>
        </div>
        <p style={{color:'#111827',fontSize:11,margin:0}}>AI website builder · Free to use</p>
      </footer>

      <HistorySidebar isOpen={isHistoryOpen} onClose={()=>setIsHistoryOpen(false)} history={history}
        onSelect={item=>{setPrompt(item.prompt);setContent(item.content);setPreview(item.content);setScreen('workspace');setIframeKey(k=>k+1);}}
        onClear={()=>{setHistory([]);store.del('visinaro_history');}}/>

      <style>{`*{box-sizing:border-box} textarea::placeholder{color:#1e293b} button:hover{opacity:0.82}`}</style>
    </div>
  );

  // ── WORKSPACE ─────────────────────────────────────────────────────────────
  return(
    <div style={{height:'100dvh',display:'flex',flexDirection:'column',background:'#06060f',color:'white',fontFamily:'Inter,system-ui,sans-serif',overflow:'hidden'}}>

      {/* Top bar — no model names, no provider info */}
      <div style={{height:50,background:'rgba(6,6,15,0.97)',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px',flexShrink:0,zIndex:50}}>

        {/* Left */}
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>setScreen('landing')}
            style={{display:'flex',alignItems:'center',gap:5,padding:'5px 11px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:7,color:'#64748b',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
            <ArrowLeft style={{width:12,height:12}}/> Home
          </button>
          <Logo size={18}/>
          <span style={{fontWeight:700,fontSize:14,color:'#e2e8f0'}}>Visinaro</span>
          {status===GenerationStatus.COMPLETED&&(
            <span style={{fontSize:11,padding:'2px 9px',background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.2)',borderRadius:99,color:'#34d399',display:'flex',alignItems:'center',gap:3}}>
              <CheckCircle2 style={{width:9,height:9}}/> Ready
            </span>
          )}
        </div>

        {/* Center — view mode only */}
        <div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:7,padding:3,gap:2}}>
          {(['PREVIEW','CODE'] as const).map(v=>(
            <button key={v} onClick={()=>setViewMode(v)}
              style={{padding:'4px 13px',borderRadius:5,fontSize:12,fontWeight:600,cursor:'pointer',border:'none',fontFamily:'inherit',
                background:viewMode===v?'rgba(255,255,255,0.1)':'transparent',
                color:viewMode===v?'white':'#4b5563',transition:'all 0.15s'}}>
              {v==='PREVIEW'?'Preview':'Code'}
            </button>
          ))}
        </div>

        {/* Right — actions */}
        <div style={{display:'flex',alignItems:'center',gap:5}}>
          {viewMode==='PREVIEW'&&(
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
          <SEOAgent content={content} prompt={prompt} onContentUpdate={c=>{updateContent(c);setPreview(c);setIframeKey(k=>k+1);}}/>
          <button onClick={()=>setIsEditable(!isEditable)} title="Edit mode"
            style={{padding:'4px 7px',borderRadius:5,cursor:'pointer',border:'none',
              background:isEditable?'rgba(99,102,241,0.15)':'transparent',
              color:isEditable?'#818cf8':'#4b5563'}}>
            <Pencil style={{width:13,height:13}}/>
          </button>
          <button onClick={handleNewTab} title="Open in new tab"
            style={{padding:'4px 7px',borderRadius:5,cursor:'pointer',border:'none',background:'transparent',color:'#4b5563'}}>
            <ExternalLink style={{width:13,height:13}}/>
          </button>
          <button onClick={handleDownload} disabled={!content}
            style={{display:'flex',alignItems:'center',gap:5,padding:'5px 13px',background:content?'white':'rgba(255,255,255,0.05)',
              color:content?'#0f172a':'#374151',borderRadius:8,fontWeight:700,fontSize:12,cursor:content?'pointer':'default',border:'none',fontFamily:'inherit'}}>
            <Download style={{width:11,height:11}}/> Export
          </button>
          <button onClick={()=>{setStatus(GenerationStatus.IDLE);setErrorMsg('');setTimeout(doGenerate,100);}}
            style={{display:'flex',alignItems:'center',gap:5,padding:'5px 13px',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.25)',color:'#a5b4fc',borderRadius:8,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
            <RefreshCw style={{width:11,height:11}}/> Regenerate
          </button>
        </div>
      </div>

      {/* Prompt bar */}
      <div style={{background:'rgba(6,6,15,0.9)',borderBottom:'1px solid rgba(255,255,255,0.04)',padding:'7px 14px',display:'flex',gap:9,flexShrink:0}}>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={1}
          onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))doGenerate();}}
          placeholder="Describe your website…"
          style={{flex:1,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,padding:'7px 12px',color:'white',fontSize:13,fontFamily:'inherit',resize:'none',outline:'none',lineHeight:1.5}}/>
        <button onClick={doGenerate}
          style={{padding:'7px 18px',background:'white',color:'#0f172a',borderRadius:8,fontWeight:700,fontSize:13,cursor:'pointer',border:'none',flexShrink:0,display:'flex',alignItems:'center',gap:5,fontFamily:'inherit'}}>
          <Play style={{width:11,height:11}}/> Generate
        </button>
      </div>

      {/* Content area */}
      <div style={{flex:1,overflow:'hidden',position:'relative',display:'flex',flexDirection:'column'}}>

        {/* Generating overlay */}
        {status===GenerationStatus.GENERATING&&(
          <div style={{position:'absolute',inset:0,zIndex:40,background:'rgba(6,6,15,0.96)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:28}}>
            <div style={{position:'relative'}}>
              <div style={{position:'absolute',inset:-14,borderRadius:'50%',border:`2px solid ${curStep.color}30`}}/>
              <div style={{width:68,height:68,borderRadius:'50%',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {React.createElement(curStep.icon,{style:{width:26,height:26,color:curStep.color}})}
              </div>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:17,fontWeight:600,color:'white',margin:'0 0 6px'}}>{curStep.text}</p>
              <p style={{fontSize:12,color:'#1e293b',margin:0}}>{elapsed}s elapsed</p>
            </div>
            <div style={{width:260}}>
              <div style={{height:2,background:'rgba(255,255,255,0.05)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:2,background:`linear-gradient(90deg,#6366f1,${curStep.color})`,width:`${progress}%`,transition:'width 1s ease'}}/>
              </div>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {status===GenerationStatus.ERROR&&(
          <div style={{position:'absolute',inset:0,zIndex:40,background:'rgba(6,6,15,0.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
            <div style={{background:'#0d1117',border:'1px solid rgba(239,68,68,0.25)',borderRadius:16,padding:30,maxWidth:420,width:'100%',textAlign:'center',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#ef4444,#f97316)'}}/>
              <AlertTriangle style={{width:36,height:36,color:'#ef4444',margin:'0 auto 14px'}}/>
              <h3 style={{color:'white',fontWeight:700,fontSize:15,margin:'0 0 8px'}}>Generation Failed</h3>
              <p style={{color:'#475569',fontSize:13,lineHeight:1.6,margin:'0 0 20px'}}>{errorMsg||'All AI providers were unavailable. Please try again in a moment.'}</p>
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button onClick={()=>{setStatus(GenerationStatus.IDLE);setErrorMsg('');}}
                  style={{padding:'8px 18px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#94a3b8',fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
                  Dismiss
                </button>
                <button onClick={()=>{setStatus(GenerationStatus.IDLE);setErrorMsg('');setTimeout(doGenerate,100);}}
                  style={{padding:'8px 18px',background:'#6366f1',border:'none',borderRadius:8,color:'white',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:'inherit'}}>
                  <RefreshCw style={{width:12,height:12}}/> Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!content&&status===GenerationStatus.IDLE&&(
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,color:'#1e293b'}}>
            <Globe style={{width:32,height:32}}/>
            <p style={{fontSize:13,margin:0}}>Enter a prompt above and click Generate</p>
          </div>
        )}

        {/* Preview */}
        {(content||status===GenerationStatus.GENERATING)&&viewMode==='PREVIEW'&&(
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
              <PreviewFrame content={preview} refreshKey={iframeKey} isEditable={isEditable}
                onContentUpdate={html=>{if(content){const nc={...content,html};updateContent(nc);setPreview(nc);}}}/>
            </div>
          </div>
        )}

        {content&&viewMode==='CODE'&&(
          <div style={{flex:1,overflow:'hidden'}}>
            <CodeEditor content={content} onChange={handleCodeChange}/>
          </div>
        )}
      </div>

      <HistorySidebar isOpen={isHistoryOpen} onClose={()=>setIsHistoryOpen(false)} history={history}
        onSelect={item=>{setPrompt(item.prompt);setContent(item.content);setPreview(item.content);setIframeKey(k=>k+1);setViewMode('PREVIEW');setStatus(GenerationStatus.COMPLETED);}}
        onClear={()=>{setHistory([]);store.del('visinaro_history');}}/>

      <style>{`*{box-sizing:border-box}`}</style>
    </div>
  );
}

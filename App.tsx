import React, { useState, useEffect, useRef } from 'react';
import {
  Eye, Code, Download, ExternalLink, Monitor, Smartphone, Tablet,
  Pencil, Sparkles, ArrowLeft, RefreshCw, AlertTriangle,
  History, Wand2, Palette, Layers, Globe, Play, Zap
} from 'lucide-react';
import JSZip from 'jszip';
import PreviewFrame from './components/PreviewFrame';
import CodeEditor from './components/CodeEditor';
import HistorySidebar from './components/HistorySidebar';
import SEOAgent from './components/SEOAgent';
import { generateWebsite, hasAnyKey, clearApiKey, saveGroqKey, saveOpenRouterKey } from './services/aiService';
import { AUTH_SCRIPTS } from './templates';
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
    const spa=`<script>
(function(){
  var IDS=["home","about","services","portfolio","contact","auth","shop","cart","checkout","gallery","blog","pricing","team","menu","faq","solutions","features"];
  function getSections(){
    var t=Array.from(document.querySelectorAll(".page-section[id]"));
    if(t.length>=2)return t;
    var b=IDS.map(function(id){return document.getElementById(id);}).filter(Boolean);
    if(b.length>=2)return b;
    return Array.from(document.querySelectorAll("body > section[id]"));
  }
  function showSection(tid){
    var sections=getSections();
    if(!sections.length){setTimeout(function(){showSection(tid);},100);return;}
    var found=false;
    sections.forEach(function(s){
      if(s.id===tid){
        s.classList.remove("hidden");
        s.style.removeProperty("display");
        s.style.setProperty("display","block","important");
        s.style.setProperty("visibility","visible","important");
        found=true;
      } else {
        s.classList.add("hidden");
        s.style.setProperty("display","none","important");
      }
    });
    if(!found&&sections.length){showSection(sections[0].id);return;}
    window.scrollTo(0,0);
    document.querySelectorAll("nav a[href]").forEach(function(a){
      var h=(a.getAttribute("href")||"").replace(/^#/,"").replace(/\\.html$/,"").trim();
      if(h===tid||(tid==="home"&&(!h||h==="index"))){a.style.color="#6366f1";a.style.fontWeight="700";}
      else{a.style.color="";a.style.fontWeight="";}
    });
    var mm=document.getElementById("mobile-menu");if(mm)mm.style.display="none";
  }
  window.navigateTo=showSection;
  document.addEventListener("click",function(e){
    var link=e.target.closest("a[href]");if(!link)return;
    var href=(link.getAttribute("href")||"").trim();
    if(!href||href==="#"){e.preventDefault();return;}
    if(href.startsWith("http")||href.startsWith("//")||href.startsWith("mailto:")||href.startsWith("tel:")){e.preventDefault();window.open(href,"_blank");return;}
    e.preventDefault();e.stopPropagation();
    var tid=href.replace(/^#/,"").replace(/\\.html$/,"").replace(/^\\//,"").trim();
    if(!tid||tid==="index")tid="home";
    showSection(tid);
    try{history.pushState(null,"","#"+tid);}catch(err){}
  },true);
  window.addEventListener("hashchange",function(){
    var hash=location.hash.replace(/^#/,"").trim();
    if(hash)showSection(hash);
  });
  function init(){
    var s=getSections();
    if(!s.length){setTimeout(init,200);return;}
    var initHash=location.hash.replace(/^#/,"").trim();
    var initId=(initHash&&document.getElementById(initHash))?initHash:(s[0]?s[0].id:"home");
    s.forEach(function(x){
      if(x.id===initId){
        x.classList.remove("hidden");
        x.style.removeProperty("display");
        x.style.setProperty("display","block","important");
      } else {
        x.classList.add("hidden");
        x.style.setProperty("display","none","important");
      }
    });
  }
  window.addEventListener("load",function(){setTimeout(init,100);});
  if(document.readyState!=="loading")setTimeout(init,100);
  window.addEventListener("error",function(e){
    if(e.target&&e.target.tagName==="IMG"){
      var img=e.target;if(img.dataset.vf)return;img.dataset.vf="1";
      var seed=(img.alt||"photo").replace(/[^a-zA-Z0-9]/g,"").toLowerCase().slice(0,20)||"photo";
      img.src="https://picsum.photos/seed/"+seed+"/800/500";img.style.objectFit="cover";
    }
  },true);
})();
<\/script>`;

    const parts=[
      '<!DOCTYPE html><html lang="en"><head>',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<title>' + (content.html?.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || (content.html?.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.slice(0,60)) || 'Website') + '</title>',
      '<script src="https://cdn.tailwindcss.com"><\/script>',
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">',
      '<style>',
      '*{box-sizing:border-box;}',
      'html,body{margin:0;padding:0;width:100%;overflow-x:hidden;}',
      '/* SPA sections - hidden by default until router initializes */',
      '.page-section{width:100%!important;max-width:100%!important;}',
      '.page-section.hidden, .page-section[style*="display:none"]{display:none!important;}',
      '.hidden{display:none!important;}',
      '.active-nav{color:#6366f1!important;font-weight:700!important;}',
      '::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.2);border-radius:4px;}',
      (content.css||''),
      '</style></head><body>',
      (content.html||''),
      AUTH_SCRIPTS,
      spa,
      '<script>',
      (content.javascript||''),
      '<\/script></body></html>'
    ];
    return parts.join('');
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

  // ── LANDING PAGE — fits exactly in viewport, prompt always centred ──────────
  if(screen==='landing') return(
    <div style={{height:'100dvh',background:'#06060f',color:'white',fontFamily:'Inter,system-ui,sans-serif',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>

      {/* Ambient background */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-20%',left:'-15%',width:600,height:600,background:'radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 65%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',top:'30%',right:'-15%',width:500,height:500,background:'radial-gradient(circle,rgba(139,92,246,0.10) 0%,transparent 65%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',bottom:'-10%',left:'20%',width:450,height:450,background:'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 65%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
      </div>

      {/* Nav — fixed height */}
      <nav style={{flexShrink:0,zIndex:50,backdropFilter:'blur(24px)',background:'rgba(6,6,15,0.85)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{maxWidth:1080,margin:'0 auto',padding:'0 24px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <Logo size={20}/>
            <span style={{fontWeight:800,fontSize:16,letterSpacing:'-0.5px'}}>Visinaro</span>
          </div>
          {history.length>0&&(
            <button onClick={()=>setIsHistoryOpen(true)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#64748b',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              <History style={{width:12,height:12}}/> Recent sites
            </button>
          )}
        </div>
      </nav>

      {/* Centre column — takes remaining height, flex centres content */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 24px',zIndex:10,overflow:'hidden'}}>
        <div style={{width:'100%',maxWidth:640}}>

          {/* Badge */}
          <div style={{display:'flex',justifyContent:'center',marginBottom:20}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'4px 14px',background:'rgba(99,102,241,0.09)',border:'1px solid rgba(99,102,241,0.22)',borderRadius:999}}>
              <span style={{width:6,height:6,background:'#4ade80',borderRadius:'50%',display:'block',boxShadow:'0 0 7px #4ade80'}}/>
              <span style={{fontSize:10,fontWeight:700,color:'#a5b4fc',letterSpacing:'0.1em',textTransform:'uppercase'}}>AI Website Builder · Free · Live</span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{fontSize:'clamp(32px,5vw,58px)',fontWeight:800,lineHeight:1.08,letterSpacing:'-2px',margin:'0 0 14px',textAlign:'center',fontFamily:'Inter,system-ui,sans-serif'}}>
            Build any website<br/>
            <span style={{background:'linear-gradient(130deg,#818cf8 0%,#c084fc 50%,#f472b6 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              in seconds, not days
            </span>
          </h1>

          <p style={{fontSize:15,color:'#4b5563',margin:'0 0 24px',lineHeight:1.65,textAlign:'center'}}>
            Describe your website in plain English — get a complete, production-ready site instantly.
          </p>

          {/* Prompt box */}
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:18,padding:16,marginBottom:12,boxShadow:'0 0 60px rgba(99,102,241,0.07)'}}>
            <textarea
              value={prompt}
              onChange={e=>setPrompt(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))doGenerate();}}
              placeholder='e.g. "Modern coffee shop with warm colors, hero image, menu, team section, and contact form"'
              rows={3}
              style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'white',fontSize:14,lineHeight:1.7,resize:'none',fontFamily:'Inter,system-ui,sans-serif',boxSizing:'border-box',display:'block'}}
            />
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
              <span style={{fontSize:11,color:'#1e293b'}}>Ctrl+Enter to generate</span>
              <button onClick={doGenerate} disabled={!prompt.trim()}
                style={{display:'flex',alignItems:'center',gap:7,padding:'9px 22px',
                  background:prompt.trim()?'white':'rgba(255,255,255,0.05)',
                  color:prompt.trim()?'#0f172a':'#374151',
                  borderRadius:10,fontWeight:700,fontSize:14,cursor:prompt.trim()?'pointer':'default',border:'none',
                  boxShadow:prompt.trim()?'0 4px 18px rgba(255,255,255,0.13)':'none',
                  transition:'all 0.2s',fontFamily:'inherit'}}>
                <Zap style={{width:13,height:13}}/> Generate
              </button>
            </div>
          </div>

          {/* Suggestion chips */}
          <div style={{display:'flex',flexWrap:'wrap',gap:7,justifyContent:'center'}}>
            {EXAMPLES.map(e=>(
              <button key={e.label} onClick={()=>{setPrompt(e.text);}}
                style={{padding:'5px 13px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',
                  borderRadius:999,color:'#6b7280',fontSize:12,cursor:'pointer',fontFamily:'inherit',
                  transition:'all 0.15s',whiteSpace:'nowrap'}}>
                {e.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom stats bar */}
      <div style={{flexShrink:0,borderTop:'1px solid rgba(255,255,255,0.05)',padding:'12px 24px',display:'flex',justifyContent:'center',gap:40,zIndex:10}}>
        {[['5+','Pages'],['Free','Forever'],['<10s','Speed']].map(([v,l])=>(
          <div key={l} style={{textAlign:'center'}}>
            <div style={{fontSize:16,fontWeight:800,color:'white',lineHeight:1}}>{v}</div>
            <div style={{fontSize:11,color:'#1e293b',marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      <HistorySidebar isOpen={isHistoryOpen} onClose={()=>setIsHistoryOpen(false)} history={history}
        onSelect={item=>{setPrompt(item.prompt);setContent(item.content);setPreview(item.content);setScreen('workspace');setIframeKey(k=>k+1);}}
        onClear={()=>{setHistory([]);store.del('visinaro_history');}}/>

      <style>{`*{box-sizing:border-box} textarea::placeholder{color:#334155} button:hover{opacity:0.82}`}</style>
    </div>
  );



  // ── WORKSPACE ─────────────────────────────────────────────────────────────
  const isGenerated = status === GenerationStatus.COMPLETED && !!content;

  return(
    <div style={{height:'100dvh',display:'flex',flexDirection:'column',background:'#06060f',color:'white',fontFamily:'Inter,system-ui,sans-serif',overflow:'hidden'}}>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={{background:'#0a0a14',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 10px',flexShrink:0,zIndex:50,gap:4,flexWrap:'wrap',minHeight:48}}>

        {/* Left: logo (click → landing) + view toggle */}
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          <button onClick={()=>setScreen('landing')} title="Back to home"
            style={{display:'flex',alignItems:'center',gap:7,padding:'5px 10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#94a3b8',fontSize:12,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>
            <ArrowLeft style={{width:12,height:12,flexShrink:0}}/>
            <Logo size={16}/>
            <span style={{fontWeight:700,fontSize:13}}>Visinaro</span>
          </button>

          {/* Preview / Code toggle — always visible */}
          <div style={{display:'flex',background:'rgba(255,255,255,0.05)',borderRadius:7,padding:3,gap:2,flexShrink:0}}>
            <button onClick={()=>setViewMode('PREVIEW')}
              style={{padding:'4px 10px',borderRadius:5,fontSize:12,fontWeight:600,cursor:'pointer',border:'none',fontFamily:'inherit',
                background:viewMode==='PREVIEW'?'rgba(255,255,255,0.12)':'transparent',
                color:viewMode==='PREVIEW'?'white':'#4b5563',transition:'all 0.15s',flexShrink:0}}>
              Preview
            </button>
            <button onClick={()=>setViewMode('CODE')}
              style={{padding:'4px 10px',borderRadius:5,fontSize:12,fontWeight:600,cursor:'pointer',border:'none',fontFamily:'inherit',
                background:viewMode==='CODE'?'rgba(255,255,255,0.12)':'transparent',
                color:viewMode==='CODE'?'white':'#4b5563',transition:'all 0.15s',flexShrink:0}}>
              Code
            </button>
          </div>

          {/* Device switcher — only in Preview */}
          {viewMode==='PREVIEW'&&(
            <div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:7,padding:3,gap:1,flexShrink:0}}>
              {([['desktop',Monitor],['tablet',Tablet],['mobile',Smartphone]] as const).map(([d,Icon])=>(
                <button key={d} onClick={()=>setDevice(d as any)} title={d}
                  style={{padding:'4px 7px',borderRadius:5,cursor:'pointer',border:'none',
                    background:device===d?'rgba(99,102,241,0.2)':'transparent',
                    color:device===d?'#a5b4fc':'#4b5563',transition:'all 0.15s'}}>
                  <Icon style={{width:13,height:13}}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: actions — icons only on mobile to save space */}
        <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
          <SEOAgent content={content} prompt={prompt} onContentUpdate={c=>{updateContent(c);setPreview(c);setIframeKey(k=>k+1);}}/>
          <button onClick={()=>setIsEditable(!isEditable)} title="Edit mode"
            style={{padding:'5px 7px',borderRadius:6,cursor:'pointer',border:'none',
              background:isEditable?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
              color:isEditable?'#a5b4fc':'#4b5563',flexShrink:0,display:'flex',alignItems:'center'}}>
            <Pencil style={{width:13,height:13}}/>
          </button>
          <button onClick={handleNewTab} title={isGenerated?'Open in new tab — all pages work':'Generate first'}
            style={{padding:'5px 8px',borderRadius:6,cursor:isGenerated?'pointer':'default',border:'none',flexShrink:0,
              display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,fontFamily:'inherit',
              background:isGenerated?'rgba(34,197,94,0.15)':'rgba(255,255,255,0.04)',
              color:isGenerated?'#4ade80':'#374151',
              outline:isGenerated?'1px solid rgba(34,197,94,0.35)':'none',
              transition:'all 0.3s'}}>
            <ExternalLink style={{width:12,height:12}}/>
            {isGenerated&&<span style={{whiteSpace:'nowrap'}}>Open</span>}
          </button>
          <button onClick={handleDownload} disabled={!content} title="Export ZIP"
            style={{padding:'5px 7px',borderRadius:6,cursor:content?'pointer':'default',border:'none',flexShrink:0,
              background:'rgba(255,255,255,0.04)',color:content?'#94a3b8':'#374151',display:'flex',alignItems:'center'}}>
            <Download style={{width:12,height:12}}/>
          </button>
          <button onClick={()=>{setStatus(GenerationStatus.IDLE);setErrorMsg('');setTimeout(doGenerate,100);}}
            title="Regenerate"
            style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',background:'#4f46e5',color:'white',
              borderRadius:7,fontWeight:700,fontSize:11,cursor:'pointer',border:'none',fontFamily:'inherit',flexShrink:0,whiteSpace:'nowrap'}}>
            <RefreshCw style={{width:11,height:11}}/><span>Regen</span>
          </button>
        </div>
      </div>

      {/* Prompt bar — ONLY shown while generating or if no content yet (not after generation complete) */}
      {!isGenerated&&(
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
      )}

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
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',
            padding:device==='desktop'?0:'16px',background:'#090912',position:'relative'}}>
            {device==='desktop'?(
              /* Desktop — full bleed, fills all available space */
              <div style={{width:'100%',height:'100%',background:'white',overflow:'hidden'}}>
                <PreviewFrame content={preview} refreshKey={iframeKey} isEditable={isEditable}
                  onContentUpdate={html=>{if(content){const nc={...content,html};updateContent(nc);setPreview(nc);}}}/>
              </div>
            ):(
              /* Mobile / Tablet — device frame that scales to fit height */
              <div style={{
                position:'relative',
                /* Scale down the frame if it's taller than available area */
                transformOrigin:'center center',
              }}>
                <div style={{
                  width:device==='mobile'?375:768,
                  height:device==='mobile'?720:900,
                  maxHeight:'calc(100vh - 160px)',
                  borderRadius:device==='mobile'?32:20,
                  border:device==='mobile'?'8px solid #1e293b':'6px solid #1e293b',
                  overflow:'hidden',
                  background:'white',
                  boxShadow:'0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
                  transition:'all 0.3s ease',
                  position:'relative',
                }}>
                  {/* Device notch for mobile */}
                  {device==='mobile'&&(
                    <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:100,height:22,background:'#1e293b',borderRadius:'0 0 14px 14px',zIndex:10}}/>
                  )}
                  <PreviewFrame content={preview} refreshKey={iframeKey} isEditable={isEditable}
                    onContentUpdate={html=>{if(content){const nc={...content,html};updateContent(nc);setPreview(nc);}}}/>
                </div>
              </div>
            )}
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

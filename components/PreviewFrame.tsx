import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { GeneratedContent } from '../types';

interface PreviewFrameProps {
  content: GeneratedContent | null;
  refreshKey: number;
  isLoading?: boolean;
  isEditable?: boolean;
  onContentUpdate?: (newHtml: string) => void;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({
  content,
  refreshKey,
  isEditable = false,
  onContentUpdate,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Track last srcdoc we actually wrote — avoid reloading for same content
  const lastKeyRef = useRef<number>(-1);

  // Build the full HTML document once per content+refreshKey change
  const srcDoc = useMemo(() => {
    if (!content?.html) return '';
    const { html, css = '', javascript = '' } = content;

    // ── Image fallback ──────────────────────────────────────────────────────
    const imgScript = `<script data-vi="1">
(function(){
  function fix(img){
    if(img.dataset.viFix)return;img.dataset.viFix='1';
    var seed=(img.alt||img.dataset.seed||'photo').replace(/[^a-zA-Z0-9]/g,'').toLowerCase().slice(0,20)||'photo';
    img.src='https://picsum.photos/seed/'+seed+'/800/500';
    img.style.objectFit='cover';img.onerror=null;
  }
  window.addEventListener('error',function(e){if(e.target&&e.target.tagName==='IMG')fix(e.target);},true);
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('img').forEach(function(img){
      var s=img.getAttribute('src')||'';
      if(!s||s==='#'||s.includes('undefined')||s.includes('null')||s.length<5)fix(img);
    });
  });
})();
<\/script>`;

    // ── SPA Router ──────────────────────────────────────────────────────────
    // CRITICAL FIXES:
    // 1. Wait for Tailwind to finish before running initRouter (it adds/removes classes async)
    // 2. Use display:none / removeProperty('display') — NOT classList.add('hidden')
    //    because Tailwind's .hidden = display:none but our inline style overrides it
    // 3. No MutationObserver triggering parent updates during normal navigation
    const spaScript = `<script data-vi="1">
(function(){
  var IDS=["home","about","services","portfolio","contact","auth","shop","cart","checkout","gallery","blog","pricing","team","menu","faq","solutions","features"];

  function getSections(){
    var t=Array.from(document.querySelectorAll(".page-section[id]"));
    if(t.length>=2) return t;
    var b=IDS.map(function(id){return document.getElementById(id);}).filter(Boolean);
    if(b.length>=2) return b;
    return Array.from(document.querySelectorAll("body > section[id]"));
  }

  function showSection(tid){
    var sections=getSections();
    if(!sections.length){ setTimeout(function(){showSection(tid);},100); return; }
    var found=false;
    sections.forEach(function(s){
      if(s.id===tid){
        s.classList.remove('hidden'); s.style.removeProperty('display'); s.style.setProperty('display','block','important');
        s.classList.remove("hidden");
        found=true;
      } else {
        s.classList.add('hidden'); s.style.setProperty('display','none','important');
      }
    });
    if(!found && sections.length){ showSection(sections[0].id); return; }
    window.scrollTo(0,0);
    document.querySelectorAll("nav a[href]").forEach(function(a){
      var h=(a.getAttribute("href")||"").replace(/^#/,"").replace(/\.html$/,"").trim();
      if(h===tid||(tid==="home"&&(!h||h==="index"))){
        a.style.color="#6366f1"; a.style.fontWeight="700";
      } else {
        a.style.color=""; a.style.fontWeight="";
      }
    });
    var mm=document.getElementById("mobile-menu"); if(mm) mm.style.display="none";
  }

  window.navigateTo=showSection;

  document.addEventListener("click",function(e){
    var link=e.target.closest("a[href]"); if(!link) return;
    var href=(link.getAttribute("href")||"").trim();
    if(!href || href==="#"){ e.preventDefault(); return; }
    if(href.startsWith("http")||href.startsWith("//")||href.startsWith("mailto:")||href.startsWith("tel:")){
      e.preventDefault(); window.open(href,"_blank"); return;
    }
    e.preventDefault();
    e.stopPropagation();
    var tid=href.replace(/^#/,"").replace(/\.html$/,"").replace(/^\//,"").trim();
    if(!tid||tid==="index") tid="home";
    showSection(tid);
    try{ history.pushState(null,"","#"+tid); }catch(x){}
  },true);

  window.addEventListener("hashchange",function(){
    var hash=location.hash.replace(/^#/,"").trim();
    if(hash) showSection(hash);
  });

  function init(){
    var s=getSections();
    if(!s.length){ setTimeout(init,200); return; }
    var initHash=location.hash.replace(/^#/,"").trim();
    var initId=(initHash && document.getElementById(initHash)) ? initHash : (s[0]?s[0].id:"home");
    s.forEach(function(x){
      if(x.id===initId){
        x.classList.remove('hidden'); x.style.removeProperty('display'); x.style.setProperty('display','block','important');
        x.classList.remove("hidden");
      } else {
        x.classList.add('hidden'); x.style.setProperty('display','none','important');
      }
    });
  }

  window.addEventListener("load", function(){ setTimeout(init,100); });
  if(document.readyState!=="loading") setTimeout(init,100);

  window.addEventListener("error",function(e){
    if(e.target&&e.target.tagName==="IMG"){
      var img=e.target; if(img.dataset.vf) return; img.dataset.vf="1";
      var seed=(img.alt||"photo").replace(/[^a-zA-Z0-9]/g,"").toLowerCase().slice(0,20)||"photo";
      img.src="https://picsum.photos/seed/"+seed+"/800/500"; img.style.objectFit="cover";
    }
  },true);
})();
<\/script>\`;

    // ── Edit mode (only injected, no MutationObserver that triggers re-renders) ──
    const editScript = `<script data-vi="1">
(function(){
  window.addEventListener('message',function(e){
    if(!e.data)return;
    if(e.data.type==='VI_ENABLE_EDIT'){
      document.body.classList.add('vi-edit');
      document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,button,td,th').forEach(function(el){
        if(!el.dataset.viEdit){el.setAttribute('contenteditable','true');el.dataset.viEdit='1';}
      });
    }
    if(e.data.type==='VI_DISABLE_EDIT'){
      document.body.classList.remove('vi-edit');
      document.querySelectorAll('[data-vi-edit]').forEach(function(el){
        el.removeAttribute('contenteditable');delete el.dataset.viEdit;
      });
      // Send updated HTML back once
      var clone=document.documentElement.cloneNode(true);
      clone.querySelectorAll('[data-vi]').forEach(function(el){el.remove();});
      window.parent.postMessage({type:'VI_UPDATE',html:clone.querySelector('body').innerHTML},'*');
    }
  });
})();
<\/script>`;

    const styleTag = `<style data-vi="1">
*{box-sizing:border-box;}
html,body{margin:0;padding:0;width:100%;overflow-x:hidden;}
/* CRITICAL: sections must fill full viewport width regardless of Tailwind load timing */
section[id],div[id="home"],div[id="about"],div[id="services"],div[id="portfolio"]{
  width:100%!important;max-width:100%!important;
}
.page-section{width:100%!important;max-width:100%!important;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.2);border-radius:4px;}
.active-nav{color:#6366f1!important;font-weight:700!important;}
.vi-edit [contenteditable]:hover{outline:2px dashed #6366f1;outline-offset:2px;cursor:text;}
${css}
</style>`;

    const tailwind = `<script src="https://cdn.tailwindcss.com"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">`;

    // Build document
    let doc = html;
    if (!doc.includes('<html')) {
      doc = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${doc}</body></html>`;
    }
    // Inject tailwind + styles into head
    if (doc.includes('</head>')) {
      doc = doc.replace('</head>', `${tailwind}\n${styleTag}\n</head>`);
    } else {
      doc = doc.replace('<body', `${tailwind}\n${styleTag}\n<body`);
    }
    // Inject scripts before </body>
    const scripts = `\n${imgScript}\n${spaScript}\n${editScript}\n` +
      (javascript ? `<script data-vi="1">${javascript}<\/script>` : '');
    if (doc.includes('</body>')) {
      doc = doc.replace(/<\/body>(?![\s\S]*<\/body>)/, `${scripts}\n</body>`);
    } else {
      doc += scripts;
    }
    return doc;
  }, [content, refreshKey]); // refreshKey forces full reload when user clicks Regenerate

  // Write srcdoc directly to iframe — avoids React re-render resetting the page
  useEffect(() => {
    if (!iframeRef.current || !srcDoc) return;
    if (lastKeyRef.current === refreshKey && iframeRef.current.srcdoc === srcDoc) return;
    lastKeyRef.current = refreshKey;
    iframeRef.current.srcdoc = srcDoc;
  }, [srcDoc, refreshKey]);

  // Toggle edit mode via postMessage — no re-render needed
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const send = () => {
      iframe.contentWindow?.postMessage(
        { type: isEditable ? 'VI_ENABLE_EDIT' : 'VI_DISABLE_EDIT' }, '*'
      );
    };
    iframe.addEventListener('load', send, { once: true });
    // Also send immediately if already loaded
    try { send(); } catch {}
  }, [isEditable]);

  // Receive content updates from edit mode
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'VI_UPDATE' && onContentUpdate) {
        onContentUpdate(e.data.html);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onContentUpdate]);

  if (!content?.html) {
    return (
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'white',flexDirection:'column',gap:12,color:'#94a3b8'}}>
        <svg width={48} height={48} viewBox="0 0 32 32" fill="none">
          <path d="M6 5V27" stroke="#f97316" strokeWidth="4" strokeLinecap="round"/>
          <path d="M26 5V27" stroke="#10b981" strokeWidth="4" strokeLinecap="round"/>
          <path d="M6 27L26 5" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
        </svg>
        <p style={{fontSize:13,margin:0}}>Preview will appear here</p>
      </div>
    );
  }

  return (
    <div style={{width:'100%',height:'100%',background:'white',position:'relative'}}>
      <iframe
        ref={iframeRef}
        title="Website Preview"
        style={{width:'100%',height:'100%',border:'none',display:'block'}}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      />
    </div>
  );
};

export default PreviewFrame;

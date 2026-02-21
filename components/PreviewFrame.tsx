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
  var PAGE_IDS=['home','about','services','portfolio','contact','login','shop','cart','checkout','gallery','blog','pricing','team','faq','menu','solutions','features'];
  
  function getSections(){
    var tagged=Array.from(document.querySelectorAll('.page-section[id]'));
    if(tagged.length>=2)return tagged;
    var byId=PAGE_IDS.map(function(id){return document.getElementById(id);}).filter(Boolean);
    if(byId.length>=2)return byId;
    return Array.from(document.querySelectorAll('section[id]'));
  }

  function showSection(targetId){
    var sections=getSections();
    var found=false;
    sections.forEach(function(s){
      if(s.id===targetId){
        // Remove ALL hiding — both class and inline style
        s.style.display='';
        s.style.visibility='';
        s.style.opacity='';
        s.classList.remove('hidden');
        // Force visible if Tailwind still hides it
        if(window.getComputedStyle(s).display==='none') s.style.display='block';
        found=true;
        window.scrollTo(0,0);
      } else {
        s.style.display='none';
      }
    });
    // Nav active state
    document.querySelectorAll('nav a[href]').forEach(function(a){
      var href=(a.getAttribute('href')||'').replace(/^#/,'').replace(/\\.html$/,'').trim();
      if(href===targetId||(targetId==='home'&&(!href||href==='index'))){
        a.classList.add('active-nav');
      } else {
        a.classList.remove('active-nav');
      }
    });
    // Close mobile menu
    var mm=document.getElementById('mobile-menu');
    if(mm) mm.classList.add('hidden');
  }

  function initRouter(){
    var sections=getSections();
    if(!sections.length){
      // retry — Tailwind might still be loading
      setTimeout(initRouter,300);
      return;
    }
    // Show home, hide all others with inline style (beats Tailwind)
    sections.forEach(function(s){
      if(s.id==='home'||s.id===sections[0].id){
        s.style.display='';
        s.classList.remove('hidden');
      } else {
        s.style.display='none';
      }
    });
  }

  // Click handler — capture phase so it fires before any inline onclick
  document.addEventListener('click',function(e){
    var link=e.target.closest('a[href]');
    if(!link)return;
    var href=link.getAttribute('href')||'';
    if(href.startsWith('http')||href.startsWith('//')||href.startsWith('mailto:')||href.startsWith('tel:')){
      e.preventDefault();
      window.open(href,'_blank');
      return;
    }
    if(href==='#'){e.preventDefault();return;}
    e.preventDefault();
    var targetId=href.replace(/^#/,'').replace(/\\.html$/,'').replace(/^\\//,'').trim();
    if(!targetId||targetId==='index')targetId='home';
    showSection(targetId);
  },true);

  // Wait for everything to load before init
  // Tailwind CDN is async — we need to wait after it parses classes
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(initRouter,100);});
  } else {
    setTimeout(initRouter,100);
  }
})();
<\/script>`;

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
html,body{margin:0;padding:0;width:100%;}
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

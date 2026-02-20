
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
  isLoading, 
  isEditable = false,
  onContentUpdate 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastHtmlFromIframe = useRef<string | null>(null);

  // Handle messages from the iframe (Content Updates)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'VISINARO_UPDATE') {
        const newHtml = event.data.html;
        lastHtmlFromIframe.current = newHtml;
        if (onContentUpdate) {
            onContentUpdate(newHtml);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onContentUpdate]);

  // Function to apply edit mode class and trigger setup
  const applyEditMode = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) return;

    if (isEditable) {
      iframe.contentDocument.body.classList.add('visinaro-edit-mode');
      iframe.contentWindow?.postMessage({ type: 'VISINARO_ENABLE_EDIT' }, '*');
    } else {
      iframe.contentDocument.body.classList.remove('visinaro-edit-mode');
    }
  };

  // Effect to toggle edit mode when prop changes
  useEffect(() => {
    applyEditMode();
  }, [isEditable, content, refreshKey]);

  const srcDoc = useMemo(() => {
    if (!content) return '';

    const { html, css, javascript } = content;
    let doc = html;
    
    // BUILDER CSS
    const builderStyles = `
      /* GLOBAL RESET FOR PREMIUM FEEL & NO SCROLL */
      html, body {
        width: 100%;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* HIDE SCROLLBAR BUT ALLOW SCROLL */
      ::-webkit-scrollbar { width: 0px; background: transparent; }

      body.visinaro-edit-mode { cursor: default; }
      .visinaro-edit-mode .visinaro-draggable {
        cursor: move; cursor: grab; position: relative; transition: box-shadow 0.2s;
      }
      .visinaro-edit-mode .visinaro-draggable:hover {
        box-shadow: 0 0 0 2px #6366f1; z-index: 10;
      }
      .visinaro-edit-mode .visinaro-draggable:active { cursor: grabbing; }
      .visinaro-edit-mode .visinaro-editable { cursor: text; outline: none; }
      .visinaro-edit-mode .visinaro-editable:hover { background-color: rgba(99, 102, 241, 0.05); }
      .visinaro-edit-mode .visinaro-editable:focus { background-color: rgba(99, 102, 241, 0.1); box-shadow: 0 0 0 2px #6366f1; }
      .visinaro-edit-mode img { cursor: pointer; }
      .visinaro-edit-mode img:hover { opacity: 0.9; outline: 3px dashed #6366f1; }
      
      /* Context Menu & UI */
      #visinaro-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 2147483647; padding: 12px 24px; border-radius: 8px; background: white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px; font-family: sans-serif; font-size: 14px; font-weight: 500; opacity: 0; transition: opacity 0.3s, transform 0.3s; pointer-events: none; }
      #visinaro-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
      #visinaro-toast.success { border-left: 4px solid #10b981; color: #064e3b; }
      #visinaro-context-menu { position: fixed; z-index: 2147483647; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 6px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: none; flex-direction: column; min-width: 180px; font-family: sans-serif; }
      .visinaro-ctx-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: #f8fafc; font-size: 13px; cursor: pointer; border-radius: 4px; transition: background 0.15s; }
      .visinaro-ctx-item:hover { background: #334155; }
      .visinaro-divider { height: 1px; background: #334155; margin: 4px 0; }
    `;

    const builderScript = `
      <script data-visinaro-injected="true">
        window.isProgrammaticChange = false;

        window.setupBuilder = function() {
           const body = document.body;
           if (!body || !body.classList.contains('visinaro-edit-mode')) return;
           
           window.isProgrammaticChange = true;
           
           // Make Text Editable
           const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, li, button, td, th, blockquote, figcaption, label';
           document.querySelectorAll(textSelectors).forEach(el => {
              if (el.classList.contains('visinaro-editable')) return;
              if (el.hasAttribute('data-visinaro-injected')) return;
              el.setAttribute('contenteditable', 'true');
              el.classList.add('visinaro-editable');
           });

           // Make Containers Draggable
           const containerSelectors = 'section, header, footer, article, nav, aside, .container, .card, .grid > div, .flex > div, div.relative';
           document.querySelectorAll(containerSelectors).forEach(el => {
              if (el.isContentEditable) return;
              if (el.classList.contains('visinaro-draggable')) return;
              if (el.hasAttribute('data-visinaro-injected')) return;
              const style = window.getComputedStyle(el);
              if (style.position === 'absolute' && el.classList.contains('inset-0')) return;
              el.setAttribute('draggable', 'true');
              el.classList.add('visinaro-draggable');
           });
           
           // Release lock after microtask
           setTimeout(() => { window.isProgrammaticChange = false; }, 10);
        };

        // Initialize Builder Logic
        (function() {
          let contextMenu = null;
          let targetElement = null;
          let draggedElement = null;
          let activeImageToUpload = null;
          let saveTimeout = null;

          function notifyParentOfChanges() {
             if (saveTimeout) clearTimeout(saveTimeout);
             saveTimeout = setTimeout(() => {
                 const clone = document.documentElement.cloneNode(true);
                 clone.querySelectorAll('[data-visinaro-injected="true"]').forEach(el => el.remove());
                 clone.querySelectorAll('#visinaro-toast, #visinaro-context-menu').forEach(el => el.remove());
                 clone.querySelectorAll('.visinaro-editable').forEach(el => {
                    el.removeAttribute('contenteditable');
                    el.classList.remove('visinaro-editable');
                 });
                 clone.querySelectorAll('.visinaro-draggable').forEach(el => {
                    el.removeAttribute('draggable');
                    el.classList.remove('visinaro-draggable');
                 });
                 if (clone.querySelector('body')) clone.querySelector('body').classList.remove('visinaro-edit-mode');
                 
                 window.parent.postMessage({ type: 'VISINARO_UPDATE', html: clone.outerHTML }, '*');
             }, 800);
          }

          // Image Upload Input
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.style.display = 'none';
          fileInput.setAttribute('data-visinaro-injected', 'true');
          document.body.appendChild(fileInput);

          fileInput.addEventListener('change', (e) => {
             if (e.target.files && e.target.files[0] && activeImageToUpload) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (evt) => {
                   activeImageToUpload.src = evt.target.result;
                   activeImageToUpload = null;
                   fileInput.value = '';
                };
                reader.readAsDataURL(file);
             }
          });

          // Context Menu
          function createContextMenu() {
            if (document.getElementById('visinaro-context-menu')) return;
            const menu = document.createElement('div');
            menu.id = 'visinaro-context-menu';
            menu.setAttribute('data-visinaro-injected', 'true');
            menu.innerHTML = \`
              <div class="visinaro-ctx-item" id="ctx-replace-img"><span>📷</span> Replace Image</div>
              <div class="visinaro-ctx-item" id="ctx-move-up"><span>⬆️</span> Move Up</div>
              <div class="visinaro-ctx-item" id="ctx-move-down"><span>⬇️</span> Move Down</div>
              <div class="visinaro-divider"></div>
              <div class="visinaro-ctx-item" id="ctx-duplicate"><span>📋</span> Duplicate</div>
              <div class="visinaro-ctx-item" id="ctx-delete" style="color: #f87171;"><span>🗑️</span> Delete</div>
            \`;
            document.body.appendChild(menu);
            contextMenu = menu;

            document.getElementById('ctx-delete').onclick = () => { if(targetElement) targetElement.remove(); hideMenu(); };
            document.getElementById('ctx-duplicate').onclick = () => { 
              if(targetElement && targetElement.parentNode) {
                targetElement.parentNode.insertBefore(targetElement.cloneNode(true), targetElement.nextSibling);
              }
              hideMenu(); 
            };
            document.getElementById('ctx-move-up').onclick = () => {
              if(targetElement && targetElement.previousElementSibling) targetElement.parentNode.insertBefore(targetElement, targetElement.previousElementSibling);
              hideMenu();
            };
            document.getElementById('ctx-move-down').onclick = () => {
              if(targetElement && targetElement.nextElementSibling) targetElement.parentNode.insertBefore(targetElement, targetElement.nextElementSibling.nextElementSibling);
              hideMenu();
            };
            document.getElementById('ctx-replace-img').onclick = () => {
               if (activeImageToUpload) fileInput.click();
               hideMenu();
            };
          }

          function hideMenu() { if(contextMenu) contextMenu.style.display = 'none'; }

          // Listeners
          document.addEventListener('contextmenu', (e) => {
            if (!document.body.classList.contains('visinaro-edit-mode')) return;
            const target = e.target.closest('.visinaro-draggable, .visinaro-editable') || (e.target.tagName === 'IMG' ? e.target : null);
            if (!target || target.hasAttribute('data-visinaro-injected')) return;
            
            e.preventDefault();
            targetElement = target;
            createContextMenu();
            
            const isImg = e.target.tagName === 'IMG';
            document.getElementById('ctx-replace-img').style.display = isImg ? 'flex' : 'none';
            if (isImg) activeImageToUpload = e.target;

            let x = e.clientX, y = e.clientY;
            if (x + 180 > window.innerWidth) x -= 180;
            contextMenu.style.left = x + 'px';
            contextMenu.style.top = y + 'px';
            contextMenu.style.display = 'flex';
          });

          document.addEventListener('click', (e) => {
             if(contextMenu && !contextMenu.contains(e.target)) hideMenu();
             if (document.body.classList.contains('visinaro-edit-mode')) {
                const link = e.target.closest('a');
                if (link) e.preventDefault();
             }
          });
          
          document.addEventListener('dblclick', (e) => {
            if (!document.body.classList.contains('visinaro-edit-mode')) return;
            if (e.target.tagName === 'IMG') {
              activeImageToUpload = e.target;
              fileInput.click();
            }
          });
          
          // Drag Logic (Simplified)
          document.addEventListener('dragstart', (e) => {
             if (!document.body.classList.contains('visinaro-edit-mode') || e.target.isContentEditable) return;
             const t = e.target.closest('.visinaro-draggable');
             if(!t) { e.preventDefault(); return; }
             draggedElement = t;
             t.style.opacity = '0.5';
          });
          document.addEventListener('dragend', () => {
             if(draggedElement) draggedElement.style.opacity = '1';
             draggedElement = null;
          });
          document.addEventListener('dragover', (e) => {
             e.preventDefault();
             if(draggedElement) {
                const t = e.target.closest('.visinaro-draggable');
                if(t && t !== draggedElement) {
                    const rect = t.getBoundingClientRect();
                    const next = (e.clientY - rect.top) > (rect.height / 2);
                    if(next) t.after(draggedElement); else t.before(draggedElement);
                }
             }
          });

          // Observer for changes
          const observer = new MutationObserver((mutations) => {
             if (window.isProgrammaticChange) return;

             let changed = false;
             mutations.forEach(m => {
                if (m.target && m.target.hasAttribute && m.target.hasAttribute('data-visinaro-injected')) return;
                changed = true;
             });
             
             if (changed && document.body.classList.contains('visinaro-edit-mode')) {
                window.setupBuilder();
                notifyParentOfChanges();
             }
          });
          observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });

          // Message Listener
          window.addEventListener('message', (e) => {
             if (e.data && e.data.type === 'VISINARO_ENABLE_EDIT') {
                 window.setupBuilder();
             }
          });
          
          // Initial Setup
          setTimeout(window.setupBuilder, 200);
        })();
      </script>
    `;

    // --- TAILWIND & FONT INJECTION ---
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

    const styleTag = `<style data-visinaro-injected="true">${css}\n${builderStyles}</style>`;
    
    // Inject Styles & Scripts
    if (doc.includes('</head>')) {
        doc = doc.replace('</head>', `${tailwindInjection}\n${styleTag}</head>`);
    } else if (doc.includes('<body')) {
        doc = doc.replace('<body', `${tailwindInjection}\n${styleTag}<body`);
    } else {
        // Fallback for fragments
        doc = `${tailwindInjection}\n${styleTag}\n${doc}`;
    }

    const globalImageScript = `
      <script data-visinaro-injected="true">
        function fixImage(img) {
          if (img.dataset.fixed) return;
          img.dataset.fixed = '1';
          const raw = (img.alt || img.getAttribute('data-seed') || 'photo').replace(/[^a-zA-Z0-9]/g,'').toLowerCase().slice(0,20) || 'photo';
          img.src = 'https://picsum.photos/seed/' + raw + '/800/500';
          img.style.objectFit = 'cover';
          img.onerror = null;
        }
        window.addEventListener('error', (e) => { if (e.target && e.target.tagName === 'IMG') fixImage(e.target); }, true);
        window.addEventListener('DOMContentLoaded', () => {
          document.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            if (!src || src.includes('undefined') || src.includes('null') || src === window.location.href || src === '#' || src.length < 5) {
              fixImage(img);
            }
          });
        });
      </script>
    `;

    const spaLogicScript = `
      <script data-visinaro-injected="true">
      // ═══════════════════════════════════════════════════════════
      // VISINARO SPA ROUTER v3 — Robust navigation for any structure
      // ═══════════════════════════════════════════════════════════

      // Collect ALL navigable page sections (anywhere in DOM)
      // KNOWN IDs for all Visinaro-generated sections
      var KNOWN_PAGE_IDS = ['home','about','services','portfolio','contact','auth','shop','cart','checkout','login','signup','gallery','blog','pricing','team','faq','menu','visit','solutions','features'];

      function getPageSections() {
        // Strategy 1: page-section class (explicitly tagged)
        var tagged = Array.from(document.querySelectorAll('.page-section'));
        if (tagged.length >= 2) return tagged;
        
        // Strategy 2: known IDs
        var byId = KNOWN_PAGE_IDS
          .map(id => document.getElementById(id))
          .filter(Boolean);
        if (byId.length >= 2) return byId;
        
        // Strategy 3: any section/div with min-h-screen 
        var byClass = Array.from(document.querySelectorAll('section[id]')).filter(s => {
          return s.classList.contains('min-h-screen') || s.style.minHeight;
        });
        if (byClass.length >= 2) return byClass;
        
        // Strategy 4: all top-level sections with IDs
        return Array.from(document.querySelectorAll('body > section[id], main > section[id]'));
      }

      function navigateTo(targetId, pushState) {
        if (!targetId) return;
        const sections = getPageSections();
        let found = false;

        sections.forEach(s => {
          if (s.id === targetId) {
            s.style.removeProperty('display');
            s.style.removeProperty('visibility');
            s.classList.remove('hidden');
            // Force visibility if still hidden
            var cs = window.getComputedStyle(s);
            if (cs.display === 'none') s.style.display = 'block';
            found = true;
          } else {
            s.style.display = 'none';
            s.classList.add('hidden');
          }
        });

        // If not found by id, try first section as home fallback
        if (!found) {
          const first = sections[0];
          if (first) {
            first.style.display = '';
            first.classList.remove('hidden');
          }
          sections.slice(1).forEach(s => { s.style.display = 'none'; s.classList.add('hidden'); });
        }

        // Update active nav link styling
        document.querySelectorAll('nav a[href]').forEach(a => {
          const href = a.getAttribute('href') || '';
          const linkTarget = href.replace(/^#/, '').replace(/\.html$/, '').trim();
          const isActive = linkTarget === targetId || (targetId === 'home' && (linkTarget === '' || linkTarget === 'index'));
          a.classList.toggle('text-indigo-500', isActive);
          a.classList.toggle('font-bold', isActive);
        });

        // Close mobile menu
        const mMenu = document.getElementById('mobile-menu');
        if (mMenu) mMenu.classList.add('hidden');

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Click handler — intercepts ALL internal links
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;

        const href = link.getAttribute('href') || '';

        // Skip purely external links
        if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          e.preventDefault();
          window.open(href, '_blank');
          return;
        }

        // Skip pure anchor (# with no id)
        if (href === '#') { e.preventDefault(); return; }

        // Internal navigation
        e.preventDefault();
        let targetId = href.replace(/^#/, '').replace(/\.html$/, '').replace(/^\//, '').trim();
        if (!targetId || targetId === 'index') targetId = 'home';
        navigateTo(targetId, true);
      }, true);

      // Init on DOMContentLoaded
      function initRouter() {
        const sections = getPageSections();
        if (sections.length === 0) return;
        // Show home, hide everything else
        sections.forEach(s => {
          if (s.id === 'home') {
            s.style.display = '';
            s.classList.remove('hidden');
          } else {
            s.style.display = 'none';
            s.classList.add('hidden');
          }
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRouter);
      } else {
        // Already loaded (e.g. srcdoc)
        setTimeout(initRouter, 0);
      }
      </script>
    `;

    const fullScript = `${globalImageScript}${spaLogicScript}${builderScript}<script data-visinaro-injected="true">${javascript}</script>`;
    
    if (doc.includes('</body>')) doc = doc.replace('</body>', `${fullScript}</body>`);
    else doc = `${doc}${fullScript}`;

    return doc;
  }, [content]);

  // Stable srcDoc Logic
  const [displayedSrcDoc, setDisplayedSrcDoc] = useState(srcDoc);
  
  useEffect(() => {
     if (content?.html !== lastHtmlFromIframe.current) {
         setDisplayedSrcDoc(srcDoc);
     }
  }, [srcDoc, content?.html]);

  if (!content) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-col gap-3 transition-colors duration-300">
        <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-center p-5 shadow-sm">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-90">
                <path d="M8 6V26" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
                <path d="M24 6V26" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                <path d="M8 26L24 6" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            </svg>
        </div>
        <p className="text-sm font-medium opacity-70">Your preview will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative">
      {isLoading && (
        <div className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-indigo-600/90 backdrop-blur-md text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-2 animate-pulse border border-indigo-500/50">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Updating...</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={refreshKey}
        srcDoc={displayedSrcDoc}
        title="Website Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
        onLoad={applyEditMode}
      />
    </div>
  );
};

export default PreviewFrame;

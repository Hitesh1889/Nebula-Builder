
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
      if (event.data && event.data.type === 'NEBULA_UPDATE') {
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
      iframe.contentDocument.body.classList.add('nebula-edit-mode');
      iframe.contentWindow?.postMessage({ type: 'NEBULA_ENABLE_EDIT' }, '*');
    } else {
      iframe.contentDocument.body.classList.remove('nebula-edit-mode');
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
      body.nebula-edit-mode { cursor: default; }
      .nebula-edit-mode .nebula-draggable {
        cursor: move; cursor: grab; position: relative; transition: box-shadow 0.2s;
      }
      .nebula-edit-mode .nebula-draggable:hover {
        box-shadow: 0 0 0 2px #6366f1; z-index: 10;
      }
      .nebula-edit-mode .nebula-draggable:active { cursor: grabbing; }
      .nebula-edit-mode .nebula-editable { cursor: text; outline: none; }
      .nebula-edit-mode .nebula-editable:hover { background-color: rgba(99, 102, 241, 0.05); }
      .nebula-edit-mode .nebula-editable:focus { background-color: rgba(99, 102, 241, 0.1); box-shadow: 0 0 0 2px #6366f1; }
      .nebula-edit-mode img { cursor: pointer; }
      .nebula-edit-mode img:hover { opacity: 0.9; outline: 3px dashed #6366f1; }
      
      /* Context Menu & UI */
      #nebula-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 2147483647; padding: 12px 24px; border-radius: 8px; background: white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px; font-family: sans-serif; font-size: 14px; font-weight: 500; opacity: 0; transition: opacity 0.3s, transform 0.3s; pointer-events: none; }
      #nebula-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
      #nebula-toast.success { border-left: 4px solid #10b981; color: #064e3b; }
      #nebula-context-menu { position: fixed; z-index: 2147483647; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 6px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: none; flex-direction: column; min-width: 180px; font-family: sans-serif; }
      .nebula-ctx-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: #f8fafc; font-size: 13px; cursor: pointer; border-radius: 4px; transition: background 0.15s; }
      .nebula-ctx-item:hover { background: #334155; }
      .nebula-divider { height: 1px; background: #334155; margin: 4px 0; }
    `;

    const builderScript = `
      <script data-nebula-injected="true">
        window.isProgrammaticChange = false;

        window.setupBuilder = function() {
           const body = document.body;
           if (!body || !body.classList.contains('nebula-edit-mode')) return;
           
           window.isProgrammaticChange = true;
           
           // Make Text Editable
           const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, li, button, td, th, blockquote, figcaption, label';
           document.querySelectorAll(textSelectors).forEach(el => {
              if (el.classList.contains('nebula-editable')) return;
              if (el.hasAttribute('data-nebula-injected')) return;
              el.setAttribute('contenteditable', 'true');
              el.classList.add('nebula-editable');
           });

           // Make Containers Draggable
           const containerSelectors = 'section, header, footer, article, nav, aside, .container, .card, .grid > div, .flex > div, div.relative';
           document.querySelectorAll(containerSelectors).forEach(el => {
              if (el.isContentEditable) return;
              if (el.classList.contains('nebula-draggable')) return;
              if (el.hasAttribute('data-nebula-injected')) return;
              const style = window.getComputedStyle(el);
              if (style.position === 'absolute' && el.classList.contains('inset-0')) return;
              el.setAttribute('draggable', 'true');
              el.classList.add('nebula-draggable');
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
                 clone.querySelectorAll('[data-nebula-injected="true"]').forEach(el => el.remove());
                 clone.querySelectorAll('#nebula-toast, #nebula-context-menu').forEach(el => el.remove());
                 clone.querySelectorAll('.nebula-editable').forEach(el => {
                    el.removeAttribute('contenteditable');
                    el.classList.remove('nebula-editable');
                 });
                 clone.querySelectorAll('.nebula-draggable').forEach(el => {
                    el.removeAttribute('draggable');
                    el.classList.remove('nebula-draggable');
                 });
                 if (clone.querySelector('body')) clone.querySelector('body').classList.remove('nebula-edit-mode');
                 
                 window.parent.postMessage({ type: 'NEBULA_UPDATE', html: clone.outerHTML }, '*');
             }, 800);
          }

          // Image Upload Input
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.style.display = 'none';
          fileInput.setAttribute('data-nebula-injected', 'true');
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
            if (document.getElementById('nebula-context-menu')) return;
            const menu = document.createElement('div');
            menu.id = 'nebula-context-menu';
            menu.setAttribute('data-nebula-injected', 'true');
            menu.innerHTML = \`
              <div class="nebula-ctx-item" id="ctx-replace-img"><span>📷</span> Replace Image</div>
              <div class="nebula-ctx-item" id="ctx-move-up"><span>⬆️</span> Move Up</div>
              <div class="nebula-ctx-item" id="ctx-move-down"><span>⬇️</span> Move Down</div>
              <div class="nebula-divider"></div>
              <div class="nebula-ctx-item" id="ctx-duplicate"><span>📋</span> Duplicate</div>
              <div class="nebula-ctx-item" id="ctx-delete" style="color: #f87171;"><span>🗑️</span> Delete</div>
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
            if (!document.body.classList.contains('nebula-edit-mode')) return;
            const target = e.target.closest('.nebula-draggable, .nebula-editable') || (e.target.tagName === 'IMG' ? e.target : null);
            if (!target || target.hasAttribute('data-nebula-injected')) return;
            
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
             if (document.body.classList.contains('nebula-edit-mode')) {
                const link = e.target.closest('a');
                if (link) e.preventDefault();
             }
          });
          
          document.addEventListener('dblclick', (e) => {
            if (!document.body.classList.contains('nebula-edit-mode')) return;
            if (e.target.tagName === 'IMG') {
              activeImageToUpload = e.target;
              fileInput.click();
            }
          });
          
          // Drag Logic (Simplified)
          document.addEventListener('dragstart', (e) => {
             if (!document.body.classList.contains('nebula-edit-mode') || e.target.isContentEditable) return;
             const t = e.target.closest('.nebula-draggable');
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
                const t = e.target.closest('.nebula-draggable');
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
                if (m.target && m.target.hasAttribute && m.target.hasAttribute('data-nebula-injected')) return;
                changed = true;
             });
             
             if (changed && document.body.classList.contains('nebula-edit-mode')) {
                // If the DOM changed, maybe new elements need builder classes?
                // But avoid re-triggering notification if setupBuilder does it
                window.setupBuilder();
                notifyParentOfChanges();
             }
          });
          observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });

          // Message Listener
          window.addEventListener('message', (e) => {
             if (e.data && e.data.type === 'NEBULA_ENABLE_EDIT') {
                 window.setupBuilder();
             }
          });
          
          // Initial Setup
          setTimeout(window.setupBuilder, 200);
        })();
      </script>
    `;

    const styleTag = `<style data-nebula-injected="true">${css}\n${builderStyles}</style>`;
    
    if (doc.includes('</head>')) doc = doc.replace('</head>', `${styleTag}</head>`);
    else doc = `${styleTag}${doc}`;

    const globalImageScript = `
      <script data-nebula-injected="true">
        function fixImage(img) {
          if (img.dataset.retries) return;
          img.dataset.retries = '1';
          
          // Generate a stable seed from the alt text
          const str = img.alt || 'default';
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
          }
          const seed = Math.abs(hash);
          
          img.src = "https://picsum.photos/seed/" + seed + "/800/600";
          img.style.objectFit = 'cover';
        }
        window.addEventListener('error', (e) => { if (e.target && e.target.tagName === 'IMG') fixImage(e.target); }, true);
      </script>
    `;

    const fullScript = `${globalImageScript}${builderScript}<script data-nebula-injected="true">${javascript}</script>`;
    
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
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-sm transform rotate-45"></div>
        </div>
        <p>Your preview will appear here</p>
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

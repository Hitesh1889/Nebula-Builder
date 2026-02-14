
import React, { useMemo, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { GeneratedContent } from '../types';

interface PreviewFrameProps {
  content: GeneratedContent | null;
  refreshKey: number; 
  isLoading?: boolean;
  isEditable?: boolean;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ content, refreshKey, isLoading, isEditable = false }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Effect to toggle edit mode in the iframe without reloading
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) return;

    if (isEditable) {
      iframe.contentDocument.body.classList.add('nebula-edit-mode');
    } else {
      iframe.contentDocument.body.classList.remove('nebula-edit-mode');
    }
  }, [isEditable, content, refreshKey]);

  const srcDoc = useMemo(() => {
    if (!content) return '';

    const { html, css, javascript } = content;

    // Inject CSS and JS into the HTML
    let doc = html;
    
    // BUILDER CSS
    const builderStyles = `
      /* Edit Mode Styles */
      body.nebula-edit-mode {
        cursor: default;
      }
      
      /* Draggable Containers */
      .nebula-edit-mode .nebula-draggable {
        cursor: move; /* Fallback */
        cursor: grab;
        position: relative;
        transition: box-shadow 0.2s, transform 0.2s;
      }
      
      .nebula-edit-mode .nebula-draggable:hover {
        box-shadow: 0 0 0 1px #6366f1; /* Thin blue border */
      }
      
      .nebula-edit-mode .nebula-draggable:active {
        cursor: grabbing;
      }

      /* Editable Text */
      .nebula-edit-mode .nebula-editable {
        cursor: text;
        outline: none;
      }
      .nebula-edit-mode .nebula-editable:hover {
        background-color: rgba(99, 102, 241, 0.05);
        border-radius: 2px;
      }
      .nebula-edit-mode .nebula-editable:focus {
        background-color: rgba(99, 102, 241, 0.1);
        box-shadow: 0 0 0 2px #6366f1;
      }

      /* Images in Edit Mode */
      .nebula-edit-mode img {
        cursor: pointer;
      }
      .nebula-edit-mode img:hover {
        opacity: 0.9;
        outline: 2px dashed #6366f1;
      }

      /* Drag Indicators */
      .nebula-drag-over-top::before {
        content: '';
        position: absolute;
        top: -4px;
        left: 0;
        right: 0;
        height: 4px;
        background: #6366f1;
        border-radius: 2px;
        pointer-events: none;
        z-index: 9999;
      }

      .nebula-drag-over-bottom::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        right: 0;
        height: 4px;
        background: #6366f1;
        border-radius: 2px;
        pointer-events: none;
        z-index: 9999;
      }

      /* Notifications */
      #nebula-toast {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 20000;
        padding: 12px 24px;
        border-radius: 8px;
        background: white;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s;
        pointer-events: none;
      }
      #nebula-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      #nebula-toast.success { border-left: 4px solid #10b981; color: #064e3b; }
      #nebula-toast.info { border-left: 4px solid #3b82f6; color: #1e3a8a; }

      /* Context Menu */
      #nebula-context-menu {
        position: fixed;
        z-index: 10000;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 6px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        display: none;
        flex-direction: column;
        min-width: 180px;
        font-family: 'Inter', sans-serif;
      }
      .nebula-ctx-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        color: #f8fafc;
        font-size: 13px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.15s;
      }
      .nebula-ctx-item:hover {
        background: #334155;
      }
      .nebula-divider { height: 1px; background: #334155; margin: 4px 0; }
    `;

    // BUILDER JS LOGIC
    const builderScript = `
      <script>
        // Define notification function globally
        window.showNotification = function(type, message) {
            let toast = document.getElementById('nebula-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'nebula-toast';
                document.body.appendChild(toast);
            }
            toast.className = 'show ' + type;
            toast.innerHTML = message;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        };

        (function() {
          let contextMenu = null;
          let targetElement = null;
          let draggedElement = null;
          let activeImageToUpload = null;

          // 1. File Input for Image Upload
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.style.display = 'none';
          document.body.appendChild(fileInput);

          fileInput.addEventListener('change', (e) => {
             if (e.target.files && e.target.files[0] && activeImageToUpload) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (evt) => {
                   activeImageToUpload.src = evt.target.result;
                   // Reset
                   activeImageToUpload = null;
                   fileInput.value = '';
                };
                reader.readAsDataURL(file);
             }
          });

          function setupBuilder() {
             if (!document.body.classList.contains('nebula-edit-mode')) return;
             
             // Make Text Editable
             const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, li, button, td, th, blockquote, figcaption, label';
             document.querySelectorAll(textSelectors).forEach(el => {
                if (!el.closest('.nebula-draggable')) { }
                el.setAttribute('contenteditable', 'true');
                el.classList.add('nebula-editable');
             });

             // Make Containers Draggable
             const containerSelectors = 'section, header, footer, article, nav, aside, .container, .card, .grid > div, .flex > div, div.relative';
             document.querySelectorAll(containerSelectors).forEach(el => {
                if (el.isContentEditable) return;
                
                // Don't make full-screen absolute overlays draggable, they are likely backgrounds
                if (window.getComputedStyle(el).position === 'absolute' && el.classList.contains('inset-0')) return;

                el.setAttribute('draggable', 'true');
                el.classList.add('nebula-draggable');
             });
          }

          function createContextMenu() {
            if (document.getElementById('nebula-context-menu')) return;
            
            const menu = document.createElement('div');
            menu.id = 'nebula-context-menu';
            menu.innerHTML = \`
              <div class="nebula-ctx-item" id="ctx-upload-bg"><span>🖼️</span> Change Background</div>
              <div class="nebula-divider" id="div-bg"></div>
              <div class="nebula-ctx-item" id="ctx-move-up"><span>⬆️</span> Move Up</div>
              <div class="nebula-ctx-item" id="ctx-move-down"><span>⬇️</span> Move Down</div>
              <div class="nebula-divider"></div>
              <div class="nebula-ctx-item" id="ctx-duplicate"><span>📋</span> Duplicate</div>
              <div class="nebula-ctx-item" id="ctx-delete" style="color: #f87171;"><span>🗑️</span> Delete Element</div>
            \`;
            document.body.appendChild(menu);
            contextMenu = menu;

            // Bind Actions
            document.getElementById('ctx-delete').onclick = () => { if(targetElement) targetElement.remove(); hideMenu(); };
            
            document.getElementById('ctx-duplicate').onclick = () => { 
              if(targetElement && targetElement.parentNode) {
                const clone = targetElement.cloneNode(true);
                targetElement.parentNode.insertBefore(clone, targetElement.nextSibling);
                setupBuilder(); 
              }
              hideMenu(); 
            };
            
            document.getElementById('ctx-move-up').onclick = () => {
              if(targetElement && targetElement.previousElementSibling) {
                targetElement.parentNode.insertBefore(targetElement, targetElement.previousElementSibling);
              }
              hideMenu();
            };
            
            document.getElementById('ctx-move-down').onclick = () => {
              if(targetElement && targetElement.nextElementSibling) {
                targetElement.parentNode.insertBefore(targetElement, targetElement.nextElementSibling.nextElementSibling);
              }
              hideMenu();
            };

            document.getElementById('ctx-upload-bg').onclick = () => {
               // Find child absolute img
               if (targetElement) {
                   const bgImg = targetElement.querySelector('img.absolute');
                   if (bgImg) {
                      activeImageToUpload = bgImg;
                      fileInput.click();
                   }
               }
               hideMenu();
            };
          }

          function hideMenu() {
            if(contextMenu) contextMenu.style.display = 'none';
          }

          // Double Click Image to Upload
          document.addEventListener('dblclick', (e) => {
            if (!document.body.classList.contains('nebula-edit-mode')) return;
            if (e.target.tagName === 'IMG') {
              activeImageToUpload = e.target;
              fileInput.click();
            }
          });

          // Right Click Context Menu
          document.addEventListener('contextmenu', (e) => {
            if (!document.body.classList.contains('nebula-edit-mode')) return;
            
            const target = e.target.closest('.nebula-draggable, .nebula-editable');
            if (!target) return;
            
            e.preventDefault();
            targetElement = target;
            createContextMenu();
            
            // Check for background image capability
            const bgBtn = document.getElementById('ctx-upload-bg');
            const bgDiv = document.getElementById('div-bg');
            const hasBgImg = targetElement.querySelector && targetElement.querySelector('img.absolute');
            
            if (hasBgImg) {
                bgBtn.style.display = 'flex';
                bgDiv.style.display = 'block';
            } else {
                bgBtn.style.display = 'none';
                bgDiv.style.display = 'none';
            }
            
            let x = e.clientX;
            let y = e.clientY;
            if (x + 180 > window.innerWidth) x -= 180;
            
            contextMenu.style.left = x + 'px';
            contextMenu.style.top = y + 'px';
            contextMenu.style.display = 'flex';
          });

          document.addEventListener('click', (e) => {
            if(contextMenu && !contextMenu.contains(e.target)) hideMenu();
            
            if (document.body.classList.contains('nebula-edit-mode')) {
              const link = e.target.closest('a');
              if (link) {
                 e.preventDefault();
              }
            }
          });

          // Drag and Drop Logic
          document.addEventListener('dragstart', (e) => {
             if (!document.body.classList.contains('nebula-edit-mode')) return;
             if (e.target.isContentEditable) return;
             
             const target = e.target.closest('.nebula-draggable');
             if (!target) { e.preventDefault(); return; }
             
             draggedElement = target;
             e.target.style.opacity = '0.4';
             e.dataTransfer.effectAllowed = 'move';
             e.dataTransfer.setData('text/plain', '');
          });

          document.addEventListener('dragend', (e) => {
             if (!document.body.classList.contains('nebula-edit-mode')) return;
             if (draggedElement) draggedElement.style.opacity = '1';
             draggedElement = null;
             document.querySelectorAll('.nebula-drag-over-top, .nebula-drag-over-bottom').forEach(el => {
                 el.classList.remove('nebula-drag-over-top', 'nebula-drag-over-bottom');
             });
          });

          document.addEventListener('dragover', (e) => {
             if (!document.body.classList.contains('nebula-edit-mode')) return;
             e.preventDefault(); 
             e.dataTransfer.dropEffect = 'move';

             const target = e.target.closest('.nebula-draggable');
             document.querySelectorAll('.nebula-drag-over-top, .nebula-drag-over-bottom').forEach(el => {
                 if (el !== target) el.classList.remove('nebula-drag-over-top', 'nebula-drag-over-bottom');
             });

             if (target && target !== draggedElement) {
                 const rect = target.getBoundingClientRect();
                 const mid = (rect.bottom - rect.top) / 2;
                 const y = e.clientY - rect.top;
                 target.classList.remove('nebula-drag-over-top', 'nebula-drag-over-bottom');
                 if (y > mid) target.classList.add('nebula-drag-over-bottom');
                 else target.classList.add('nebula-drag-over-top');
             }
          });

          document.addEventListener('drop', (e) => {
             if (!document.body.classList.contains('nebula-edit-mode')) return;
             e.preventDefault();
             const target = e.target.closest('.nebula-draggable');
             if (target && target !== draggedElement && draggedElement) {
                 const rect = target.getBoundingClientRect();
                 const mid = (rect.bottom - rect.top) / 2;
                 const y = e.clientY - rect.top;
                 if (y > mid) target.after(draggedElement);
                 else target.before(draggedElement);
             }
             if (draggedElement) draggedElement.style.opacity = '1';
             document.querySelectorAll('.nebula-drag-over-top, .nebula-drag-over-bottom').forEach(el => {
                 el.classList.remove('nebula-drag-over-top', 'nebula-drag-over-bottom');
             });
          });

          const observer = new MutationObserver((mutations) => {
             let shouldUpdate = false;
             mutations.forEach(m => {
                if (m.type === 'childList') shouldUpdate = true;
                if (m.type === 'attributes' && m.attributeName === 'class' && document.body.classList.contains('nebula-edit-mode')) shouldUpdate = true;
             });
             if (shouldUpdate && document.body.classList.contains('nebula-edit-mode')) {
                setupBuilder();
             }
          });
          observer.observe(document.body, { childList: true, subtree: true, attributes: true });
          setTimeout(setupBuilder, 100);

        })();
      </script>
    `;

    const styleTag = `<style>${css}\n${builderStyles}</style>`;
    const metaReferrer = '<meta name="referrer" content="no-referrer" />';
    
    if (doc.includes('</head>')) {
      doc = doc.replace('</head>', `${metaReferrer}${styleTag}</head>`);
    } else {
      doc = `${metaReferrer}${styleTag}${doc}`;
    }

    // Global Image Fixer
    const globalImageErrorHandler = `
      <script>
        function fixImage(img) {
          if (img.dataset.fallbackApplied) return;
          img.dataset.fallbackApplied = 'true';
          const seed = Math.floor(Math.random() * 1000) + Date.now();
          img.src = 'https://picsum.photos/seed/' + seed + '/800/600';
        }
        window.addEventListener('error', function(e) {
          if (e.target && e.target.tagName === 'IMG') fixImage(e.target);
        }, true);
      </script>
    `;

    const scriptTag = `<script>${javascript}</script>`;
    
    if (doc.includes('</body>')) {
      doc = doc.replace('</body>', `${globalImageErrorHandler}${builderScript}${scriptTag}</body>`);
    } else {
      doc = `${doc}${globalImageErrorHandler}${builderScript}${scriptTag}`;
    }

    return doc;
  }, [content]);

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
        srcDoc={srcDoc}
        title="Website Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      />
    </div>
  );
};

export default PreviewFrame;

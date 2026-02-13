import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { GeneratedContent } from '../types';

interface PreviewFrameProps {
  content: GeneratedContent | null;
  refreshKey: number; 
  isLoading?: boolean;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ content, refreshKey, isLoading }) => {
  
  const srcDoc = useMemo(() => {
    if (!content) return '';

    const { html, css, javascript } = content;

    // Inject CSS and JS into the HTML
    
    let doc = html;
    
    // Inject CSS
    const styleTag = `<style>${css}</style>`;
    if (doc.includes('</head>')) {
      doc = doc.replace('</head>', `${styleTag}</head>`);
    } else {
      doc = `${styleTag}${doc}`;
    }

    // Script to prevent navigation (links reloading the app in iframe)
    const navigationGuard = `
      <script>
        document.addEventListener('click', (e) => {
          const link = e.target.closest('a');
          if (!link) return;
          
          const href = link.getAttribute('href');
          
          if (!href || href === '#') {
            e.preventDefault();
            return;
          }
          
          if (href.startsWith('#') && href.length > 1) {
            return;
          }
          
          e.preventDefault();
          console.log('Preview navigation blocked:', href);
        }, { capture: false });
      </script>
    `;

    // Inject JS and Guard
    const scriptTag = `<script>${javascript}</script>`;
    
    if (doc.includes('</body>')) {
      doc = doc.replace('</body>', `${navigationGuard}${scriptTag}</body>`);
    } else {
      doc = `${doc}${navigationGuard}${scriptTag}`;
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
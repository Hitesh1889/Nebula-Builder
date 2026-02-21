import React, { useRef, useEffect, useCallback } from 'react';
import { GeneratedContent } from '../types';

interface Props {
  content: GeneratedContent | null;
  isEditable?: boolean;
  onContentChange?: (c: GeneratedContent) => void;
  viewportWidth?: number;
  iframeKey?: number;
}

export default function PreviewFrame({ content, isEditable, onContentChange, viewportWidth, iframeKey }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build the full HTML to render in the iframe
  const getHtml = useCallback((): string => {
    if (!content?.html) return '';

    const html = content.html;

    // If it's already a complete document (has <html> tag), use it directly
    if (/<html/i.test(html)) {
      return html;
    }

    // Otherwise wrap it
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdn.tailwindcss.com"><\/script>
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;font-family:system-ui,sans-serif}
.pg{min-height:100vh;width:100%}
</style>
</head>
<body>
${html}
<script>
${content.javascript || ''}
<\/script>
</body>
</html>`;
  }, [content]);

  // Write content to iframe using srcdoc
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const html = getHtml();
    if (!html) {
      iframe.srcdoc = '';
      return;
    }
    iframe.srcdoc = html;
  }, [content, iframeKey, getHtml]);

  // Edit mode — post message to iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const msg = isEditable ? 'VI_ENABLE_EDIT' : 'VI_DISABLE_EDIT';
    try { iframe.contentWindow?.postMessage({ type: msg }, '*'); } catch {}
  }, [isEditable]);

  // Listen for edit updates from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'VI_UPDATE' && onContentChange && content) {
        onContentChange({ ...content, html: e.data.html });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onContentChange, content]);

  const scale = viewportWidth && viewportWidth < window.innerWidth
    ? viewportWidth / window.innerWidth
    : 1;

  return (
    <div style={{
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      background: '#0a0a14',
    }}>
      <iframe
        ref={iframeRef}
        key={iframeKey}
        style={{
          width: viewportWidth ? `${viewportWidth}px` : '100%',
          height: '100%',
          border: 'none',
          transformOrigin: 'top center',
          transform: scale < 1 ? `scale(${scale})` : 'none',
          background: 'white',
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Preview"
      />
    </div>
  );
}

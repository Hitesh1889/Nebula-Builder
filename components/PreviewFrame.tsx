import React, { useRef, useEffect, useCallback } from 'react';
import { GeneratedContent } from '../types';

interface Props {
  content: GeneratedContent | null;
  isEditable?: boolean;
  onContentUpdate?: (html: string) => void;
  refreshKey?: number;
}

export default function PreviewFrame({ content, isEditable, onContentUpdate, refreshKey }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getHtml = useCallback((): string => {
    if (!content?.html) return '';
    const html = content.html;
    if (/<html/i.test(html)) return html;
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdn.tailwindcss.com"></script>
<style>*{box-sizing:border-box}html,body{margin:0;padding:0}.pg{min-height:100vh;width:100%}</style>
</head><body>${html}</body></html>`;
  }, [content]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const html = getHtml();
    iframe.srcdoc = html || '<html><body style="background:#090912"></body></html>';
  }, [content, refreshKey, getHtml]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try { iframe.contentWindow?.postMessage({ type: isEditable ? 'VI_ENABLE_EDIT' : 'VI_DISABLE_EDIT' }, '*'); } catch {}
  }, [isEditable]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'VI_UPDATE' && onContentUpdate) onContentUpdate(e.data.html);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onContentUpdate]);

  return (
    <iframe
      ref={iframeRef}
      style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: 'white' }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      title="Preview"
    />
  );
}

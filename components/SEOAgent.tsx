
import React, { useState } from 'react';
import { Search, Sparkles, X, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { optimizeSEO } from '../services/aiService';
import { GeneratedContent } from '../types';

interface SEOAgentProps {
  content: GeneratedContent | null;
  prompt: string;
  onContentUpdate: (newContent: GeneratedContent) => void;
}

const SEO_CHECKLIST = [
  { id: 'title', label: 'Title tag', check: (html: string) => /<title>.+<\/title>/i.test(html) },
  { id: 'desc', label: 'Meta description', check: (html: string) => /name="description"/i.test(html) },
  { id: 'og', label: 'Open Graph tags', check: (html: string) => /property="og:/i.test(html) },
  { id: 'h1', label: 'H1 tag present', check: (html: string) => /<h1/i.test(html) },
  { id: 'alt', label: 'Image alt texts', check: (html: string) => !/<img(?![^>]*alt=)[^>]*>/i.test(html) },
  { id: 'schema', label: 'Structured data (JSON-LD)', check: (html: string) => /application\/ld\+json/i.test(html) },
  { id: 'canonical', label: 'Canonical URL', check: (html: string) => /rel="canonical"/i.test(html) },
  { id: 'twitter', label: 'Twitter Card', check: (html: string) => /name="twitter:card"/i.test(html) },
];

const SEOAgent: React.FC<SEOAgentProps> = ({ content, prompt, onContentUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [report, setReport] = useState('');
  const [isOptimized, setIsOptimized] = useState(false);

  const html = content?.html || '';
  const score = html ? SEO_CHECKLIST.filter(item => item.check(html)).length : 0;
  const scorePercent = Math.round((score / SEO_CHECKLIST.length) * 100);
  const scoreColor = scorePercent >= 80 ? 'text-emerald-400' : scorePercent >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = scorePercent >= 80 ? 'bg-emerald-500' : scorePercent >= 50 ? 'bg-amber-500' : 'bg-red-500';

  const handleOptimize = async () => {
    if (!content) return;
    setIsOptimizing(true);
    setReport('');
    try {
      const { improvedHtml, seoReport } = await optimizeSEO(html, prompt);
      onContentUpdate({ ...content, html: improvedHtml });
      setReport(seoReport);
      setIsOptimized(true);
    } catch (e) {
      setReport('SEO optimization failed. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  if (!content) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
          isOptimized 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
            : `bg-${scorePercent >= 80 ? 'emerald' : scorePercent >= 50 ? 'amber' : 'red'}-500/10 ${scoreColor} border-${scorePercent >= 80 ? 'emerald' : scorePercent >= 50 ? 'amber' : 'red'}-500/20`
        }`}
        title="SEO Agent"
      >
        <Search className="w-3.5 h-3.5" />
        SEO: {scorePercent}%
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">SEO Agent</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Score */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">SEO Score</span>
              <span className={`text-lg font-bold ${scoreColor}`}>{scorePercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${scoreBg} transition-all duration-500 rounded-full`} 
                style={{ width: `${scorePercent}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="p-4 border-b border-white/5 space-y-2 max-h-48 overflow-y-auto">
            {SEO_CHECKLIST.map(item => {
              const passed = item.check(html);
              return (
                <div key={item.id} className="flex items-center gap-2">
                  {passed 
                    ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  }
                  <span className={`text-xs ${passed ? 'text-slate-400' : 'text-red-300'}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Report */}
          {report && (
            <div className="p-4 border-b border-white/5">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Changes Made</p>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{report}</p>
            </div>
          )}

          {/* Action */}
          <div className="p-4">
            <button
              onClick={handleOptimize}
              disabled={isOptimizing || isOptimized}
              className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isOptimized 
                  ? 'bg-emerald-500/20 text-emerald-300 cursor-default border border-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isOptimizing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Optimizing SEO...</>
              ) : isOptimized ? (
                <><CheckCircle className="w-4 h-4" /> SEO Optimized!</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Auto-Fix SEO Issues</>
              )}
            </button>
            {!isOptimized && (
              <p className="text-xs text-slate-500 text-center mt-2">
                AI will inject meta tags, structured data & fix semantic HTML
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOAgent;


import React, { useState, useEffect } from 'react';
import { Wand2, Loader2, History, ArrowRight, Zap } from 'lucide-react';
import { DEFAULT_MODEL, EXAMPLE_PROMPTS } from '../constants';
import { GenerationStatus } from '../types';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  status: GenerationStatus;
  onGenerate: (model: string) => void;
  onShowHistory: () => void;
  isLanding?: boolean; // Changes style based on context
}

const QUICK_CHIPS = [
  "Coffee Shop",
  "Portfolio",
  "SaaS Landing",
  "E-commerce Store",
  "Gym Website",
  "Music Festival"
];

const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  setPrompt, 
  status, 
  onGenerate,
  onShowHistory,
  isLanding = false
}) => {
  const [placeholder, setPlaceholder] = useState('');
  const isGenerating = status === GenerationStatus.GENERATING;

  useEffect(() => {
    const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPlaceholder(`e.g., "${randomPrompt}"`);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(DEFAULT_MODEL);
  };

  const handleChipClick = (chip: string) => {
    setPrompt(chip);
    // Slight delay to allow state update before generating
    setTimeout(() => onGenerate(DEFAULT_MODEL), 100);
  };

  if (isLanding) {
      return (
        <div className="w-full space-y-6">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 transition-all group-focus-within:border-indigo-500/50 group-focus-within:bg-slate-900/80 backdrop-blur-xl">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your website..."
                        className="flex-1 min-w-0 bg-transparent border-0 text-white placeholder-slate-500 focus:ring-0 resize-none h-14 py-3 px-4 text-lg font-medium leading-tight scrollbar-hide"
                        disabled={isGenerating}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <div className="flex shrink-0 items-center gap-2 pr-2">
                         <button
                           type="button"
                           onClick={onShowHistory}
                           className="p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
                           title="History"
                         >
                            <History className="w-5 h-5" />
                         </button>
                         <button
                            type="button" 
                            onClick={(e) => { e.preventDefault(); handleSubmit(); }}
                            disabled={!prompt.trim() || isGenerating}
                            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                                !prompt.trim() || isGenerating 
                                ? 'bg-white/5 text-slate-500 cursor-not-allowed' 
                                : 'bg-white text-slate-900 hover:bg-indigo-50 hover:scale-105 shadow-lg shadow-indigo-500/20'
                            }`}
                         >
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                         </button>
                    </div>
                </div>
            </form>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Quick Start:</span>
                {QUICK_CHIPS.map(chip => (
                    <button
                        key={chip}
                        onClick={() => handleChipClick(chip)}
                        disabled={isGenerating}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300 text-sm font-medium transition-all flex items-center gap-1.5 backdrop-blur-md"
                    >
                        <Zap className="w-3 h-3" />
                        {chip}
                    </button>
                ))}
            </div>
        </div>
      );
  }

  // Condensed Sidebar Version
  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="New idea..."
          className="w-full h-48 p-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
          disabled={isGenerating}
          onKeyDown={(e) => {
              if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
              }
          }}
        />
        <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`absolute bottom-2 right-2 p-2 rounded-lg transition-colors ${
                !prompt.trim() || isGenerating ? 'text-slate-600' : 'text-indigo-400 hover:bg-white/10'
            }`}
        >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

export default PromptInput;
    
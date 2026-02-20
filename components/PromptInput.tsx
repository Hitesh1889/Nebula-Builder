
import React, { useState, useEffect } from 'react';
import { Loader2, History, ArrowRight, Zap, Clock } from 'lucide-react';
import { AVAILABLE_MODELS, DEFAULT_MODEL, EXAMPLE_PROMPTS } from '../constants';
import { GenerationStatus } from '../types';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  status: GenerationStatus;
  onGenerate: (model: string) => void;
  onShowHistory: () => void;
  isLanding?: boolean;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const QUICK_CHIPS = [
  "Coffee Shop",
  "Portfolio",
  "SaaS Landing",
  "E-commerce",
  "Gym Website",
  "Music Festival",
  "Restaurant",
  "Agency"
];

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  status,
  onGenerate,
  onShowHistory,
  isLanding = false,
  selectedModel = DEFAULT_MODEL,
  onModelChange,
}) => {
  const [placeholder, setPlaceholder] = useState('');
  const isGenerating = status === GenerationStatus.GENERATING;

  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPlaceholder(`e.g., "${randomPrompt.slice(0, 80)}..."`);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(selectedModel);
  };

  const handleChipClick = (chip: string) => {
    setPrompt(chip);
    setTimeout(() => onGenerate(selectedModel), 100);
  };

  if (isLanding) {
    return (
      <div className="w-full space-y-4">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all group-focus-within:border-indigo-500/50 backdrop-blur-xl">

            {/* Text area */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder || "Describe your website idea..."}
              className="w-full bg-transparent border-0 text-white placeholder-slate-500 focus:ring-0 resize-none h-20 py-4 px-4 text-base font-medium leading-relaxed scrollbar-hide"
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
              }}
            />

            {/* Bottom bar: model selector + time estimate + generate button */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                {/* Model selector inline */}
                {onModelChange && (
                  <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                    {AVAILABLE_MODELS.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onModelChange(m.id)}
                        className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                          selectedModel === m.id
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={m.description}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Estimated time */}
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>~{currentModel.estimatedTime}s</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onShowHistory}
                  className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  title="History"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isGenerating}
                  className={`px-4 py-1.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
                    !prompt.trim() || isGenerating
                      ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                      : 'bg-white text-slate-900 hover:bg-indigo-50 hover:scale-105 shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {isGenerating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                    : <><ArrowRight className="w-4 h-4" /> Generate</>
                  }
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Quick:</span>
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              disabled={isGenerating}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300 text-xs font-medium transition-all flex items-center gap-1 backdrop-blur-md"
            >
              <Zap className="w-3 h-3" />
              {chip}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Condensed sidebar version
  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="New idea..."
          className="w-full h-40 p-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
          disabled={isGenerating}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
          }}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className={`absolute bottom-2 right-2 p-2 rounded-lg transition-colors ${
            !prompt.trim() || isGenerating ? 'text-slate-600' : 'text-indigo-400 hover:bg-white/10'
          }`}
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

export default PromptInput;

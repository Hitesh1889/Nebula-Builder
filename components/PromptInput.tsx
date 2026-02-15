
import React, { useState, useEffect } from 'react';
import { Wand2, Loader2, History } from 'lucide-react';
import { DEFAULT_MODEL, EXAMPLE_PROMPTS } from '../constants';
import { GenerationStatus } from '../types';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  status: GenerationStatus;
  onGenerate: (model: string) => void;
  onShowHistory: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  setPrompt, 
  status, 
  onGenerate,
  onShowHistory,
}) => {
  const [placeholder, setPlaceholder] = useState('');

  // Randomize placeholder on mount
  useEffect(() => {
    const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPlaceholder(`e.g., ${randomPrompt}`);
  }, []);

  const isGenerating = status === GenerationStatus.GENERATING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(DEFAULT_MODEL);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm backdrop-blur-sm transition-colors duration-300">
      <div className="flex items-center justify-between pl-10 lg:pl-0">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Describe your dream website
        </label>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onShowHistory}
            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            title="Saved History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
          disabled={isGenerating}
        />
        
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`
              flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white shadow-lg shadow-indigo-500/20 w-full sm:w-auto transition-all transform active:scale-95
              ${!prompt.trim() || isGenerating 
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40'}
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Building...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate Website</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;

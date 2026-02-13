import React, { useState } from 'react';
import { Lightbulb, Sparkles, ArrowRight, Loader2, Copy, Check } from 'lucide-react';
import { enhancePrompt } from '../services/geminiService';

interface SidebarToolsProps {
  setPrompt: (prompt: string) => void;
}

const SidebarTools: React.FC<SidebarToolsProps> = ({ setPrompt }) => {
  const [activeTab, setActiveTab] = useState<'tips' | 'spark'>('tips');
  const [ideaInput, setIdeaInput] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState('');

  const handleEnhance = async () => {
    if (!ideaInput.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(ideaInput);
      setGeneratedIdea(enhanced);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyPrompt = () => {
    setPrompt(generatedIdea);
    setIdeaInput('');
    setGeneratedIdea('');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('tips')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'tips'
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Pro Tips
        </button>
        <button
          onClick={() => setActiveTab('spark')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'spark'
              ? 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border-b-2 border-fuchsia-600 dark:border-fuchsia-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Idea Spark
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'tips' ? (
          <div className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2 text-sm">Be Specific</h4>
              <p className="text-sm text-indigo-800/80 dark:text-indigo-200/70 leading-relaxed">
                Mention colors (e.g., "dark mode with neon blue"), style (e.g., "minimalist", "brutalist"), and sections.
              </p>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
               <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2 text-sm">Interactive Elements</h4>
               <p className="text-sm text-emerald-800/80 dark:text-emerald-200/70 leading-relaxed">
                 Ask for specific features like "sticky navbar", "image carousel", or "contact form validation".
               </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/50">
               <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2 text-sm">Iterate</h4>
               <p className="text-sm text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
                 You can edit the code directly in the 'Code' tab to tweak details, then see changes instantly.
               </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                What are you building?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  placeholder="e.g. Pizza Shop, Lawyer, Gym..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleEnhance()}
                />
                <button
                  onClick={handleEnhance}
                  disabled={!ideaInput.trim() || isEnhancing}
                  className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isEnhancing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {generatedIdea ? (
              <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Generated Prompt</span>
                </div>
                <div className="flex-1 overflow-y-auto mb-3 pr-1 custom-scrollbar">
                   <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                     {generatedIdea}
                   </p>
                </div>
                <button
                  onClick={applyPrompt}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Use This Prompt
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Enter a simple topic above to generate a professional, detailed prompt.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarTools;
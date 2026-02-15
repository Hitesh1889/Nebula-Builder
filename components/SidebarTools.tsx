
import React, { useState, useRef, useEffect } from 'react';
import { Lightbulb, Sparkles, Loader2, Zap, ChevronDown, Search, Pencil } from 'lucide-react';
import { enhancePrompt } from '../services/geminiService';

interface SidebarToolsProps {
  setPrompt: (prompt: string) => void;
}

const GENRES = [
  "Cafe",
  "Portfolio",
  "Startup Landing Page",
  "E-commerce Store",
  "Restaurant",
  "Event Page",
  "SaaS Dashboard",
  "Documentation Site",
  "Online Resume",
  "Real Estate Listing",
  "Fitness / Gym",
  "Travel Agency",
  "Non-Profit",
];

const SidebarTools: React.FC<SidebarToolsProps> = ({ setPrompt }) => {
  const [activeTab, setActiveTab] = useState<'tips' | 'spark'>('tips');
  
  // Combobox State
  const [searchValue, setSearchValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState('');

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); // Added for mobile
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleEnhance = async () => {
    if (!searchValue.trim()) return;

    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(searchValue);
      setGeneratedIdea(enhanced);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyPrompt = () => {
    setPrompt(generatedIdea);
  };

  const filteredGenres = GENRES.filter(genre => 
    genre.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
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

      {/* Content Container */}
      <div className="flex-1 relative min-h-0">
        {activeTab === 'tips' ? (
          <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar space-y-4">
             {/* New Tip first */}
             <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 p-4 rounded-lg border border-fuchsia-100 dark:border-fuchsia-800/50">
               <h4 className="font-semibold text-fuchsia-900 dark:text-fuchsia-300 mb-2 text-sm flex items-center gap-2">
                 <Sparkles className="w-3.5 h-3.5" />
                 Better Prompts
               </h4>
               <p className="text-sm text-fuchsia-800/80 dark:text-fuchsia-200/70 leading-relaxed">
                 Use the <strong>Idea Spark</strong> tab to turn a simple choice like "Cafe" into a full, professional design brief instantly.
               </p>
            </div>

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
                 You can edit the code directly in the 'Code' tab to tweak details, or click on the <Pencil className="w-3.5 h-3.5 inline mx-0.5" /> button to edit the design directly.
               </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col p-3 lg:p-4 gap-3 lg:gap-4">
            <div className="space-y-3 shrink-0" ref={dropdownRef}>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Choose or Type a Topic
              </label>
              
              <div className="relative">
                <div className="relative group">
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e.target.value);
                        if (!isDropdownOpen) setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="e.g. Cafe, Gym, Space Station..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <button 
                      onClick={(e) => {
                         e.preventDefault(); 
                         // Toggle dropdown without focusing input (prevents keyboard)
                         setIsDropdownOpen(prev => !prev);
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      type="button"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                      {filteredGenres.length > 0 ? (
                        filteredGenres.map(genre => (
                          <button
                            key={genre}
                            onClick={() => {
                              setSearchValue(genre);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                          >
                            <span>{genre}</span>
                            {searchValue.toLowerCase() === genre.toLowerCase() && <Zap className="w-3 h-3 text-fuchsia-500" />}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 italic">
                           Create custom: "{searchValue}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleEnhance}
                disabled={isEnhancing || !searchValue.trim()}
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-3 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 font-medium text-sm"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sparking Idea...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Idea</span>
                  </>
                )}
              </button>
            </div>

            {generatedIdea ? (
              <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-0 shadow-inner">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Generated Prompt</span>
                </div>
                <div className="flex-1 overflow-y-auto mb-3 pr-1 custom-scrollbar">
                   <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                     {generatedIdea}
                   </p>
                </div>
                <button
                  onClick={applyPrompt}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white py-2.5 rounded-md text-sm font-medium transition-all shadow-md hover:shadow-lg shrink-0 transform active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  Use this prompt
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Type a topic or select a genre to generate a professional brief.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarTools;

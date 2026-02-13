import React from 'react';
import { X, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { WebsiteHistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: WebsiteHistoryItem[];
  onSelect: (item: WebsiteHistoryItem) => void;
  onClear: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect,
  onClear
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            History
          </h2>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
               <button 
                onClick={onClear}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                title="Clear History"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No history yet. <br/> Start building!
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose(); // Auto close on mobile
                }}
                className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
                <div className="mt-2 flex items-center gap-2">
                   <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700">
                     {item.model.includes('flash') ? 'Flash' : 'Pro'}
                   </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
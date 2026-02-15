
import React from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { APP_NAME } from '../constants';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-3">
        {/* Custom Visinaro Logo */}
        <div className="relative w-8 h-8 flex items-center justify-center filter drop-shadow-sm">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Left Vertical - Orange */}
                <path d="M8 6V26" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
                {/* Right Vertical - Emerald/Green */}
                <path d="M24 6V26" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
                {/* Diagonal - Red (Bottom-Left to Top-Right) */}
                <path d="M8 26L24 6" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            </svg>
        </div>
        
        <h1 className="text-xl font-bold tracking-widest text-slate-900 dark:text-white uppercase font-sans">
          {APP_NAME}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Powered by Gemini 3.0</span>
        </div>

        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;

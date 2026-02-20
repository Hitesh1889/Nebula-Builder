
import React from 'react';
import { Sparkles, Key } from 'lucide-react';
import { APP_NAME } from '../constants';
import { clearApiKey } from '../services/aiService';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onGoHome: () => void;
  onChangeKey?: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onGoHome, onChangeKey }) => {
  const handleChangeKey = () => {
    clearApiKey();
    if (onChangeKey) onChangeKey();
    else window.location.reload();
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-transparent sticky top-0 z-50 pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto cursor-pointer group" onClick={onGoHome}>
        <div className="relative w-8 h-8 flex items-center justify-center filter drop-shadow-md group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M8 6V26" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
                <path d="M24 6V26" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
                <path d="M8 26L24 6" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            </svg>
        </div>
        <h1 className="text-xl font-bold tracking-widest text-white uppercase font-sans drop-shadow-sm group-hover:text-slate-200 transition-colors">
          {APP_NAME}
        </h1>
      </div>
      
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-slate-300">Powered by Gemini</span>
        </div>
        <button
          onClick={handleChangeKey}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
          title="Change API Key"
        >
          <Key className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;

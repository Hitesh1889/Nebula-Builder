
import React from 'react';
import { Sparkles } from 'lucide-react';
import { APP_NAME } from '../constants';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onGoHome }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-transparent sticky top-0 z-50 pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto cursor-pointer group" onClick={onGoHome}>
        {/* Custom Visinaro Logo */}
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
      
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-slate-300">Gemini 3.0</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

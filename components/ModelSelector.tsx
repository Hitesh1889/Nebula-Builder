
import React, { useState } from 'react';
import { Zap, ChevronDown } from 'lucide-react';
import { AVAILABLE_MODELS } from '../constants';

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const current = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white transition-all"
        title="Select AI model speed"
      >
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        {current.name}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold px-2 py-1">Speed vs Quality</p>
            {AVAILABLE_MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => { onSelect(model.id); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  selectedModel === model.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="font-semibold text-xs">{model.name}</div>
                <div className="text-xs opacity-60 mt-0.5">{model.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;

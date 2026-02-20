
import React, { useState } from 'react';
import { Key, ExternalLink, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { saveApiKey } from '../services/geminiService';

interface ApiKeySetupProps {
  onKeySet: () => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeySet }) => {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const isValidFormat = key.trim().length > 20 && key.trim().startsWith('AI');

  const handleSave = async () => {
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please enter your API key.');
      return;
    }
    if (!trimmed.startsWith('AI')) {
      setError('Gemini API keys start with "AI". Please check your key.');
      return;
    }

    setIsValidating(true);
    setError('');

    // Quick validation test
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: trimmed });
      await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        contents: 'Hi',
        config: { maxOutputTokens: 5 }
      });
      saveApiKey(trimmed);
      onKeySet();
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('403') || msg.includes('401') || msg.includes('key')) {
        setError('Invalid API key. Please double-check and try again.');
      } else {
        // Network error or other — still save it, might work
        saveApiKey(trimmed);
        onKeySet();
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
              <path d="M8 6V26" stroke="#F97316" strokeWidth="5" strokeLinecap="round"/>
              <path d="M24 6V26" stroke="#10B981" strokeWidth="5" strokeLinecap="round"/>
              <path d="M8 26L24 6" stroke="#EF4444" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <span className="text-3xl font-bold text-white tracking-tight">Visinaro</span>
          </div>
          <h1 className="text-xl text-slate-300 font-medium">One-time setup required</h1>
          <p className="text-slate-500 text-sm mt-1">Your free Gemini API key is needed to generate websites</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Key className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Enter your Gemini API Key</p>
              <p className="text-slate-500 text-xs">Stored locally in your browser only</p>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-5 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">How to get a free key</p>
            {[
              { step: '1', text: 'Go to Google AI Studio' },
              { step: '2', text: 'Sign in with your Google account' },
              { step: '3', text: 'Click "Get API Key" → "Create API Key"' },
              { step: '4', text: 'Copy and paste it below' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 text-xs flex items-center justify-center font-bold shrink-0">{step}</span>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Google AI Studio →
            </a>
          </div>

          {/* Key input */}
          <div className="relative mb-4">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="AIza..."
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none pr-10 font-mono"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Validation indicator */}
          {key.length > 5 && (
            <div className={`flex items-center gap-2 mb-4 text-xs ${isValidFormat ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isValidFormat
                ? <><CheckCircle className="w-3.5 h-3.5" /> Looks like a valid Gemini key</>
                : <><AlertCircle className="w-3.5 h-3.5" /> Gemini keys usually start with "AI"</>
              }
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 mb-4 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!key.trim() || isValidating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isValidating ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Validating key...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Start Building for Free</>
            )}
          </button>

          <p className="text-center text-slate-600 text-xs mt-4">
            🔒 Your key is stored only in your browser. Never sent to any server.
          </p>
        </div>

        {/* Free tier info */}
        <div className="mt-4 text-center">
          <p className="text-slate-600 text-xs">
            Gemini API free tier includes generous limits for personal use.{' '}
            <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-400">
              View pricing →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;

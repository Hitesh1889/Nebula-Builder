
import React, { useState } from 'react';
import { ExternalLink, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, Zap, RefreshCw } from 'lucide-react';
import { saveGroqKey, saveOpenRouterKey } from '../services/aiService';

interface ApiKeySetupProps {
  onKeySet: () => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeySet }) => {
  const [groqKey, setGroqKey] = useState('');
  const [orKey,   setOrKey]   = useState('');
  const [showGroq, setShowGroq] = useState(false);
  const [showOr,   setShowOr]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const validateGroqKey = async (key: string): Promise<boolean> => {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 }),
      });
      return res.ok || res.status === 422;
    } catch { return true; }
  };

  const handleSave = async () => {
    const gk = groqKey.trim();
    const ok = orKey.trim();
    if (!gk && !ok) { setError('Please enter at least one API key.'); return; }
    if (gk && !gk.startsWith('gsk_')) { setError('Groq keys start with "gsk_". Please check your key.'); return; }
    if (ok && ok.length < 20) { setError('OpenRouter key looks too short. Please check it.'); return; }

    setLoading(true); setError('');
    try {
      if (gk) {
        const valid = await validateGroqKey(gk);
        if (!valid) { setError('Groq API key is invalid. Please check and try again.'); setLoading(false); return; }
        saveGroqKey(gk);
      }
      if (ok) saveOpenRouterKey(ok);
      onKeySet();
    } catch {
      if (gk) saveGroqKey(gk);
      if (ok) saveOpenRouterKey(ok);
      onKeySet();
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-purple-700/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-indigo-700/15 rounded-full blur-[120px]"></div>
      </div>
      <div className="relative z-10 w-full max-w-lg py-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
              <path d="M8 6V26"  stroke="#F97316" strokeWidth="5" strokeLinecap="round"/>
              <path d="M24 6V26" stroke="#10B981" strokeWidth="5" strokeLinecap="round"/>
              <path d="M8 26L24 6" stroke="#EF4444" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <span className="text-3xl font-bold text-white tracking-tight">Visinaro</span>
          </div>
          <p className="text-slate-400 text-sm">Connect free AI keys to start building websites in seconds</p>
        </div>

        {/* Speed banner */}
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-5">
          <Zap className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-emerald-300 font-bold text-sm">Up to 10× faster than Gemini</p>
            <p className="text-emerald-700 text-xs">Groq runs at 300+ tokens/sec — full websites generated in 3–5 seconds</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-white/8 rounded-2xl p-6 shadow-2xl space-y-5">

          {/* Groq */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-white font-bold text-sm">⚡ Groq API Key</span>
                <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-semibold">PRIMARY</span>
                <p className="text-slate-500 text-xs mt-0.5">Llama 3.3 70B · 14,400 req/day free · 300+ tok/sec</p>
              </div>
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 whitespace-nowrap">
                Get key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input type={showGroq ? 'text' : 'password'} value={groqKey}
                onChange={e => { setGroqKey(e.target.value); setError(''); }}
                placeholder="gsk_..."
                className="w-full bg-slate-800 border border-white/8 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none pr-10"
                onKeyDown={e => e.key === 'Enter' && handleSave()} />
              <button onClick={() => setShowGroq(!showGroq)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showGroq ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
            {groqKey.length > 5 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${groqKey.startsWith('gsk_') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {groqKey.startsWith('gsk_') ? <><CheckCircle className="w-3 h-3"/>Valid format</> : <><AlertCircle className="w-3 h-3"/>Should start with "gsk_"</>}
              </p>
            )}
            <details className="mt-2">
              <summary className="text-xs text-slate-600 hover:text-slate-400 cursor-pointer">How to get free Groq key ›</summary>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5 pl-2 border-l border-slate-800">
                <p>1. Visit <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">console.groq.com/keys</a></p>
                <p>2. Sign up free (no credit card)</p>
                <p>3. Click "Create API Key" → copy it</p>
              </div>
            </details>
          </div>

          <div className="border-t border-white/5"></div>

          {/* OpenRouter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-white font-bold text-sm">🔀 OpenRouter API Key</span>
                <span className="ml-2 px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full font-semibold">BACKUP · optional</span>
                <p className="text-slate-500 text-xs mt-0.5">DeepSeek V3, Llama, Mistral + 3 more · auto-used when Groq hits limits</p>
              </div>
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 whitespace-nowrap">
                Get key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input type={showOr ? 'text' : 'password'} value={orKey}
                onChange={e => { setOrKey(e.target.value); setError(''); }}
                placeholder="sk-or-v1-..."
                className="w-full bg-slate-800 border border-white/8 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none pr-10"
                onKeyDown={e => e.key === 'Enter' && handleSave()} />
              <button onClick={() => setShowOr(!showOr)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showOr ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
            {orKey.length > 5 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${orKey.startsWith('sk-or') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {orKey.startsWith('sk-or') ? <><CheckCircle className="w-3 h-3"/>Valid format</> : <><AlertCircle className="w-3 h-3"/>Should start with "sk-or"</>}
              </p>
            )}
            <details className="mt-2">
              <summary className="text-xs text-slate-600 hover:text-slate-400 cursor-pointer">How to get free OpenRouter key ›</summary>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5 pl-2 border-l border-slate-800">
                <p>1. Visit <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">openrouter.ai/keys</a></p>
                <p>2. Sign up free (no credit card)</p>
                <p>3. Click "Create Key" → copy it</p>
              </div>
            </details>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0"/>{error}
            </div>
          )}

          {/* CTA */}
          <button onClick={handleSave} disabled={(!groqKey.trim() && !orKey.trim()) || loading}
            className="w-full py-3 bg-white text-slate-900 hover:bg-indigo-50 disabled:bg-slate-800 disabled:text-slate-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg disabled:cursor-not-allowed">
            {loading
              ? <><RefreshCw className="w-4 h-4 animate-spin"/>Validating...</>
              : <><Sparkles className="w-4 h-4"/>Start Building for Free</>}
          </button>
        </div>

        {/* Comparison table */}
        <div className="mt-5 bg-slate-900/60 border border-white/5 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Why these providers?</p>
          <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
            <div></div>
            <div className="text-center font-bold text-white">⚡ Groq</div>
            <div className="text-center font-bold text-slate-400">🔀 OpenRouter</div>
            {[
              ['Generation', '3–5 sec', '10–20 sec'],
              ['Daily limit', '14,400 req', '200 × 6 models'],
              ['Top model', 'Llama 3.3 70B', 'DeepSeek V3'],
              ['Credit card', '❌ Never', '❌ Never'],
            ].map(([label, g, o]) => (
              <React.Fragment key={label}>
                <div className="text-slate-500">{label}</div>
                <div className="text-center text-emerald-400 font-medium">{g}</div>
                <div className="text-center text-slate-400">{o}</div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-700 text-xs mt-4">🔒 Keys stored only in your browser — never sent to any server except the AI providers directly.</p>
      </div>
    </div>
  );
};

export default ApiKeySetup;

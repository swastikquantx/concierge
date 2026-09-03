import { useState } from 'react';
import { Play, Terminal, Wand2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export function CommandCenter() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [pipeline, setPipeline] = useState<any>(null);
  const { getToken } = useAuth();

  const handleExecute = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setPipeline(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-12 text-center mt-12">
        <h1 className="text-4xl font-light tracking-tight mb-4">
          What do you want to create?
        </h1>
        <p className="text-gray-400">
          Describe a workflow, an app, or an ad campaign. Concierge AI handles the rest.
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D91E18]/20 to-purple-500/20 blur-xl opacity-50 rounded-3xl" />
        <div className="relative bg-[#111111] border border-[#222222] rounded-2xl p-2 flex flex-col gap-2">
          <textarea
            className="w-full bg-black border border-[#333] rounded-xl resize-none p-4 outline-none text-lg min-h-[120px] placeholder:text-gray-600 focus-within:border-[#D91E18] transition-colors"
            placeholder="e.g. Create a 9:16 Hindi product ad, generate a cinematic video, add lip-sync and music..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex items-center justify-between px-2 pb-2 mt-2">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 text-xs font-medium bg-[#1A1A1A] hover:bg-[#222] px-3 py-1.5 rounded-lg text-gray-400 transition-colors">
                <Wand2 className="w-3 h-3 text-[#D91E18]" />
                Auto-Enhance
              </button>
            </div>
            <button
              onClick={handleExecute}
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 bg-[#D91E18] hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 px-8 py-3 rounded-xl text-white font-bold text-sm tracking-tight transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Terminal className="w-4 h-4" />
              )}
              ORCHESTRATE
            </button>
          </div>
        </div>
      </div>

      {pipeline && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
          <h2 className="text-xl font-medium mb-4">Generated Pipeline</h2>
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
            <div className="flex flex-col gap-4">
              {pipeline.steps.map((step: any, index: number) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1 bg-black border border-[#333] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">{step.type}</h3>
                      <span className="text-[10px] font-bold px-2 py-1 bg-[#1A1A1A] rounded text-gray-400 uppercase">
                        {step.provider}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{step.reason}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-[#222222] flex justify-end">
                <button className="flex items-center gap-2 bg-[#1A1A1A] border border-[#333] text-[#E0E0E0] hover:bg-[#222] px-6 py-2 rounded-lg font-medium transition-colors">
                  <Play className="w-4 h-4" />
                  Run Pipeline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { BarChart3, Edit3, Target, MousePointerClick, RefreshCw, Copy, Check } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export function AdStudio() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { getToken } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/ad/copy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.variants) {
        setVariants(data.variants);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light mb-2">Ad Studio</h1>
          <p className="text-gray-400">Generate creative variants, resize campaigns, and analyze performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-[#1A1A1A] hover:bg-[#222] border border-[#333] px-4 py-2 rounded-lg text-[#E0E0E0] font-medium transition-colors">
            Connect Meta Ads
          </button>
          <button className="bg-[#1A1A1A] hover:bg-[#222] border border-[#333] px-4 py-2 rounded-lg text-[#E0E0E0] font-medium transition-colors">
            Connect Google Ads
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Dashboard Cards */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="font-medium">Active Campaigns</h3>
          </div>
          <p className="text-3xl font-light">3</p>
          <p className="text-sm text-gray-500 mt-2">Running across Meta & Google</p>
        </div>
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <MousePointerClick className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium">Total CTR</h3>
          </div>
          <p className="text-3xl font-light">2.4%</p>
          <p className="text-sm text-emerald-500 mt-2">+0.4% from last week</p>
        </div>
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium">ROAS</h3>
          </div>
          <p className="text-3xl font-light">3.2x</p>
          <p className="text-sm text-gray-500 mt-2">Steady performance</p>
        </div>
      </div>

      {/* Ad Creative Workspace */}
      <h2 className="text-xl font-medium mb-4">Creative Generation</h2>
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Product URL / Description</label>
            <input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-black border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-[#D91E18] transition-colors text-white" 
              placeholder="e.g. Red running shoes for winter" 
            />
          </div>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="flex-1 bg-[#D91E18] hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 text-white font-bold tracking-tight py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
              {loading ? 'GENERATING...' : 'GENERATE AD COPY (3 VARIANTS)'}
            </button>
          </div>
        </div>
        <div className="w-px bg-[#333] hidden lg:block" />
        <div className="flex-1 flex flex-col justify-center text-left p-4 rounded-xl text-gray-400 min-h-[200px]">
          {variants.length > 0 ? (
            <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
              {variants.map((v, i) => (
                <div key={i} className="bg-black border border-[#333] p-4 rounded-xl relative group">
                  <p className="text-sm text-[#E0E0E0] pr-8">{v}</p>
                  <button 
                    onClick={() => handleCopy(v, i)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-[#D91E18] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {copiedIndex === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center flex flex-col items-center border border-dashed border-[#333] rounded-xl p-8 h-full justify-center">
              <div className="w-12 h-12 bg-[#1A1A1A] border border-[#333] rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <p>Generated variants and optimization suggestions will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

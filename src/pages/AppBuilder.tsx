import { useState } from 'react';
import { Terminal, Box, Code2, CheckCircle2, Play, GitBranch } from 'lucide-react';
import { cn } from '../components/AppLayout';
import { useAuth } from '../lib/AuthContext';

export function AppBuilder() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'planning' | 'building' | 'done'>('idle');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const { getToken } = useAuth();

  const handleBuild = async () => {
    if (!prompt) return;
    setStatus('planning');
    setGeneratedCode('');
    
    try {
      // Simulate planning delay for UI feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('building');
      
      const token = await getToken();
      
      const res = await fetch('/api/app/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      if (data.code) {
        setGeneratedCode(data.code);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatus('done');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex gap-8 h-full">
      <div className="w-1/3 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-light mb-2">App Builder</h1>
          <p className="text-sm text-gray-400">Emergent-style workspace to generate full web applications.</p>
        </div>

        <div className="flex flex-col gap-4">
          <textarea
            className="w-full bg-[#111111] border border-[#222222] rounded-xl p-4 text-sm min-h-[160px] resize-none outline-none focus:border-[#D91E18] transition-colors placeholder:text-gray-600"
            placeholder="Build a CRM for a small logistics company with login, leads, pipeline and reports..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleBuild}
            disabled={status !== 'idle' && status !== 'done' || !prompt.trim()}
            className="w-full bg-[#D91E18] hover:brightness-110 text-white font-bold text-sm tracking-tight py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:brightness-100"
          >
            <Box className="w-4 h-4" />
            {status === 'planning' || status === 'building' ? 'GENERATING APPLICATION...' : 'GENERATE APPLICATION'}
          </button>
        </div>

        {status !== 'idle' && (
          <div className="bg-[#111111] border border-[#222222] p-5 rounded-2xl flex flex-col gap-4">
            <h3 className="font-bold text-xs text-gray-500 uppercase tracking-widest">Workflow Progress</h3>
            <div className="flex items-center gap-3">
              {status === 'planning' ? <div className="w-4 h-4 rounded-full border-2 border-[#D91E18] border-t-transparent animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              <span className={cn("text-sm", status === 'planning' ? "text-[#E0E0E0] font-medium" : "text-gray-400")}>Product Analyst: Planning Routes</span>
            </div>
            <div className="flex items-center gap-3">
              {status === 'idle' || status === 'planning' ? <div className="w-4 h-4 rounded-full border-2 border-[#333]" /> : status === 'building' ? <div className="w-4 h-4 rounded-full border-2 border-[#D91E18] border-t-transparent animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              <span className={cn("text-sm", status === 'building' ? "text-[#E0E0E0] font-medium" : "text-gray-400")}>Architect: Generating Code</span>
            </div>
            <div className="flex items-center gap-3">
              {status !== 'done' ? <div className="w-4 h-4 rounded-full border-2 border-[#333]" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              <span className={cn("text-sm", status === 'done' ? "text-emerald-400 font-medium" : "text-gray-400")}>Sandbox: Application Deployed</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-[#1e1e1e] border border-[#333] rounded-2xl overflow-hidden flex flex-col">
        {/* Editor Header */}
        <div className="h-12 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-4 gap-4">
          <div className="flex gap-2 text-[#cccccc] text-xs">
            <span className="flex items-center gap-1 bg-[#1e1e1e] px-3 py-1 rounded-sm"><Code2 className="w-3 h-3 text-[#4fc1ff]" /> App.tsx</span>
            <span className="flex items-center gap-1 opacity-50 px-3 py-1"><Terminal className="w-3 h-3" /> Terminal</span>
          </div>
          <div className="flex-1" />
          {status === 'done' && (
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors">
              <Play className="w-3 h-3" />
              Preview App
            </button>
          )}
        </div>
        
        {/* Editor Content Area */}
        <div className="flex-1 p-6 font-mono text-sm text-[#d4d4d4] overflow-y-auto whitespace-pre-wrap">
          {status === 'idle' ? (
             <div className="h-full flex items-center justify-center opacity-30">
               <GitBranch className="w-16 h-16" />
             </div>
          ) : (
            <div className="leading-relaxed font-mono">
              {generatedCode || '// Generating structure...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

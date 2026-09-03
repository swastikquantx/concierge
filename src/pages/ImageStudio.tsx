import { useState } from 'react';
import { ImageIcon, Download, RefreshCw } from 'lucide-react';
import { cn } from '../components/AppLayout';
import { useAuth } from '../lib/AuthContext';

export function ImageStudio() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('imagen');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setErrorMsg(null);
    setImageUrl(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt, model, aspectRatio }),
      });
      const data = await res.json();
      
      if (data.image) {
        setImageUrl(data.image);
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex gap-8 h-[calc(100vh-64px)]">
      {/* Left panel - Controls */}
      <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 pb-8">
        <div>
          <h1 className="text-3xl font-light mb-2">Image Studio</h1>
          <p className="text-sm text-gray-400">Generate high-fidelity assets for campaigns and apps.</p>
        </div>

        <div className="flex flex-col gap-4 bg-[#111111] border border-[#222222] p-5 rounded-2xl">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Prompt</label>
            <textarea
              className="bg-black border border-[#333] rounded-xl p-3 text-sm min-h-[120px] resize-none focus:border-[#D91E18] outline-none transition-colors text-white placeholder:text-gray-600"
              placeholder="A photorealistic cinematic portrait of a neon punk rocker..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Model Engine</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModel('imagen')}
                className={cn("py-2 px-3 text-sm rounded-lg border text-left transition-colors", model === 'imagen' ? "bg-[#1A1A1A] border-[#D91E18]" : "border-[#333] hover:border-[#D91E18] text-gray-400")}
              >
                <div className="font-medium text-[#E0E0E0]">Google Imagen</div>
                <div className="text-xs">Imagen 3.0</div>
              </button>
              <button
                onClick={() => setModel('midjourney')}
                className={cn("py-2 px-3 text-sm rounded-lg border text-left transition-colors", model === 'midjourney' ? "bg-[#1A1A1A] border-[#D91E18]" : "border-[#333] hover:border-[#D91E18] text-gray-400")}
              >
                <div className="font-medium text-[#E0E0E0]">Midjourney</div>
                <div className="text-xs">v6.0 Alpha</div>
              </button>
              <button
                onClick={() => setModel('dalle3')}
                className={cn("py-2 px-3 text-sm rounded-lg border text-left transition-colors", model === 'dalle3' ? "bg-[#1A1A1A] border-[#D91E18]" : "border-[#333] hover:border-[#D91E18] text-gray-400")}
              >
                <div className="font-medium text-[#E0E0E0]">DALL-E 3</div>
                <div className="text-xs">OpenAI</div>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Aspect Ratio</label>
            <div className="flex gap-2">
              {['1:1', '16:9', '9:16'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={cn("px-4 py-2 rounded-lg text-sm border font-medium transition-colors", aspectRatio === ratio ? "bg-[#1A1A1A] border-[#D91E18] text-white" : "border-[#333] text-gray-400 hover:text-[#E0E0E0] hover:border-[#D91E18]")}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full mt-2 bg-[#D91E18] hover:brightness-110 text-white font-bold tracking-tight text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:brightness-100"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {loading ? 'GENERATING IMAGE...' : 'GENERATE IMAGE'}
          </button>
          
          {errorMsg && (
            <div className="mt-2 p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-xs text-red-200">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Output / Gallery */}
      <div className="flex-1 bg-[#111111] border border-[#222222] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden h-full">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-gray-400 p-8 text-center">
            <div className="w-8 h-8 border-4 border-[#333] border-t-[#D91E18] rounded-full animate-spin" />
            <p>Rendering pixels...</p>
          </div>
        ) : imageUrl ? (
          <div className="w-full h-full bg-black flex flex-col relative group">
            <img 
              src={imageUrl} 
              alt={prompt}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={imageUrl} 
                download="imagen-generation.jpg"
                className="bg-black/50 hover:bg-black/80 backdrop-blur text-white p-2 rounded-lg transition-colors border border-white/10"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#333] flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm">Your generated image will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

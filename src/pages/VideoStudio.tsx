import { useState, useRef } from 'react';
import { Film, Video, Download } from 'lucide-react';
import { cn } from '../components/AppLayout';
import { useAuth } from '../lib/AuthContext';

export function VideoStudio() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('veo');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const { getToken } = useAuth();
  
  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setVideoUrl(null);
    setStatusMessage('Starting video generation...');
    try {
      const token = await getToken();
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt, model, aspectRatio }),
      });
      const data = await res.json();
      
      if (data.operationName) {
        pollStatus(data.operationName);
      } else {
        throw new Error(data.error || 'Failed to start job');
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      setStatusMessage('Error starting generation');
    }
  };

  const pollStatus = (operationName: string) => {
    setStatusMessage('Generating video (this may take a few minutes)...');
    
    const checkStatus = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/video/status', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ operationName }),
        });
        const data = await res.json();
        
        if (data.done) {
          if (pollInterval.current) clearInterval(pollInterval.current);
          setStatusMessage('Downloading video...');
          downloadVideo(operationName);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    };

    pollInterval.current = setInterval(checkStatus, 5000);
  };

  const downloadVideo = async (operationName: string) => {
    try {
      const token = await getToken();
      const res = await fetch('/api/video/download', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ operationName }),
      });
      
      if (!res.ok) throw new Error('Failed to download');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (e) {
      console.error(e);
      setStatusMessage('Error downloading video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex gap-8">
      {/* Left panel - Controls */}
      <div className="w-1/3 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-light mb-2">Video Studio</h1>
          <p className="text-sm text-gray-400">Generate cinematic AI video using state-of-the-art models.</p>
        </div>

        <div className="flex flex-col gap-4 bg-[#111111] border border-[#222222] p-5 rounded-2xl">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Prompt</label>
            <textarea
              className="bg-black border border-[#333] rounded-xl p-3 text-sm min-h-[120px] resize-none focus:border-[#D91E18] outline-none transition-colors"
              placeholder="A sweeping aerial shot over a neon-lit cyberpunk city..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Model Engine</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModel('veo')}
                className={cn("py-2 px-3 text-sm rounded-lg border text-left transition-colors", model === 'veo' ? "bg-[#1A1A1A] border-[#D91E18]" : "border-[#333] hover:border-[#D91E18] text-gray-400")}
              >
                <div className="font-medium text-[#E0E0E0]">Google Veo</div>
                <div className="text-xs">veo-3.1-generate-preview</div>
              </button>
              <button
                onClick={() => setModel('runway')}
                className={cn("py-2 px-3 text-sm rounded-lg border text-left transition-colors", model === 'runway' ? "bg-[#1A1A1A] border-[#D91E18]" : "border-[#333] hover:border-[#D91E18] text-gray-400")}
              >
                <div className="font-medium text-[#E0E0E0]">Runway</div>
                <div className="text-xs">Gen-3 Alpha</div>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Aspect Ratio</label>
            <div className="flex gap-2">
              {['16:9', '9:16', '1:1'].map((ratio) => (
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
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Film className="w-4 h-4" />}
            GENERATE VIDEO
          </button>
        </div>
      </div>

      {/* Right panel - Output / Gallery */}
      <div className="flex-1 bg-[#111111] border border-[#222222] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-gray-400 p-8 text-center">
            <div className="w-8 h-8 border-4 border-[#333] border-t-[#D91E18] rounded-full animate-spin" />
            <p>{statusMessage}</p>
          </div>
        ) : videoUrl ? (
          <div className="w-full h-full bg-black flex flex-col">
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop 
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <a 
                href={videoUrl} 
                download="veo-generation.mp4"
                className="bg-black/50 hover:bg-black/80 backdrop-blur text-white p-2 rounded-lg transition-colors border border-white/10"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#333] flex items-center justify-center">
              <Video className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm">Your generated video will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { Key, Save, Server, Shield, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

type ProviderConfig = {
  id: string;
  name: string;
  description: string;
  status: string;
};

export function Settings() {
  const [activeTab, setActiveTab] = useState<'integrations' | 'general'>('integrations');
  const [providers, setProviders] = useState<ProviderConfig[]>([]);

  useEffect(() => {
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => {
        const pArr = Object.entries(data).map(([id, conf]: [string, any]) => ({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          description: conf.description,
          status: conf.status
        }));
        setProviders(pArr);
      })
      .catch(e => console.error("Failed to load providers:", e));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto flex gap-8">
      
      {/* Sidebar Nav */}
      <div className="w-64 shrink-0 flex flex-col gap-1">
        <h2 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Settings</h2>
        <button 
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === 'integrations' ? 'bg-[#1A1A1A] text-[#E0E0E0]' : 'text-gray-400 hover:text-[#E0E0E0] hover:bg-[#111111]'}`}
        >
          <Server className="w-4 h-4" /> Provider Integrations
        </button>
        <button 
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === 'general' ? 'bg-[#1A1A1A] text-[#E0E0E0]' : 'text-gray-400 hover:text-[#E0E0E0] hover:bg-[#111111]'}`}
        >
          <Shield className="w-4 h-4" /> General Security
        </button>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-light mb-1">
            {activeTab === 'integrations' ? 'Provider Integrations' : 'General Settings'}
          </h1>
          <p className="text-sm text-gray-400">
            {activeTab === 'integrations' ? 'Configure API keys for external models and workers. Keys are stored server-side.' : 'Manage workspace settings and permissions.'}
          </p>
        </div>

        {activeTab === 'integrations' && (
          <div className="flex flex-col gap-4">
            {providers.map(provider => (
              <div key={provider.id} className="bg-[#111111] border border-[#222222] rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] border border-[#333] flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{provider.name}</h3>
                      <p className="text-sm text-gray-500">{provider.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${provider.status === 'Configured' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#1A1A1A] text-gray-400'}`}>
                    {provider.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="password" 
                      placeholder={provider.status === 'Configured' ? `••••••••••••••••` : `${provider.name} API Key`}
                      className="w-full bg-black border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#D91E18] transition-colors text-white placeholder:text-gray-600"
                    />
                  </div>
                  <button className="bg-[#1A1A1A] border border-[#333] text-[#E0E0E0] hover:bg-[#222] px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

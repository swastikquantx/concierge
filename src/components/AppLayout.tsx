import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, 
  Video, 
  Image as ImageIcon, 
  Mic, 
  Waves, 
  Music, 
  Scissors, 
  Box, 
  Megaphone, 
  FolderOpen, 
  LayoutTemplate, 
  Plug, 
  CreditCard, 
  Settings
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: 'Command Center', icon: Home, href: '/' },
  { label: 'Video Studio', icon: Video, href: '/video' },
  { label: 'Image Studio', icon: ImageIcon, href: '/images' },
  { label: 'App Builder', icon: Box, href: '/builder' },
  { label: 'Ad Studio', icon: Megaphone, href: '/ads' },
  { label: 'Projects', icon: FolderOpen, href: '/projects' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

import { useAuth } from '../lib/AuthContext';

export function AppLayout() {
  const location = useLocation();
  const { user, signIn, signOut } = useAuth();

  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#E0E0E0] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1F1F1F] bg-[#0A0A0A] flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0 bg-white/5 rounded-lg p-1">
            <img 
              src="/logo.png" 
              alt="Concierge AI Logo" 
              className="w-full h-full object-contain relative z-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                e.currentTarget.parentElement?.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 bg-[#D91E18] rounded flex items-center justify-center text-white font-black z-0">
              C
            </div>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight text-white">CONCIERGE AI</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Swastik AI Labs</div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="text-[10px] text-gray-600 font-bold px-3 py-2 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active 
                    ? "bg-[#D91E1822] text-[#D91E18] font-medium" 
                    : "text-gray-400 hover:bg-[#1A1A1A]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 border-b border-[#1F1F1F]">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300">
                <img src={user.photoURL || ''} alt="User" className="w-6 h-6 rounded-full" />
                <span className="truncate">{user.displayName || user.email}</span>
              </div>
              <button 
                onClick={signOut}
                className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-white hover:bg-[#1A1A1A] rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={signIn}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-[#1A1A1A] hover:text-white transition-colors border border-[#333]"
            >
              <Plug className="w-4 h-4" />
              Sign in with Google
            </button>
          )}
        </div>

        <div className="p-4 border-t border-[#1F1F1F]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500">Engine Status</span>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          </div>
          <div className="text-[11px] text-gray-400">Google Veo 3.1 &bull; Gemini Pro</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

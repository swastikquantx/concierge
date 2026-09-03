import { useEffect, useState } from 'react';
import { Folder, Play, Clock, MoreVertical, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const fetchJobs = async () => {
      try {
        const q = query(
          collection(db, 'jobs'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(data);
      } catch (e) {
        console.error("Failed to fetch jobs:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [user]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light mb-2">Projects & Jobs</h1>
          <p className="text-gray-400">Manage your generated workflows, assets, and applications.</p>
        </div>
        <button className="bg-[#D91E18] hover:brightness-110 px-4 py-2 rounded-lg text-white font-medium transition-all">
          New Project
        </button>
      </div>

      {!user ? (
        <div className="text-center py-20 text-gray-500 bg-[#111] border border-[#222] rounded-2xl">
          Please sign in to view your projects.
        </div>
      ) : loading ? (
        <div className="text-center py-20 text-gray-500">Loading jobs...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#111] border border-[#222] rounded-2xl">
          No projects found. Generate something!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p.id} className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 hover:border-[#D91E18] transition-colors group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-black border border-[#333] flex items-center justify-center">
                  {p.type === 'video_generation' ? <Play className="w-5 h-5 text-blue-400" /> : 
                   p.type === 'image_generation' ? <ImageIcon className="w-5 h-5 text-fuchsia-400" /> :
                   <Folder className="w-5 h-5 text-amber-400" />}
                </div>
                <button className="text-gray-500 hover:text-[#E0E0E0]">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-medium text-lg mb-1 group-hover:text-[#D91E18] transition-colors truncate">
                {p.prompt || p.type}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${p.status === 'completed' ? 'bg-emerald-500' : p.status === 'failed' ? 'bg-[#D91E18]' : 'bg-blue-500'}`} />
                  <span className="capitalize">{p.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// app/student/materials/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { FileText, FileVideo, BookOpen, ExternalLink, Loader2 } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

interface Material {
  id: string;
  title: string;
  type: string;
  cloudinaryUrl: string;
  uploadedAt: string;
}

const TYPE_STYLE: Record<string, string> = {
  pdf:   'bg-red-500/10 text-red-400',
  slide: 'bg-orange-500/10 text-orange-400',
  video: 'bg-blue-500/10 text-blue-400',
};

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BASE}/student/materials`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMaterials(data); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white">Course Materials</h2>
        <p className="text-gray-400">All uploaded resources for your course.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={24} /> Loading materials...
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-16 text-center flex flex-col items-center text-gray-500">
          <BookOpen size={48} className="mb-4 text-gray-700" />
          <p>No materials uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map(mat => (
            <div key={mat.id} className="bg-[#111111] border border-gray-800 p-5 rounded-xl hover:border-blue-500/30 transition-colors flex flex-col justify-between">
              <div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${TYPE_STYLE[mat.type] || 'bg-gray-800 text-gray-400'}`}>
                  {mat.type === 'video' ? <FileVideo size={22} /> : <FileText size={22} />}
                </div>
                <h4 className="text-white font-bold mb-1 line-clamp-2">{mat.title}</h4>
                <p className="text-xs text-gray-500 uppercase mb-4">
                  {mat.type} · {new Date(mat.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={mat.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors w-fit"
              >
                <ExternalLink size={16} /> View / Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// app/admin/cohorts/new/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Layers, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateCohortPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // 1. Create the Cohort[cite: 1, 2]
      const response = await fetch('https://cohort-portal-cmhj.onrender.com/admin/cohorts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const cohort = await response.json();

      if (!response.ok) throw new Error(cohort.error || 'Failed to create cohort');

      // 2. Automatically seed the 5 standard courses for this cohort[cite: 1, 2]
      // (ZK, Rust & Protocol, AI & Automation, UI/UX, Smart Contract, Web Development)
      await fetch(`https://cohort-portal-cmhj.onrender.com/admin/courses/seed/${cohort.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 3. Redirect back to the main admin dashboard
      router.push('/admin');
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <div>
        <h2 className="text-3xl font-bold text-white">Create New Cohort</h2>
        <p className="text-gray-400">Set up a new academic cycle and auto-generate standard courses.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111111] border border-gray-800 p-8 rounded-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Cohort Name</label>
          <div className="relative">
            <Layers className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
              type="text" 
              required
              placeholder="e.g. Cohort III"
              className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="date" 
                required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="date" 
                required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Initialize Cohort & Standard Courses"
          )}
        </button>
      </form>
    </div>
  );
}
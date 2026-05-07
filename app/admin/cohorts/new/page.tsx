// app/admin/cohorts/new/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Layers, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateCohortPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
      
      // 1. Create the Cohort
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

      // 2. Automatically seed the standard courses for this cohort[cite: 1]
      // This is the "Magic" step that creates all 5 courses in one click
      await fetch(`https://cohort-portal-cmhj.onrender.com/admin/courses/seed/${cohort.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setIsSuccess(true);
      
      // Give the user a moment to see the success state before redirecting
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
        <div className="bg-green-500/20 p-4 rounded-full">
          <CheckCircle2 size={64} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Cohort Created!</h2>
        <p className="text-gray-400">Standard courses have been initialized. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <div>
        <h2 className="text-3xl font-bold text-white">Create New Cohort</h2>
        <p className="text-gray-400">Define the cohort dates and auto-generate the 5 standard courses.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111111] border border-gray-800 p-8 rounded-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider text-xs">Cohort Designation</label>
          <div className="relative">
            <Layers className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
              type="text" 
              required
              placeholder="e.g. Cohort III"
              className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none transition-all placeholder:text-gray-700"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider text-xs">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="date" 
                required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none transition-all [color-scheme:dark]"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider text-xs">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="date" 
                required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none transition-all [color-scheme:dark]"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-lg">
  <p className="text-xs text-purple-400/80 leading-relaxed">
    <strong>Note:</strong> Upon creation, the system will automatically initialize the following standard courses: 
    UI/UX, Web Dev, Smart Contracts, Rust & Protocol, and AI/Automation.
  </p>
</div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Initialize Cohort & Seed Courses"
          )}
        </button>
      </form>
    </div>
  );
}
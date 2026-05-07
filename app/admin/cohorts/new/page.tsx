// app/admin/cohorts/new/page.tsx
"use client";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Layers, ArrowLeft, Loader2, CheckCircle2, Plus, X, BookOpen } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_COURSES = ['UI/UX', 'Web Development', 'Smart Contracts', 'Rust & Protocol', 'AI & Automation'];

export default function CreateCohortPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '' });
  const [courses, setCourses] = useState<string[]>(DEFAULT_COURSES);
  const [newCourse, setNewCourse] = useState('');

  const addCourse = () => {
    const trimmed = newCourse.trim();
    if (!trimmed || courses.includes(trimmed)) return;
    setCourses([...courses, trimmed]);
    setNewCourse('');
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (courses.length === 0) return alert('Add at least one course.');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      // 1. Create cohort
      const res = await fetch(`${BASE}/admin/cohorts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });
      const cohort = await res.json();
      if (!res.ok) throw new Error(cohort.error || 'Failed to create cohort');

      // 2. Create each course individually
      await Promise.all(
        courses.map(name =>
          fetch(`${BASE}/admin/courses`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name, cohortId: cohort.id }),
          })
        )
      );

      setIsSuccess(true);
      setTimeout(() => router.push('/admin'), 2000);
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
        <p className="text-gray-400">{courses.length} courses initialized. Redirecting...</p>
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
        <p className="text-gray-400">Set up the cohort and define its courses.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111111] border border-gray-800 p-8 rounded-2xl space-y-6">

        {/* Cohort Name */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Cohort Name</label>
          <div className="relative">
            <Layers className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              required
              placeholder="e.g. Cohort III"
              className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none transition-all placeholder:text-gray-700"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="date"
                required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none transition-all [color-scheme:dark]"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="date"
                required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none transition-all [color-scheme:dark]"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Courses */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={14} /> Courses ({courses.length})
          </label>

          <div className="space-y-2 mb-3">
            {courses.map((course, i) => (
              <div key={i} className="flex items-center justify-between bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-2">
                <span className="text-white text-sm">{course}</span>
                <button
                  type="button"
                  onClick={() => removeCourse(i)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a course name..."
              className="flex-1 bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500 transition-all placeholder:text-gray-700"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCourse(); } }}
            />
            <button
              type="button"
              onClick={addCourse}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || courses.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : `Create Cohort with ${courses.length} Course${courses.length !== 1 ? 's' : ''}`}
        </button>
      </form>
    </div>
  );
}

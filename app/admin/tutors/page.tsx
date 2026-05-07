// app/admin/tutors/page.tsx
"use client";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Loader2, ShieldCheck, Trash2 } from 'lucide-react';

interface Course { id: string; name: string; }
interface Tutor { id: string; name: string; email: string; courseId: string; }

export default function TutorsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', email: '', courseId: '' });

  // 1. We extract the fetch logic into a reusable function
  const loadDatabase = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [courseRes, tutorRes] = await Promise.all([
        fetch(`${BASE}/admin/courses`, { headers }),
        fetch(`${BASE}/admin/admins`, { headers }).catch(() => null)
      ]);

      const courseData = await courseRes.json();
      if (Array.isArray(courseData)) setCourses(courseData);

      if (tutorRes && tutorRes.ok) {
        const tutorData = await tutorRes.json();
        // Bulletproof check: Safely extract array whether backend sends [...] or { admins: [...] }
        const actualTutors = tutorData.admins || tutorData.data || tutorData.users || (Array.isArray(tutorData) ? tutorData : []);
        setTutors(actualTutors);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run on initial load
  useEffect(() => {
    loadDatabase();
  }, [loadDatabase]);

  const handleAddTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE}/admin/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create tutor');
      }

      const responseData = await response.json();
      // Safely extract the new tutor object
      const newTutor = responseData.admin || responseData.user || responseData.data || responseData;

      if (newTutor && newTutor.id) {
        // If we found it, instantly update the UI
        setTutors(prev => [newTutor, ...prev]);
      } else {
        // If the backend sent a weird response, just quietly re-download the database!
        await loadDatabase();
      }
      
      // Reset the form
      setFormData({ name: '', email: '', courseId: '' }); 
      alert("Tutor successfully assigned!");

    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || "Unknown Course";

  const handleDeleteTutor = async (tutorId: string) => {
    if (!confirm('Remove this tutor?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE}/admin/admins/${tutorId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setTutors(tutors.filter(t => t.id !== tutorId));
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white">Course Administrators</h2>
        <p className="text-gray-400">Assign tutors to lead specific academic courses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Tutor Form */}
        <div className="lg:col-span-1 bg-[#111111] border border-gray-800 p-6 rounded-2xl h-fit">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-purple-400" />
            Add New Tutor
          </h3>
          
          <form onSubmit={handleAddTutor} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Full Name</label>
              <input 
                type="text" required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email Address</label>
              <input 
                type="email" required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Assign Course</label>
              <select 
                required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-all"
                value={formData.courseId}
                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              >
                <option value="">Select a Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-2 italic">
              * Password defaults to the tutor's first name (lowercase)
            </p>
          </form>
        </div>

        {/* Tutors List */}
        <div className="lg:col-span-2 bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
           <div className="p-6 border-b border-gray-800 bg-[#1A1A1A]/30">
              <h3 className="font-bold text-white">Active Tutors</h3>
           </div>
           
           {isLoading ? (
             <div className="p-12 flex justify-center text-gray-500">
               <Loader2 className="animate-spin" size={24} />
             </div>
           ) : tutors.length > 0 ? (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-[#0A0A0A] text-gray-500 text-xs uppercase tracking-wider">
                   <tr>
                     <th className="px-6 py-4">Name</th>
                     <th className="px-6 py-4">Email</th>
                     <th className="px-6 py-4">Assigned Course</th>
                     <th className="px-6 py-4"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                   {tutors.map((tutor, i) => (
                     <tr key={tutor.id || i} className="hover:bg-gray-800/30 transition-colors group">
                       <td className="px-6 py-4 text-white font-medium">{tutor.name}</td>
                       <td className="px-6 py-4 text-gray-400 text-sm">{tutor.email}</td>
                       <td className="px-6 py-4 text-purple-400 text-sm font-medium">{getCourseName(tutor.courseId)}</td>
                       <td className="px-6 py-4">
                         <button
                           onClick={() => handleDeleteTutor(tutor.id)}
                           className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                         >
                           <Trash2 size={15} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="p-12 text-center">
                <ShieldCheck size={48} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-500">No tutors have been added yet.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
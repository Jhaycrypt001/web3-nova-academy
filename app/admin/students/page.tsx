// app/admin/students/page.tsx
"use client";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

import { useState, useEffect } from 'react';
import { UserPlus, Users, FileUp, Search, Loader2, X, UploadCloud, AlertCircle, Trash2 } from 'lucide-react';

interface Cohort { id: string; name: string; }
interface Course { id: string; name: string; cohortId: string; }
interface Student { id: string; name: string; email: string; cohortId: string; courseId: string; }

export default function StudentsAdminPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Single Student State
  const [formData, setFormData] = useState({ name: '', email: '', cohortId: '', courseId: '' });

  // --- NEW: Bulk Upload State ---
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkCohortId, setBulkCohortId] = useState('');
  const [bulkCourseId, setBulkCourseId] = useState('');
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      try {
        const [cohortRes, courseRes, studentRes] = await Promise.all([
          fetch(`${BASE}/admin/cohorts`, { headers }),
          fetch(`${BASE}/admin/courses`, { headers }),
          fetch(`${BASE}/admin/students`, { headers }).catch(() => null)
        ]);
        
        const cohortData = await cohortRes.json();
        const courseData = await courseRes.json();
        
        if (Array.isArray(cohortData)) setCohorts(cohortData);
        if (Array.isArray(courseData)) setCourses(courseData);
        
        if (studentRes && studentRes.ok) {
          const studentData = await studentRes.json();
          if (Array.isArray(studentData)) setStudents(studentData);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle Single Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE}/admin/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add student');
      }

      const newStudent = await response.json();
      setStudents([newStudent, ...students]);
      setFormData({ name: '', email: '', cohortId: '', courseId: '' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: Handle Bulk CSV Upload ---
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) return alert("Please select a CSV file.");
    if (!bulkCohortId || !bulkCourseId) return alert("Please select a cohort and course.");

    setIsBulkUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        // Split by lines and remove empty rows
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // Remove header row if it exists (checks if first row contains 'email' or 'name')
        if (lines[0].toLowerCase().includes('email') || lines[0].toLowerCase().includes('name')) {
          lines.shift();
        }

        setBulkProgress({ current: 0, total: lines.length });
        const token = localStorage.getItem('token');
        const newStudentsAdded: Student[] = [];

        // Process rows sequentially to avoid overwhelming the backend
        for (let i = 0; i < lines.length; i++) {
          const columns = lines[i].split(',');
          // Assume CSV format is: Name, Email
          const studentName = columns[0]?.trim();
          const studentEmail = columns[1]?.trim();

          if (!studentName || !studentEmail) continue;

          const response = await fetch(`${BASE}/admin/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
              name: studentName, 
              email: studentEmail, 
              cohortId: bulkCohortId, 
              courseId: bulkCourseId 
            }),
          });

          if (response.ok) {
            const newStudent = await response.json();
            newStudentsAdded.push(newStudent);
          }
          
          setBulkProgress({ current: i + 1, total: lines.length });
        }

        // Update UI with all successful additions
        setStudents([...newStudentsAdded, ...students]);
        alert(`Successfully enrolled ${newStudentsAdded.length} students!`);
        
        // Reset and close
        setIsBulkModalOpen(false);
        setBulkFile(null);
        setBulkCohortId('');
        setBulkCourseId('');

      } catch (error) {
        console.error("Bulk upload error", error);
        alert("An error occurred while processing the CSV file.");
      } finally {
        setIsBulkUploading(false);
      }
    };

    reader.readAsText(bulkFile);
  };

  const filteredCourses = courses.filter(c => c.cohortId === formData.cohortId);
  const bulkFilteredCourses = courses.filter(c => c.cohortId === bulkCohortId);

  const getCohortName = (id: string) => cohorts.find(c => c.id === id)?.name || "Unknown";
  const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || "Unknown";

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Remove this student?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE}/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setStudents(students.filter(s => s.id !== studentId));
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* BULK UPLOAD MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-purple-900/20 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileUp className="text-purple-400" /> Bulk Enrollment
              </h3>
              <button 
                onClick={() => !isBulkUploading && setIsBulkModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-5">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-purple-400 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-purple-300/80 leading-relaxed">
                  Your CSV file must have exactly two columns: <strong>Name</strong> and <strong>Email</strong>. (e.g., John Doe, john@example.com).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Target Cohort</label>
                <select 
                  required disabled={isBulkUploading}
                  className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-all disabled:opacity-50"
                  value={bulkCohortId}
                  onChange={(e) => { setBulkCohortId(e.target.value); setBulkCourseId(''); }}
                >
                  <option value="">Choose Cohort</option>
                  {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Target Course</label>
                <select 
                  required disabled={!bulkCohortId || isBulkUploading}
                  className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-all disabled:opacity-50"
                  value={bulkCourseId}
                  onChange={(e) => setBulkCourseId(e.target.value)}
                >
                  <option value="">Choose Course</option>
                  {bulkFilteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">CSV File</label>
                <input 
                  type="file" accept=".csv" required disabled={isBulkUploading}
                  className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 transition-colors disabled:opacity-50"
                  onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>

              <button 
                type="submit" disabled={isBulkUploading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4"
              >
                {isBulkUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing {bulkProgress.current} / {bulkProgress.total}
                  </>
                ) : (
                  <>
                    <UploadCloud size={18} /> Start Bulk Import
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Student Directory</h2>
          <p className="text-gray-400">Enroll new students and manage the academy database.</p>
        </div>
        <button 
          onClick={() => setIsBulkModalOpen(true)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all border border-gray-700"
        >
          <FileUp size={18} />
          <span>Bulk CSV Upload</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Single Student Form */}
        <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl h-fit">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-purple-400" />
            Enroll Student
          </h3>
          
          <form onSubmit={handleAddStudent} className="space-y-4">
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
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email</label>
              <input 
                type="email" required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Select Cohort</label>
              <select 
                required
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-all"
                value={formData.cohortId}
                onChange={(e) => setFormData({...formData, cohortId: e.target.value, courseId: ''})}
              >
                <option value="">Choose Cohort</option>
                {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Assign Course</label>
              <select 
                required disabled={!formData.cohortId}
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-all disabled:opacity-50"
                value={formData.courseId}
                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              >
                <option value="">Choose Course</option>
                {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Enroll Student"}
            </button>
          </form>
        </div>

        {/* Student List View */}
        <div className="lg:col-span-2 bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-800 bg-[#1A1A1A]/30 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search students by name or email..." 
                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-purple-500 outline-none"
              />
            </div>
          </div>
          
          {isLoading ? (
             <div className="p-12 flex justify-center text-gray-500">
               <Loader2 className="animate-spin" size={24} />
             </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto flex-1 h-[500px] overflow-y-auto">
              <table className="w-full text-left relative">
                <thead className="bg-[#0A0A0A] text-gray-500 text-xs uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Cohort</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {students.map((student, i) => (
                    <tr key={i} className="hover:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-4 text-white font-medium">{student.name}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{student.email}</td>
                      <td className="px-6 py-4 text-blue-400 text-sm">{getCohortName(student.cohortId)}</td>
                      <td className="px-6 py-4 text-purple-400 text-sm">{getCourseName(student.courseId)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
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
            <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
              <Users size={48} className="text-gray-700 mb-4" />
              <p className="text-gray-500">No students have been enrolled yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
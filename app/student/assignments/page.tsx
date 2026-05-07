// app/student/assignments/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { CheckSquare, UploadCloud, Loader2, CheckCircle2, ExternalLink, Clock } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Record<string, string>>({});
  const [activeUpload, setActiveUpload] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BASE}/student/assignments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAssignments(data); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (assignmentId: string) => {
    if (!selectedFile) return;
    setSubmitting(assignmentId);
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', selectedFile);
      const res = await fetch(`${BASE}/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(prev => ({ ...prev, [assignmentId]: data.cloudinaryUrl }));
        setActiveUpload(null);
        setSelectedFile(null);
      } else {
        alert(data.error || 'Submission failed.');
      }
    } catch {
      alert('Network error. Try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const isPastDue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white">Assignments</h2>
        <p className="text-gray-400">Submit your work before the deadline.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={24} />
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-16 text-center flex flex-col items-center text-gray-500">
          <CheckSquare size={48} className="mb-4 text-gray-700" />
          <p>No assignments posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(asgn => {
            const done = !!submitted[asgn.id];
            const overdue = isPastDue(asgn.dueDate);
            const isOpen = activeUpload === asgn.id;

            return (
              <div key={asgn.id} className="bg-[#111111] border border-gray-800 rounded-xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-lg">{asgn.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{asgn.description}</p>
                    <p className={`text-xs mt-2 flex items-center gap-1 font-medium ${overdue && !done ? 'text-red-400' : 'text-gray-500'}`}>
                      <Clock size={12} />
                      Due: {new Date(asgn.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {overdue && !done && ' — OVERDUE'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {done ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                        <CheckCircle2 size={18} /> Submitted
                        <a href={submitted[asgn.id]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setActiveUpload(isOpen ? null : asgn.id); setSelectedFile(null); }}
                        disabled={overdue}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <UploadCloud size={16} /> {isOpen ? 'Cancel' : 'Submit Work'}
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && !done && (
                  <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Select File</label>
                      <input
                        type="file"
                        className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/10 file:text-blue-400 file:text-sm"
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <button
                      disabled={!selectedFile || submitting === asgn.id}
                      onClick={() => handleSubmit(asgn.id)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-bold min-w-[140px] justify-center whitespace-nowrap"
                    >
                      {submitting === asgn.id ? <Loader2 className="animate-spin" size={18} /> : 'Upload & Submit'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

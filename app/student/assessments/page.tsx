// app/student/assessments/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { FileText, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

interface Assessment {
  id: string;
  title: string;
  type: string;
  dueDate: string;
}

export default function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BASE}/student/assessments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAssessments(data); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const isPastDue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white">Assessments</h2>
        <p className="text-gray-400">Tests and exams for your course.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={24} />
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-16 text-center flex flex-col items-center text-gray-500">
          <FileText size={48} className="mb-4 text-gray-700" />
          <p>No assessments available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map(assessment => {
            const overdue = isPastDue(assessment.dueDate);
            return (
              <div
                key={assessment.id}
                className="bg-[#111111] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-500/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{assessment.title}</h4>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md border border-gray-700 uppercase">
                        {assessment.type}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-gray-500'}`}>
                        <Clock size={11} />
                        Due: {new Date(assessment.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {overdue && ' — Closed'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {overdue ? (
                    <span className="text-gray-600 text-sm font-medium">Closed</span>
                  ) : (
                    <Link
                      href={`/student/assessments/${assessment.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors inline-block"
                    >
                      Start →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

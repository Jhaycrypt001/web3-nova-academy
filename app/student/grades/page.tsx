// app/student/grades/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { GraduationCap, Loader2, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

interface AssignmentSubmission {
  id: string;
  cloudinaryUrl: string;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  assignment: { title: string; dueDate: string };
}

interface AssessmentResult {
  id: string;
  submittedAt: string;
  score: number | null;
  assessment: { title: string; type: string };
}

interface Grades {
  assignments: AssignmentSubmission[];
  assessments: AssessmentResult[];
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <Clock size={12} /> Pending
      </span>
    );
  }
  const color = score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`font-bold text-lg ${color}`}>{score}%</span>;
}

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<Grades>({ assignments: [], assessments: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BASE}/student/grades`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.assignments || data.assessments) setGrades(data); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading grades...
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white">My Grades</h2>
        <p className="text-gray-400">Assignment scores and assessment results.</p>
      </div>

      {/* Assignments */}
      <section>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <GraduationCap size={22} className="text-blue-400" /> Assignments
        </h3>
        {grades.assignments.length === 0 ? (
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-10 text-center text-gray-500">
            No assignment submissions yet.
          </div>
        ) : (
          <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1A1A1A] text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Assignment</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Feedback</th>
                  <th className="px-6 py-4">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {grades.assignments.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{sub.assignment.title}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <ScoreBadge score={sub.grade} />
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm max-w-xs">
                      {sub.feedback || <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <a href={sub.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors">
                        <ExternalLink size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Assessments */}
      <section>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 size={22} className="text-purple-400" /> Assessments
        </h3>
        {grades.assessments.length === 0 ? (
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-10 text-center text-gray-500">
            No assessment results yet.
          </div>
        ) : (
          <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1A1A1A] text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Assessment</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {grades.assessments.map(res => (
                  <tr key={res.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{res.assessment.title}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md border border-gray-700 uppercase">
                        {res.assessment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(res.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <ScoreBadge score={res.score} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

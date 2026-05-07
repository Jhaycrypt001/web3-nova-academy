// app/student/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { BookOpen, Clock, CheckSquare, FileText, GraduationCap, Loader2 } from 'lucide-react';
import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function StudentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const [upcomingAssessments, setUpcomingAssessments] = useState(0);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    try {
      const payload = JSON.parse(atob(token!.split('.')[1]));
      setUserName(payload.email?.split('@')[0] || 'Student');
    } catch {}

    const headers = { Authorization: `Bearer ${token}` };
    const now = new Date();

    Promise.all([
      fetch(`${BASE}/student/attendance`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/student/assignments`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/student/assessments`, { headers }).then(r => r.json()).catch(() => []),
    ]).then(([attendance, assignments, assessments]) => {
      if (Array.isArray(attendance)) setAttendanceCount(attendance.length);
      if (Array.isArray(assignments)) setPendingAssignments(assignments.filter((a: any) => new Date(a.dueDate) > now).length);
      if (Array.isArray(assessments)) setUpcomingAssessments(assessments.filter((a: any) => new Date(a.dueDate) > now).length);
    }).finally(() => setIsLoading(false));
  }, []);

  const stats = [
    { label: 'Sessions Attended', value: attendanceCount, icon: Clock, color: 'text-blue-400', href: '/student/attendance' },
    { label: 'Pending Assignments', value: pendingAssignments, icon: CheckSquare, color: 'text-yellow-400', href: '/student/assignments' },
    { label: 'Upcoming Assessments', value: upcomingAssessments, icon: FileText, color: 'text-purple-400', href: '/student/assessments' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white">Welcome back{userName ? `, ${userName}` : ''} 👋</h2>
        <p className="text-gray-400">Here's your academic overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Link href={stat.href} key={i}>
            <div className="bg-[#111111] border border-gray-800 p-6 rounded-xl hover:border-blue-500/30 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-white mt-1">
                    {isLoading ? <Loader2 className="animate-spin inline-block" size={24} /> : stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg bg-gray-800/50 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Course Materials', desc: 'Access lectures, slides, and resources', href: '/student/materials', icon: BookOpen, color: 'bg-blue-500/10 text-blue-400' },
          { title: 'My Grades', desc: 'View scores for assignments and tests', href: '/student/grades', icon: GraduationCap, color: 'bg-green-500/10 text-green-400' },
        ].map((card, i) => (
          <Link href={card.href} key={i}>
            <div className="bg-[#111111] border border-gray-800 p-6 rounded-xl hover:border-blue-500/30 transition-colors flex items-center gap-4 cursor-pointer group">
              <div className={`p-4 rounded-xl ${card.color}`}>
                <card.icon size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">{card.title}</h4>
                <p className="text-gray-400 text-sm">{card.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

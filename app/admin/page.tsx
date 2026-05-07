// app/admin/page.tsx
"use client";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

import { useEffect, useState } from 'react';
import { Layers, Users, BookOpen, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Define the shape of a Cohort based on the backend data
interface Cohort {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  _count: {
    students: number;
    courses: number;
  };
}

export default function AdminDashboard() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE}/admin/cohorts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        // If the backend returns an array, update our state!
        if (Array.isArray(data)) {
          setCohorts(data);
        }
      } catch (error) {
        console.error("Failed to fetch cohorts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculate real live totals from the database array
  const totalStudents = cohorts.reduce((acc, curr) => acc + (curr._count?.students || 0), 0);
  const totalCourses = cohorts.reduce((acc, curr) => acc + (curr._count?.courses || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">System Overview</h2>
          <p className="text-gray-400">Manage all cohorts and academy activity.</p>
        </div>
        <Link href="/admin/cohorts/new" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} />
          <span>Create Cohort</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Cohorts', value: cohorts.length, icon: Layers, color: 'text-blue-400' },
          { label: 'Active Courses', value: totalCourses, icon: BookOpen, color: 'text-green-400' },
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111111] border border-gray-800 p-6 rounded-xl">
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
        ))}
      </div>

      {/* Cohorts Table */}
      <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Active Cohorts</h3>
        </div>
        
        {isLoading ? (
          <div className="p-12 flex justify-center items-center text-gray-500">
            <Loader2 className="animate-spin mr-2" />
            Loading live cohorts from database...
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A] text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Cohort Name</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Students</th>
                <th className="px-6 py-4">Courses</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {cohorts.map((cohort) => (
                <tr key={cohort.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{cohort.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(cohort.startDate).toLocaleDateString()} - {new Date(cohort.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{cohort._count.students} Students</td>
                  <td className="px-6 py-4 text-gray-400">{cohort._count.courses} Courses</td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/cohorts/${cohort.id}`} 
                      className="text-purple-400 hover:text-purple-300 text-sm font-semibold"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {cohorts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Database is empty! Click "Create Cohort" above to initialize your first academic cycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
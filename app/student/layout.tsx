// app/student/layout.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  CheckSquare, 
  FileText, 
  GraduationCap,
  LogOut 
} from 'lucide-react'; 

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 

  // These exact routes are mapped from the PAGES.md document
  const navItems = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Materials', path: '/student/materials', icon: BookOpen },
    { name: 'Attendance', path: '/student/attendance', icon: Clock },
    { name: 'Assignments', path: '/student/assignments', icon: CheckSquare },
    { name: 'Assessments', path: '/student/assessments', icon: FileText },
    { name: 'Grades', path: '/student/grades', icon: GraduationCap },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-gray-200 font-sans">
      
      {/* Student Sidebar Navigation */}
      <aside className="w-64 bg-[#111111] border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white mb-1">
            Web3Nova
          </h1>
          <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20">
            Student Portal
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Exact match for the dashboard, partial match for sub-pages to keep them highlighted
            const isActive = pathname === item.path || (item.path !== '/student' && pathname.startsWith(item.path));
            
            return (
              <Link href={item.path} key={item.path}>
                <div 
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userRole');
              window.location.href = '/login';
            }}
            className="flex items-center space-x-3 text-gray-400 hover:text-red-400 transition-colors w-full p-2"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/5 blur-[120px] -z-10 pointer-events-none" />
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
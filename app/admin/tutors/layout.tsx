// app/tutor/layout.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CheckSquare, 
  LogOut 
} from 'lucide-react'; 

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 

  const navItems = [
    { name: 'Dashboard', path: '/tutor', icon: LayoutDashboard },
    { name: 'My Course', path: '/tutor/course', icon: BookOpen },
    { name: 'My Students', path: '/tutor/students', icon: Users },
    { name: 'Grading', path: '/tutor/grading', icon: CheckSquare },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-gray-200">
      {/* Tutor Sidebar */}
      <aside className="w-64 bg-[#111111] border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white mb-1">Web3Nova</h1>
          <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20">
            Course Admin
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Highlight active path
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link href={item.path} key={item.path}>
                <div className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'hover:bg-gray-800 text-gray-400'
                }`}>
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} 
            className="flex items-center space-x-3 text-gray-400 hover:text-red-400 w-full p-2 transition-colors">
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Notice the blue ambient glow instead of purple! */}
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/5 blur-[120px] -z-10" />
        {children}
      </main>
    </div>
  );
}
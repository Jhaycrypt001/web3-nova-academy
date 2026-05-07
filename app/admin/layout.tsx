// app/admin/layout.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  UserPlus, 
  Settings,
  LogOut 
} from 'lucide-react'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Cohorts', path: '/admin/cohorts', icon: Layers },
    { name: 'Tutors', path: '/admin/tutors', icon: UserPlus },
    { name: 'All Students', path: '/admin/students', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-gray-200">
      <aside className="w-64 bg-[#111111] border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white mb-1">Web3Nova</h1>
          <span className="text-xs font-semibold bg-purple-500/10 text-purple-400 px-2 py-1 rounded-md border border-purple-500/20">
            Super Admin
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link href={item.path} key={item.path}>
                <div className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  isActive ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' : 'hover:bg-gray-800 text-gray-400'
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
            className="flex items-center space-x-3 text-gray-400 hover:text-red-400 w-full p-2">
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-purple-900/5 blur-[120px] -z-10" />
        {children}
      </main>
    </div>
  );
}
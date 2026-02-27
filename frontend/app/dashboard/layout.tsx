'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, MessageSquare, PlusCircle, Bell, LogOut, GraduationCap } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'Ask AI Assistant', href: '/dashboard/student/ask-ai', icon: MessageSquare },
    { name: 'New Complaint', href: '/dashboard/student/new', icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
          <GraduationCap className="text-blue-400" size={32} />
          <span className="font-bold text-lg tracking-tight">ASTU Smart</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-3 rounded-lg transition ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                <Icon size={20} /> {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <h2 className="font-semibold text-slate-700 capitalize">{pathname.split('/').pop()?.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <Bell size={20} className="text-slate-400 cursor-pointer" />
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">S</div>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-8">{children}</section>
      </main>
    </div>
  );
}
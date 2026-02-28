'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api'; 
import { 
  LayoutDashboard, MessageSquare, PlusCircle, 
  Bell, LogOut, GraduationCap, Users, Ticket, BarChart3, Tag, X, Menu
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Added for responsiveness
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    setRole(savedRole);
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/tickets/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/tickets/notifications/read');
      fetchNotifications(); 
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const navConfigs: Record<string, { id: string, name: string; href: string; icon: any }[]> = {
    STUDENT: [
      { id: 'std-ov', name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
      { id: 'std-ai', name: 'Ask AI Assistant', href: '/dashboard/student/ask-ai', icon: MessageSquare },
      { id: 'std-nw', name: 'New Complaint', href: '/dashboard/student/new', icon: PlusCircle },
    ],
    STAFF: [
      { id: 'stf-in', name: 'Ticket Inbox', href: '/dashboard/staff', icon: Ticket },
    ],
    ADMIN: [
      { id: 'adm-an', name: 'System Analytics', href: '/dashboard/admin?tab=analytics', icon: BarChart3 },
      { id: 'adm-tc', name: 'Global Complaints', href: '/dashboard/admin?tab=tickets', icon: Ticket },
      { id: 'adm-us', name: 'User Management', href: '/dashboard/admin?tab=users', icon: Users },
      { id: 'adm-ct', name: 'Manage Categories', href: '/dashboard/admin?tab=categories', icon: Tag },
    ],
  };

  const navItems = role ? navConfigs[role] || [] : [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - NEW BLUE-BLACK STYLING */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-300 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0 md:flex md:flex-col shadow-2xl border-r border-white/5
      `}>
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">ASTU Smart</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            // FIXED: Logic to check path correctly even with query strings
            const isActive = pathname === item.href.split('?')[0];
            
            return (
              <Link 
                key={item.id} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'hover:bg-white/5 text-slate-400 hover:text-blue-400'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} /> 
                <span className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full p-3.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={20} /> 
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600">
               <Menu size={24} />
            </button>
            <div className="flex flex-col">
                <h2 className="font-bold text-slate-900 capitalize text-lg tracking-tight">
                  {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                </h2>
                <span className="text-[10px] text-blue-600 font-black tracking-widest uppercase">
                  {role || 'Guest'} Portal
                </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 relative">
            {/* Bell Icon */}
            <div className="relative cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition" onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={22} className={`${unreadCount > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white ring-2 ring-red-500/20">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 top-14 w-[90vw] sm:w-96 bg-white border border-slate-100 shadow-2xl rounded-[2rem] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-black text-slate-900 text-sm">Notifications</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllRead();
                    }} 
                    className="text-[10px] text-blue-600 font-black uppercase hover:text-blue-700 transition"
                  >
                    Mark All Read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-sm italic">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-5 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* User Profile Pill */}
            <div className="flex items-center gap-3 bg-slate-50 pl-4 pr-1.5 py-1.5 rounded-2xl border border-slate-100 group cursor-pointer hover:border-blue-200 transition-colors">
               <span className="text-xs font-bold text-slate-700 hidden sm:block">
                 {role === 'ADMIN' ? 'Admin' : role === 'STAFF' ? 'Staff' : 'Student'}
               </span>
               <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-blue-200 transition-transform group-hover:scale-105">
                 {role?.charAt(0) || 'U'}
               </div>
            </div>
          </div>
        </header>
        
        <main className="p-6 md:p-10 bg-[#F8FAFC] min-h-[calc(100vh-80px)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
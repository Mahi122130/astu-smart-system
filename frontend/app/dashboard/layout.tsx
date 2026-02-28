'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api'; 
import { 
  LayoutDashboard, MessageSquare, PlusCircle, 
  Bell, LogOut, GraduationCap, Users, Ticket, BarChart3, Tag, X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    setRole(savedRole);
    fetchNotifications();
    
    // Auto-refresh notifications every 45 seconds
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
      // FIXED: Matches your backend router.patch('/notifications/read', ...)
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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full shadow-xl">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
          <GraduationCap className="text-blue-400" size={32} />
          <span className="font-bold text-lg tracking-tight">ASTU Smart</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            // FIXED: Proper active state checking for paths with query params
            const isActive = pathname === item.href.split('?');
            
            return (
              <Link 
                key={item.id} 
                href={item.href} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  isActive ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-blue-400'} /> 
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} /> 
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex flex-col">
             <h2 className="font-bold text-slate-800 capitalize leading-tight">
               {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
             </h2>
             <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase">
               {role || 'Guest'} Portal
             </span>
          </div>
          
          <div className="flex items-center gap-4 relative">
            {/* Bell Icon with Badge */}
            <div className="relative cursor-pointer p-2" onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={20} className={`${unreadCount > 0 ? 'text-blue-600' : 'text-slate-400'} hover:text-blue-500 transition`} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-white min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllRead();
                    }} 
                    className="text-[10px] text-blue-600 font-bold uppercase hover:underline"
                  >
                    Mark All Read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/40' : ''}`}>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 bg-slate-50 pl-3 pr-1 py-1 rounded-full border border-slate-200">
               <span className="text-xs font-semibold text-slate-600 hidden sm:block">
                 {role === 'ADMIN' ? 'Administrator' : role === 'STAFF' ? 'Staff' : 'Student'}
               </span>
               <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
                 {role?.charAt(0) || 'U'}
               </div>
            </div>
          </div>
        </header>
        
        <main className="p-8 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
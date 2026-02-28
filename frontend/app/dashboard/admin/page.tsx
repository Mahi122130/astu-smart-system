'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { 
  BarChart3, Users, TicketCheck, ShieldAlert, 
  Trash2, Plus, Tag, Loader2, RefreshCw, X, Info, Calendar, User, Mail, FileText, ExternalLink, MoreVertical
} from 'lucide-react';

function AdminContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';
  
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url);

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statRes, ticketRes, userRes, catRes] = await Promise.all([
        api.get('/tickets/analytics'),
        api.get('/tickets/history'),
        api.get('/auth/users').catch(() => ({ data: [] })),
        api.get('/categories')
      ]);
      setStats(statRes.data);
      setAllTickets(ticketRes.data);
      setUsers(userRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const res = await api.post('/categories', { name: newCategory.trim() });
      setCategories([...categories, res.data]);
      setNewCategory('');
      setIsModalOpen(false);
      fetchData(); 
    } catch (err) {
      alert("Failed to save category.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-6 text-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium italic">Synchronizing university data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-0">
      {/* Header - Now stacks on mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight capitalize">
            {activeTab} Management
          </h1>
          <p className="text-slate-500 text-xs md:text-sm">ASTU System {activeTab} Control</p>
        </div>
        <button onClick={fetchData} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-blue-600 border border-transparent hover:border-blue-100 self-end sm:self-auto">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* --- ANALYTICS TAB --- */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <StatCard title="Total Complaints" value={stats.total} icon={<BarChart3/>} color="text-slate-700" bg="bg-slate-100" />
          <StatCard title="Open Cases" value={stats.open} icon={<ShieldAlert/>} color="text-amber-600" bg="bg-amber-100" />
          <StatCard title="Resolved" value={stats.resolved} icon={<TicketCheck/>} color="text-green-600" bg="bg-green-100" />
        </div>
      )}

      {/* --- TICKETS TAB - Table on Desktop, Cards on Mobile --- */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="p-6">Student</th>
                  <th className="p-6">Subject</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allTickets.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="p-6">
                      <p className="text-sm font-bold text-slate-800">{t.student?.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{t.student?.email || 'No email'}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{t.title}</p>
                      <span className="text-[10px] text-blue-500 font-bold uppercase">{t.category}</span>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        t.status === 'OPEN' ? 'bg-amber-100 text-amber-600' : 
                        t.status === 'RESOLVED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => setSelectedTicket(t)}
                        className="text-blue-600 font-bold text-xs hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl transition-all border border-blue-100 hover:border-blue-600"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {allTickets.map((t) => (
              <div key={t.id} className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.student?.name || 'Anonymous'}</p>
                    <p className="text-[10px] text-blue-500 font-bold uppercase">{t.category}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                    t.status === 'OPEN' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-snug">{t.title}</p>
                <button 
                  onClick={() => setSelectedTicket(t)}
                  className="w-full py-3 bg-slate-50 text-blue-600 text-xs font-bold rounded-xl border border-slate-100 active:bg-blue-600 active:text-white transition-all"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-500">
          {users.map((user: any) => (
            <div key={user.id} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-bold border border-slate-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      )}

      {/* --- CATEGORIES TAB --- */}
      {activeTab === 'categories' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-bold text-slate-800 text-lg">System Categories</h3>
            <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all">
              <Plus size={18} /> Add Category
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between group bg-slate-50/30 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <Tag size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                </div>
                <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODALS (Updated for Mobile) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z- flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 md:p-8 border border-slate-100 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">New Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category Name</label>
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none text-slate-800 transition-all"
                  placeholder="e.g. Finance"
                  autoFocus
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 px-4 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="order-1 sm:order-2 flex-1 px-4 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z- flex items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom md:zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl">
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg md:text-xl">Ticket Detail</h3>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{selectedTicket.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X size={28} /></button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto">
              <div>
                <h4 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-4">{selectedTicket.title}</h4>
                <div className="bg-slate-50 p-5 md:p-6 rounded-3xl border border-slate-100 text-slate-700 leading-relaxed italic text-sm md:text-base">
                  "{selectedTicket.description}"
                </div>
              </div>

              {selectedTicket.attachmentUrl && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attached Evidence</p>
                  {isImage(selectedTicket.attachmentUrl) ? (
                    <div className="rounded-3xl border border-slate-200 overflow-hidden bg-slate-100 relative group">
                      <img 
                        src={getFullUrl(selectedTicket.attachmentUrl)} 
                        alt="Evidence" 
                        className="w-full h-auto max-h-64 md:max-h-96 object-contain"
                      />
                      <a href={getFullUrl(selectedTicket.attachmentUrl)} target="_blank" rel="noreferrer" className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-lg text-blue-600"><ExternalLink size={18} /></a>
                    </div>
                  ) : (
                    <a href={getFullUrl(selectedTicket.attachmentUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold text-sm border border-blue-100 w-full justify-center">
                      <FileText size={20} /> View Document
                    </a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem icon={<User size={16}/>} label="Submitter" value={selectedTicket.student?.name || 'Anonymous'} />
                <DetailItem icon={<Calendar size={16}/>} label="Created" value={new Date(selectedTicket.createdAt).toLocaleDateString()} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 md:p-8 border-t bg-slate-50/50">
              <button onClick={() => setSelectedTicket(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm active:scale-95 transition-transform">Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fixed Hover: No more blue-black on every item. Clean and professional.
function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 flex items-center justify-between transition-all hover:shadow-lg hover:-translate-y-1">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className={`text-3xl md:text-4xl font-black ${color}`}>{value}</p>
      </div>
      <div className={`p-3 md:p-4 rounded-2xl ${bg} ${color}`}>{icon}</div>
    </div>
  );
}

function DetailItem({ icon, label, value }: any) {
  return (
    <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4">
      <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-400">Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { 
  BarChart3, Users, TicketCheck, ShieldAlert, 
  Trash2, Plus, Tag, Loader2, RefreshCw, X, Info, Calendar, User, Mail, FileText, ExternalLink
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

  // Helper to determine if the attachment is an image
  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url);
  };

  /**
   * FIXED: Logic to ensure the backend URL is correctly prefixed.
   * Uses local fallback if env variable is missing.
   */
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
      
      // LOGIC ADDED: Refresh stats after category changes
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium italic">Synchronizing university data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight capitalize">
            {activeTab} Management
          </h1>
          <p className="text-slate-500 text-sm">Overview of ASTU system {activeTab}</p>
        </div>
        <button onClick={fetchData} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-blue-600">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
          <StatCard title="Total Complaints" value={stats.total} icon={<BarChart3/>} color="text-slate-700" bg="bg-slate-100" />
          <StatCard title="Open Cases" value={stats.open} icon={<ShieldAlert/>} color="text-amber-600" bg="bg-amber-100" />
          <StatCard title="Resolved" value={stats.resolved} icon={<TicketCheck/>} color="text-green-600" bg="bg-green-100" />
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
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
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-bold text-slate-800">{t.student?.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{t.student?.email || 'No email'}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-semibold text-slate-700">{t.title}</p>
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
                        className="text-blue-600 font-bold text-xs hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {users.map((user: any) => (
            <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {user.name ? user.name.toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{user.role}</p>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      )}

      {/* --- CATEGORIES TAB --- */}
      {activeTab === 'categories' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">System Categories</h3>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
              <Plus size={18} /> Add Category
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 border rounded-2xl flex items-center justify-between group hover:bg-blue-50 transition">
                <div className="flex items-center gap-3">
                  <Tag size={16} className="text-blue-500" />
                  <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                </div>
                <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- CATEGORY ADD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z- flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">New Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Name</label>
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-slate-800"
                  placeholder="e.g. Finance"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TICKET DETAIL VIEW MODAL (WITH IMAGE PREVIEW) --- */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z- flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-250 border border-slate-100">
            {/* Header */}
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Ticket Insight</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{selectedTicket.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-2xl font-black text-slate-900 leading-tight mb-4">{selectedTicket.title}</h4>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-800 leading-relaxed italic text-sm">
                  "{selectedTicket.description}"
                </div>
              </div>

              {/* ATTACHMENT SECTION */}
              {selectedTicket.attachmentUrl && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence Attached</p>
                  
                  {isImage(selectedTicket.attachmentUrl) ? (
                    <div className="rounded-3xl border border-slate-200 overflow-hidden bg-slate-100 group relative">
                      <img 
                        src={getFullUrl(selectedTicket.attachmentUrl)} 
                        alt="Evidence" 
                        className="w-full h-auto max-h-96 object-contain"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found";
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <a 
                          href={getFullUrl(selectedTicket.attachmentUrl)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-xl text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <ExternalLink size={20} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <a 
                      href={getFullUrl(selectedTicket.attachmentUrl)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-3 px-6 py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all border border-blue-100 w-full justify-center"
                    >
                      <FileText size={20} /> View Document (PDF/File)
                    </a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="p-2 bg-slate-100 text-slate-500 rounded-xl"><User size={18}/></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitter</p>
                    <p className="text-sm font-bold text-slate-800">{selectedTicket.student?.name || 'Anonymous'}</p>
                  </div>
                </div>
                <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="p-2 bg-slate-100 text-slate-500 rounded-xl"><Calendar size={18}/></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created On</p>
                    <p className="text-sm font-bold text-slate-800">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 flex items-center justify-between transition-transform hover:scale-[1.02]">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">{title}</p>
        <p className={`text-4xl font-black ${color}`}>{value}</p>
      </div>
      <div className={`p-4 rounded-2xl ${bg} ${color}`}>{icon}</div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-400">Loading Dashboard...</div>}>
      <AdminContent />
    </Suspense>
  );
}
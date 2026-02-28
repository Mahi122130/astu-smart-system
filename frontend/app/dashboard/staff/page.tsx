'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { X, User, Tag, Clock, FileText, CheckCircle, Image as ImageIcon } from 'lucide-react';

export default function StaffPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTickets = () => {
    api.get('/tickets/history').then(res => setTickets(res.data));
  };

  useEffect(() => { fetchTickets(); }, []);

  // --- REFACTORED: NO HARDCODED URL ---
  const getFileUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    // Use the environment variable, defaults to empty string if not set
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    // Clean the URL to get the root domain (removes /api and trailing slashes)
    const rootDomain = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${rootDomain}${cleanPath}`;
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      await api.patch(`/tickets/update/${id}`, { status });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, status });
    } catch (err) { alert("Update failed"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Staff Workspace</h2>
        <p className="text-slate-500 text-sm">Review and resolve student complaints</p>
      </div>

      <div className="grid gap-4">
        {tickets.map(t => (
          <div key={t.id} onClick={() => setSelectedTicket(t)} className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-center hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <div className="flex gap-4 items-center">
              <div className={`w-2 h-12 rounded-full ${t.status === 'OPEN' ? 'bg-amber-400' : t.status === 'RESOLVED' ? 'bg-green-500' : 'bg-blue-500'}`} />
              <div>
                <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{t.title}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                  <span className="flex items-center gap-1"><User size={12}/> {t.student?.name}</span>
                  <span className="flex items-center gap-1"><Tag size={12}/> {t.category}</span>
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${t.status === 'OPEN' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>{t.status}</span>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={20}/></div>
                <h3 className="font-bold text-slate-800">Complaint Details</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              <div>
                <h4 className="text-xl font-black text-slate-900 mb-2">{selectedTicket.title}</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">"{selectedTicket.description}"</p>
              </div>

              {/* STAFF ATTACHMENT VIEW */}
              {selectedTicket.attachmentUrl && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Evidence Evidence</p>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50">
                    {isImage(selectedTicket.attachmentUrl) ? (
                      <img 
                        src={getFileUrl(selectedTicket.attachmentUrl)!} 
                        alt="Evidence" 
                        className="w-full h-48 object-cover cursor-pointer hover:opacity-90" 
                        onClick={() => window.open(getFileUrl(selectedTicket.attachmentUrl)!, '_blank')} 
                      />
                    ) : (
                      <div className="p-4 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Document File</span>
                        <a href={getFileUrl(selectedTicket.attachmentUrl)!} target="_blank" className="text-blue-600 text-xs font-black underline font-sans">Open File</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 rounded-2xl"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Student</p><p className="text-sm font-bold text-slate-700">{selectedTicket.student?.name}</p></div>
                <div className="p-4 border border-slate-100 rounded-2xl"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Category</p><p className="text-sm font-bold text-slate-700">{selectedTicket.category}</p></div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase">Update Progress</label>
                <div className="flex gap-2">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                    <button key={status} disabled={loading} onClick={() => updateStatus(selectedTicket.id, status)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedTicket.status === status ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{status.replace('_', ' ')}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex justify-end"><button onClick={() => setSelectedTicket(null)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">Close View</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
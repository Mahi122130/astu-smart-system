'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get('/tickets/history').then(res => setTickets(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Welcome back, Student</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Simple Stats Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Clock size={24}/></div>
          <div><p className="text-sm text-slate-500">Active Tickets</p><p className="text-2xl font-bold">{tickets.filter((t:any)=>t.status!=='RESOLVED').length}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b bg-slate-50 font-semibold text-slate-700 text-sm uppercase tracking-wider">Recent Complaints</div>
        <div className="divide-y divide-slate-100">
          {tickets.length === 0 ? <p className="p-8 text-center text-slate-400">No complaints found.</p> : tickets.map((t: any) => (
            <div key={t.id} className="p-4 hover:bg-slate-50 flex items-center justify-between transition">
              <div>
                <h4 className="font-medium text-slate-800">{t.title}</h4>
                <p className="text-sm text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
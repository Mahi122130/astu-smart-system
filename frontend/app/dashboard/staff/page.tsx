'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function StaffPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    api.get('/tickets/history').then(res => setTickets(res.data));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/tickets/update/${id}`, { status });
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Requests</h2>
      <div className="space-y-4">
        {tickets.map(t => (
          <div key={t.id} className="p-4 bg-white border rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{t.title}</p>
              <p className="text-sm text-gray-500">{t.student?.name} - {t.category}</p>
            </div>
            <select 
              value={t.status} 
              onChange={(e) => updateStatus(t.id, e.target.value)}
              className="border p-1 rounded"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
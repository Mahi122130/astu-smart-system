'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });

  useEffect(() => {
    api.get('/tickets/analytics').then(res => setStats(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Analytics</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-white border rounded shadow-sm text-center">
          <p className="text-gray-500">Total Tickets</p>
          <p className="text-4xl font-bold">{stats.total}</p>
        </div>
        <div className="p-6 bg-blue-50 border border-blue-200 rounded text-center">
          <p className="text-blue-600">Open</p>
          <p className="text-4xl font-bold">{stats.open}</p>
        </div>
        <div className="p-6 bg-green-50 border border-green-200 rounded text-center">
          <p className="text-green-600">Resolved</p>
          <p className="text-4xl font-bold">{stats.resolved}</p>
        </div>
      </div>
    </div>
  );
}
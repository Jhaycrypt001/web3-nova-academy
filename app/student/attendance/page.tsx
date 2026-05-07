// app/student/attendance/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, XCircle, Loader2, Wifi } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  session: { date: string; active: boolean };
}

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const load = () => {
    const token = localStorage.getItem('token');
    return fetch(`${BASE}/student/attendance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRecords(data); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}/student/attendance/check-in`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Checked in successfully!', ok: true });
        setIsLoading(true);
        load();
      } else {
        setMessage({ text: data.error || 'Check-in failed.', ok: false });
      }
    } catch {
      setMessage({ text: 'Network error. Try again.', ok: false });
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Attendance</h2>
          <p className="text-gray-400">{records.length} session{records.length !== 1 ? 's' : ''} attended.</p>
        </div>
        <button
          onClick={handleCheckIn}
          disabled={isCheckingIn}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          {isCheckingIn ? <Loader2 className="animate-spin" size={20} /> : <Wifi size={20} />}
          Check In Now
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
          message.ok
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={24} />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-16 text-center flex flex-col items-center text-gray-500">
          <Clock size={48} className="mb-4 text-gray-700" />
          <p>No attendance records yet. Use "Check In Now" when class is in session.</p>
          <p className="text-xs mt-2 text-gray-600">You must be connected to the class network for check-in to work.</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A] text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {records.map(rec => (
                <tr key={rec.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-white">
                    {new Date(rec.date).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 text-green-400 text-sm font-medium w-fit">
                      <CheckCircle2 size={16} /> Present
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

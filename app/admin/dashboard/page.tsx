"use client";

import { useState, useEffect } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setLogs(data.recentLogs);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) return <div className="text-center py-20 text-gray-500 font-bold animate-pulse">กำลังโหลดข้อมูล Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">ภาพรวมระบบ (Dashboard)</h2>
        <p className="text-sm text-gray-500 mt-2">สถิติการเข้าชมเว็บไซต์และการใช้งานระบบทั้งหมด</p>
      </div>

      {/* ================= กล่องสถิติ (Stats Cards) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">ยอดเข้าชมเว็บ</p>
            <h4 className="text-2xl font-bold text-gray-900">{stats.TotalVisits || 0}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">ยอมรับคุกกี้แล้ว</p>
            <h4 className="text-2xl font-bold text-gray-900">{stats.TotalCookieAccepts || 0}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">ตำแหน่งงานที่เปิดรับ</p>
            <h4 className="text-2xl font-bold text-gray-900">{stats.ActiveJobs || 0}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">กิจกรรมทั้งหมด</p>
            <h4 className="text-2xl font-bold text-gray-900">{stats.TotalActivities || 0}</h4>
          </div>
        </div>
      </div>

      {/* ================= ตาราง Log (Activity Log) ================= */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-lg">ประวัติการใช้งานระบบ 20 รายการล่าสุด</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 uppercase text-xs bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold">เวลา</th>
                <th className="px-6 py-4 font-semibold">ประเภท Action</th>
                <th className="px-6 py-4 font-semibold">รายละเอียด / หน้าเว็บ</th>
                <th className="px-6 py-4 font-semibold text-center">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.LogID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(log.CreatedAt).toLocaleString("th-TH")}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${
                      log.ActionType === 'COOKIE_ACCEPT' ? 'bg-green-100 text-green-700' :
                      log.ActionType === 'PAGE_VISIT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {log.ActionType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 truncate max-w-xs">{log.Details}</td>
                  <td className="px-6 py-4 text-center font-mono text-gray-400 text-xs">{log.IPAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
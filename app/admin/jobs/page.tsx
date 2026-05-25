"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Job {
  JobID: number;
  Title: string;
  Department: string;
  Location: string;
  Requirements: string;
  CreatedAt: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 💡 State สำหรับเช็คว่ากำลัง "แก้ไข" ข้อมูลตัวไหนอยู่ (ถ้าเป็น null คือโหมด "เพิ่มใหม่")
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "Amata City Chonburi",
    requirements: "",
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      if (data.success) setJobs(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // 💡 ฟังก์ชันรีเซ็ตฟอร์มกลับไปโหมด "เพิ่มใหม่"
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      department: "",
      location: "Amata City Chonburi",
      requirements: "",
    });
  };

  // 💡 ฟังก์ชันเมื่อกดปุ่ม "แก้ไข" ที่ตาราง
  const handleEditClick = (job: Job) => {
    setEditingId(job.JobID);
    setFormData({
      title: job.Title,
      department: job.Department,
      location: job.Location,
      requirements: job.Requirements,
    });
    // เลื่อนหน้าจอขึ้นไปบนสุดเพื่อให้เห็นฟอร์ม
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 💡 ฟังก์ชันบันทึกข้อมูล (รองรับทั้ง เพิ่มใหม่ และ อัปเดต)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // ตัดสินใจว่าจะเรียกใช้ API ด้วย Method อะไร (POST = เพิ่ม, PUT = แก้ไข)
    const method = editingId ? "PUT" : "POST";
    const bodyPayload = editingId ? { ...formData, id: editingId } : formData;

    try {
      const res = await fetch("/api/admin/jobs", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({
          title: "สำเร็จ!",
          text: editingId ? "อัปเดตข้อมูลตำแหน่งงานเรียบร้อยแล้ว" : "ประกาศงานใหม่เรียบร้อยแล้ว",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });
        resetForm();
        fetchJobs();
      } else {
        Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
      }
    } catch (err) {
      Swal.fire("ผิดพลาด", "การเชื่อมต่อล้มเหลว", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "ปิดรับสมัคร?",
      text: "คุณต้องการนำประกาศนี้ออกจากหน้าเว็บไซต์ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      cancelButtonText: "ยกเลิก",
      confirmButtonText: "ใช่, ปิดรับสมัคร",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("/api/admin/jobs", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data = await res.json();
          if (data.success) {
            Swal.fire("ปิดรับสมัครแล้ว!", "ประกาศถูกนำออกจากหน้าเว็บแล้ว", "success");
            fetchJobs();
            // ถ้าเผลอลบตัวที่กำลังแก้ไขอยู่ ให้รีเซ็ตฟอร์มด้วย
            if (editingId === id) resetForm();
          }
        } catch (error) {
          Swal.fire("ผิดพลาด", "ไม่สามารถปิดรับสมัครได้", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">ระบบจัดการประกาศรับสมัครงาน</h2>
          <p className="text-sm text-gray-500 mt-1">เพิ่ม แก้ไข หรือปิดรับสมัครงานที่จะแสดงบนหน้าเว็บไซต์</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* ================= ฟอร์มเพิ่ม/แก้ไข ================= */}
        <div className={`p-6 md:p-8 rounded-2xl border shadow-sm sticky top-6 transition-all duration-300 ${editingId ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
              {editingId ? (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{editingId ? "แก้ไขประกาศงาน" : "สร้างประกาศใหม่"}</h3>
              {editingId && <p className="text-xs text-amber-600 font-medium">โหมดแก้ไขข้อมูล</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">ตำแหน่งงาน <span className="text-red-500">*</span></label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="เช่น Production Engineer" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">แผนก <span className="text-red-500">*</span></label>
                <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required placeholder="เช่น Engineering" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">สถานที่ <span className="text-red-500">*</span></label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex justify-between">
                <span>คุณสมบัติผู้สมัคร <span className="text-red-500">*</span></span>
                <span className="text-xs text-gray-400 font-normal">กด Enter เพื่อขึ้นบรรทัดใหม่</span>
              </label>
              <textarea value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} required rows={6} placeholder="- ปริญญาตรีวิศวกรรมศาสตร์&#10;- มีประสบการณ์ 1-3 ปี" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"></textarea>
            </div>
            
            <div className="flex gap-3 pt-2">
              {editingId && (
                <button type="button" onClick={resetForm} className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all">
                  ยกเลิก
                </button>
              )}
              <button type="submit" disabled={isSubmitting} className={`flex-[2] py-3 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-70 ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-900 hover:bg-black'}`}>
                {isSubmitting ? "กำลังบันทึก..." : editingId ? "อัปเดตข้อมูล" : "ประกาศรับสมัคร"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= ตารางแสดงงาน ================= */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800">รายการประกาศรับสมัครงานทั้งหมด ({jobs.length})</h3>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">ตำแหน่งงาน / รายละเอียด</th>
                  <th className="px-6 py-4 text-center w-32">วันที่ประกาศ</th>
                  <th className="px-6 py-4 text-center w-32">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={3} className="text-center py-12 text-gray-400 font-medium">กำลังโหลดข้อมูล...</td></tr>
                ) : jobs.length > 0 ? (
                  jobs.map((job) => (
                    <tr key={job.JobID} className={`hover:bg-blue-50/50 transition-colors ${editingId === job.JobID ? 'bg-blue-50/80' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="font-bold text-gray-800 text-base">{job.Title}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="inline-flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">
                              {job.Department}
                            </span>
                            <span className="inline-flex items-center text-gray-500">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {job.Location}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500 text-xs">
                        {new Date(job.CreatedAt).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <button 
                            onClick={() => handleEditClick(job)}
                            className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors focus:outline-none"
                            title="แก้ไขข้อมูล"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(job.JobID)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus:outline-none"
                            title="ปิดรับสมัคร"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-gray-400 font-medium">
                      ยังไม่มีประกาศรับสมัครงาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
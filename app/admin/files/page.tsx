"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface FileDetail {
  filename: string;
  code: string;
  name: string;
  size: string;
  createdAt: string;
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/files");
      const data = await res.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (filename: string) => {
    Swal.fire({
      title: "ยืนยันการลบไฟล์?",
      text: "ไฟล์นี้จะถูกลบออกจากเซิร์ฟเวอร์ถาวร และผู้ใช้จะไม่สามารถดาวน์โหลดได้อีก",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ลบไฟล์ถาวร",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("/api/admin/files", {
            method: "DELETE",
            body: JSON.stringify({ filename }),
          });
          const data = await res.json();
          if (data.success) {
            Swal.fire("ลบสำเร็จ!", "ไฟล์ถูกลบออกจากระบบแล้ว", "success");
            fetchFiles(); // โหลดข้อมูลใหม่
          }
        } catch (error) {
          Swal.fire("ข้อผิดพลาด", "ไม่สามารถลบไฟล์ได้", "error");
        }
      }
    });
  };

  // กรองไฟล์ด้วยชื่อหรือรหัส (Search Filter)
  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            ระบบจัดการไฟล์ส่วนกลาง (File Manager)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            ค้นหารหัสไฟล์สำหรับดาวน์โหลด และลบไฟล์ที่ไม่ใช้งานแล้ว
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* กล่องค้นหา */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">
            รายการไฟล์ทั้งหมด ({files.length})
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาชื่อไฟล์ หรือ รหัส..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 w-32">รหัสดาวน์โหลด</th>
                <th className="px-6 py-4">ชื่อไฟล์</th>
                <th className="px-6 py-4 text-center w-24">ขนาด (MB)</th>
                <th className="px-6 py-4 text-center w-40">วันที่อัปโหลด</th>
                <th className="px-6 py-4 text-center w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    ไม่พบไฟล์ในระบบ
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr
                    key={file.filename}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 tracking-wider">
                      {file.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {file.name}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {file.size}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 text-xs">
                      {new Date(file.createdAt).toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(file.filename)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบไฟล์"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

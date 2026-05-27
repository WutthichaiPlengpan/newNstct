"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";

// 💡 นำเข้า CSS ของ React Quill
import "react-quill-new/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface Policy {
  PolicyID: number;
  Title: string;
  Summary: string;
  Content: string;
  PdfPath: string;
}

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [editingID, setEditingID] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 💡 กำหนดปุ่มเครื่องมือสำหรับ Editor ให้แอดมินใช้งานง่ายๆ
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"], // ปุ่มล้างฟอร์แมต
    ],
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const res = await fetch("/api/policies");
      const data = await res.json();
      if (data.success) setPolicies(data.data);
    } catch (error) {
      console.error("Failed to load policies", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบว่าใส่เนื้อหาหรือยัง (Quill มักจะคืนค่า <p><br></p> ถ้าว่างเปล่า)
    if (!content || content === "<p><br></p>") {
      Swal.fire({
        icon: "warning",
        title: "แจ้งเตือน",
        text: "กรุณาใส่เนื้อหานโยบาย",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("summary", summary);
    formData.append("content", content);
    if (pdfFile) formData.append("pdf", pdfFile);
    if (editingID) formData.append("id", editingID.toString());

    const url = "/api/admin/policies";
    const method = editingID ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (data.success) {
        // 💡 ใช้ SweetAlert2 แสดงความสำเร็จ
        Swal.fire({
          icon: "success",
          title: editingID ? "อัปเดตข้อมูลสำเร็จ!" : "เพิ่มข้อมูลสำเร็จ!",
          showConfirmButton: false,
          timer: 1500,
        });
        resetForm();
        loadPolicies();
      } else {
        Swal.fire({ icon: "error", title: "ผิดพลาด", text: data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "เกิดข้อผิดพลาดในการส่งข้อมูล",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditingID(policy.PolicyID);
    setTitle(policy.Title);
    setSummary(policy.Summary);
    setContent(policy.Content);
    window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนจอขึ้นไปที่ฟอร์ม
  };

  const handleDelete = async (id: number) => {
    // 💡 ใช้ SweetAlert2 สำหรับการยืนยันการลบ
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("/api/admin/policies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ!",
          showConfirmButton: false,
          timer: 1500,
        });
        loadPolicies();
      } else {
        Swal.fire({ icon: "error", title: "ผิดพลาด", text: data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "เกิดข้อผิดพลาดในการลบข้อมูล",
      });
    }
  };

  const resetForm = () => {
    setEditingID(null);
    setTitle("");
    setSummary("");
    setContent("");
    setPdfFile(null);
    // เคลียร์ input type file
    const fileInput = document.getElementById("pdfInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          จัดการนโยบายบริษัท
        </h1>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold text-blue-900">
            {editingID ? "📝 แก้ไขข้อมูลนโยบาย" : "✨ เพิ่มนโยบายใหม่"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              หัวข้อนโยบาย <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-xl text-sm transition-all outline-none"
              placeholder="เช่น นโยบายคุณภาพและสิ่งแวดล้อม ประจำปี"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              แนบเอกสาร PDF (ไม่บังคับ)
            </label>
            <input
              id="pdfInput"
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 p-2.5 rounded-xl text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            คำโปรยย่อ (Summary) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-xl text-sm transition-all outline-none"
            placeholder="สรุปเนื้อหาหลัก 1-2 บรรทัด สำหรับแสดงที่หน้าการ์ดรายการ..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            รายละเอียดเนื้อหา <span className="text-red-500">*</span>
          </label>
          {/* 💡 ปรับแต่ง ReactQuill ให้มี Scrollbar ด้านใน และล็อค Toolbar ไว้ด้านบน */}
          <div
            className="bg-white rounded-xl border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all 
                          [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:rounded-t-xl
                          [&_.ql-container]:border-none 
                          [&_.ql-editor]:min-h-[300px] [&_.ql-editor]:max-h-[500px] [&_.ql-editor]:overflow-y-auto"
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              /* ❌ ลบ className="h-64" ออกไปแล้ว */
              placeholder="พิมพ์รายละเอียดนโยบายที่นี่... (สามารถจัดรูปแบบตัวหนา ตัวเอียง หรือทำรายการได้จากเมนูด้านบน)"
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-8">
          {editingID && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-all"
            >
              ยกเลิกการแก้ไข
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            {loading
              ? "⏳ กำลังบันทึก..."
              : editingID
                ? "💾 อัปเดตข้อมูล"
                : "✨ บันทึกข้อมูล"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 uppercase tracking-wider text-xs">
              <tr>
                <th className="p-5">หัวข้อนโยบาย</th>
                <th className="p-5">เอกสารแนบ</th>
                <th className="p-5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {policies.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">
                    ยังไม่มีข้อมูลนโยบาย
                  </td>
                </tr>
              ) : (
                policies.map((p) => (
                  <tr
                    key={p.PolicyID}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="p-5 font-medium text-gray-800">
                      <div className="flex flex-col">
                        <span>{p.Title}</span>
                        <span className="text-xs text-gray-400 font-normal truncate max-w-xs">
                          {p.Summary}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      {p.PdfPath ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          มีไฟล์ PDF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                          ไม่มีไฟล์
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(p)}
                          className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 font-semibold text-xs flex items-center gap-1.5"
                        >
                          ✎ แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(p.PolicyID)}
                          className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold text-xs flex items-center gap-1.5"
                        >
                          🗑 ลบ
                        </button>
                      </div>
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

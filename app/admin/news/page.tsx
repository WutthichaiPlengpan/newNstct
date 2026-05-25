"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Swal from "sweetalert2"; // 👈 นำเข้า SweetAlert2

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/news");
      const data = await res.json();
      if (data.success) setNews(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // 💡 แจ้งเตือนบันทึกสำเร็จด้วย SweetAlert2
        Swal.fire({
          title: "บันทึกข่าวสารสำเร็จ!",
          text: "ข้อมูลข่าวสารได้รับการบันทึกและเผยแพร่แล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#2563eb",
        });
        (e.target as HTMLFormElement).reset();
        fetchNews();
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: data.error || "ไม่สามารถบันทึกข้อมูลข่าวสารได้",
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "การเชื่อมต่อล้มเหลว",
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    // 💡 เปลี่ยนเป็นระบบกล่องยืนยันการลบ (Confirm Dialog) ของ SweetAlert2
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ต้องการลบข่าวนี้ใช่หรือไม่? (ข่าวจะถูกซ่อนจากหน้าเว็บ)",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ใช่, ยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("/api/admin/news", {
            method: "DELETE",
            body: JSON.stringify({ id }),
          });
          const data = await res.json();

          if (data.success) {
            Swal.fire({
              title: "ลบสำเร็จ!",
              text: "ข่าวสารนี้ถูกลบออกจากระบบแล้ว",
              icon: "success",
              confirmButtonColor: "#2563eb",
            });
            fetchNews();
          } else {
            Swal.fire("เกิดข้อผิดพลาด", "ลบข้อมูลไม่สำเร็จ", "error");
          }
        } catch (error) {
          Swal.fire(
            "เกิดข้อผิดพลาด",
            "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
            "error",
          );
        }
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            ระบบจัดการข่าวสาร (News & Events)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            เพิ่ม ลบ และจัดการรูปภาพกิจกรรมหรือวิดีโอสำหรับแสดงผลบนหน้าเว็บไซต์
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ================= ฟอร์มเพิ่มข่าว ================= */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">สร้างข่าวใหม่</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                หัวข้อข่าว <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="กรอกหัวข้อข่าว..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                รายละเอียดเนื้อหา <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                required
                rows={5}
                placeholder="พิมพ์เนื้อหาข่าวสารที่นี่..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                รูปภาพปก{" "}
                <span className="text-xs font-normal text-gray-400">
                  (แนะนำอัตราส่วน 16:9)
                </span>{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="coverImage"
                accept="image/*"
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all border border-gray-200 rounded-xl bg-gray-50 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                แกลเลอรีภาพกิจกรรม{" "}
                <span className="text-xs font-normal text-gray-400">
                  (เลือกได้หลายรูป)
                </span>
              </label>
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-gray-200 rounded-xl bg-gray-50 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                วิดีโอ (YouTube URL){" "}
                <span className="text-xs font-normal text-gray-400">
                  *ไม่บังคับ
                </span>
              </label>
              <input
                type="url"
                name="videoUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md flex justify-center items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังอัปโหลดข้อมูล...
                </>
              ) : (
                <>
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  บันทึกข่าวสาร
                </>
              )}
            </button>
          </form>
        </div>

        {/* ================= ตารางแสดงข่าว ================= */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800">ประวัติข่าวสารทั้งหมด</h3>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-24 text-center">รูปปก</th>
                  <th className="px-6 py-4">รายละเอียดข่าว</th>
                  <th className="px-6 py-4 text-center w-32">Approve Status</th>
                  <th className="px-6 py-4 text-center w-24">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-12 text-gray-400 font-medium"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : news.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-12 text-gray-400 font-medium"
                    >
                      ยังไม่มีข้อมูลข่าวสารในระบบ
                    </td>
                  </tr>
                ) : (
                  news.map((item) => (
                    <tr
                      key={item.NewsID}
                      className={`hover:bg-gray-50/80 transition-colors ${!item.Status && "bg-gray-50"}`}
                    >
                      <td className="px-6 py-4">
                        {item.CoverImage ? (
                          <div className="w-20 h-14 relative bg-gray-200 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                            <Image
                              src={item.CoverImage}
                              alt="cover"
                              fill
                              sizes="80px" // 💡 เพิ่มการจำกัดขนาดไฟล์ภาพจิ๋วเพื่อลบ Warning บน Console
                              className={`object-cover ${!item.Status && "grayscale"}`}
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className={`font-bold text-gray-800 line-clamp-1 mb-1 ${!item.Status && "text-gray-500 line-through"}`}
                        >
                          {item.Title}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(item.CreatedAt).toLocaleDateString(
                            "th-TH",
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.Status ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                            เผยแพร่
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                            ลบแล้ว
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.Status && (
                          <button
                            onClick={() => handleDelete(item.NewsID)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                            title="ลบข่าว"
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
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

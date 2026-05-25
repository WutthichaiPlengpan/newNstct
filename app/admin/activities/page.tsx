"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import imageCompression from "browser-image-compression";

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  // State สำหรับฟอร์มและโหมดแก้ไข
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "company",
    date: "",
    description: "",
  });

  // State สำหรับ Modal จัดการรูปภาพ
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchActivities = async () => {
    const res = await fetch("/api/admin/activities");
    const data = await res.json();
    if (data.success) setActivities(data.data);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: "", category: "company", date: "", description: "" });
  };

  const handleEditClick = (activity: any) => {
    setEditingId(activity.ActivityID);
    setFormData({
      title: activity.Title,
      category: activity.Category,
      date: new Date(activity.ActivityDate).toISOString().split("T")[0],
      description: activity.Description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const bodyPayload = editingId ? { ...formData, id: editingId } : formData;

    const res = await fetch("/api/admin/activities", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
    });
    const data = await res.json();
    if (data.success) {
      Swal.fire({
        title: "สำเร็จ!",
        text: editingId ? "อัปเดตข้อมูลสำเร็จ" : "สร้างกิจกรรมใหม่เรียบร้อย",
        icon: "success",
        confirmButtonColor: "#2563eb",
        customClass: { popup: "rounded-2xl" },
      });
      resetForm();
      fetchActivities();
    }
  };

  const handleDeleteActivity = async (id: number) => {
    Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบกิจกรรมนี้ออกจากระบบใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ลบกิจกรรม",
      cancelButtonText: "ยกเลิก",
      customClass: { popup: "rounded-2xl" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch("/api/admin/activities", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        fetchActivities();
        if (editingId === id) resetForm();
        Swal.fire("ลบสำเร็จ!", "กิจกรรมถูกลบออกจากระบบแล้ว", "success");
      }
    });
  };

  // ---------------- ระบบจัดการรูปภาพ และ รูปปก ----------------
  const openImageManager = async (activity: any) => {
    setSelectedActivity(activity);
    fetchImages(activity.ActivityID);
  };

  const fetchImages = async (activityId: number) => {
    const res = await fetch(
      `/api/admin/activities/images?activityId=${activityId}`,
    );
    const data = await res.json();
    if (data.success) setImages(data.data);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      Swal.fire("แจ้งเตือน", "อัปโหลดได้สูงสุดครั้งละ 10 รูป", "warning");
      return;
    }
    setUploadFiles(files);
  };

  const handleUploadImages = async () => {
    if (uploadFiles.length === 0) return;
    setIsUploading(true);

    // 💡 แจ้งเตือนแอดมินว่ากำลังบีบอัดรูปภาพ
    Swal.fire({
      title: "กำลังประมวลผล...",
      text: "กำลังบีบอัดและอัปโหลดรูปภาพ กรุณารอสักครู่",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const form = new FormData();
      form.append("activityId", selectedActivity.ActivityID);
      form.append("category", selectedActivity.Category);

      // 💡 ตั้งค่าตัวเลือกการบีบอัดภาพ
      const options = {
        maxSizeMB: 1, // บีบอัดให้ขนาดไม่เกิน 1MB
        maxWidthOrHeight: 1920, // ลดขนาดความกว้าง/ยาวสูงสุดเหลือ 1920px (ระดับ Full HD)
        useWebWorker: true, // ให้ Browser ช่วยประมวลผลจะได้ไม่ค้าง
      };

      // 💡 วนลูปบีบอัดรูปทีละไฟล์ก่อนนำใส่ FormData
      for (const file of uploadFiles) {
        try {
          // กระบวนการบีบอัดรูป
          const compressedFile = await imageCompression(file, options);
          form.append("files", compressedFile);
        } catch (error) {
          console.error("Error compressing file:", file.name, error);
          // ถ้าบีบอัดไฟล์ไหนพลาด ก็ใช้ไฟล์ต้นฉบับแทน
          form.append("files", file);
        }
      }

      // 💡 ส่งรูปที่บีบอัดแล้วไปที่ API
      const res = await fetch("/api/admin/activities/images", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({
          title: "สำเร็จ!",
          text: `อัปโหลด ${uploadFiles.length} รูปเรียบร้อยแล้ว`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "rounded-2xl" },
        });
        setUploadFiles([]);
        fetchImages(selectedActivity.ActivityID);
        fetchActivities();
      } else {
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถอัปโหลดรูปภาพได้", "error");
      }
    } catch (error) {
      Swal.fire("ข้อผิดพลาด", "การเชื่อมต่อล้มเหลว", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number, imageUrl: string) => {
    Swal.fire({
      title: "ลบรูปภาพ?",
      text: "คุณแน่ใจหรือไม่ที่จะลบรูปภาพนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonText: "ยกเลิก",
      confirmButtonText: "ลบรูปภาพ",
      customClass: { popup: "rounded-2xl" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch("/api/admin/activities/images", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId, imageUrl }),
        });
        fetchImages(selectedActivity.ActivityID);
        fetchActivities();
      }
    });
  };

  const handleSetCover = async (imageUrl: string) => {
    const res = await fetch("/api/admin/activities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "setCover",
        id: selectedActivity.ActivityID,
        coverImage: imageUrl,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setSelectedActivity({ ...selectedActivity, CoverImage: imageUrl });
      fetchActivities();
      Swal.fire({
        title: "สำเร็จ!",
        text: "ตั้งเป็นรูปปกเรียบร้อยแล้ว",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-2xl" },
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ================= Header ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            จัดการภาพกิจกรรมบริษัท
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            เพิ่มหัวข้อกิจกรรม รายละเอียด
            และเลือกรูปปกเพื่อแสดงผลบนหน้าเว็บไซต์อย่างมืออาชีพ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div
          className={`p-6 md:p-8 rounded-3xl border shadow-sm sticky top-6 transition-all duration-300 ${editingId ? "bg-amber-50/50 border-amber-200" : "bg-white border-gray-100"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${editingId ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
            >
              {editingId ? (
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              ) : (
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
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "แก้ไขข้อมูลกิจกรรม" : "สร้างกิจกรรมใหม่"}
              </h3>
              {editingId && (
                <p className="text-xs text-amber-600 font-medium">
                  กำลังอยู่ในโหมดแก้ไข
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                ชื่อกิจกรรม <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="เช่น กิจกรรมปีใหม่ 2025"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  หมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="company">Company Activity</option>
                    <option value="tradition">Tradition Activity</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  วันที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex justify-between items-center">
                <span>
                  รายละเอียด{" "}
                  <span className="text-gray-400 text-xs font-normal">
                    (ไม่บังคับ)
                  </span>
                </span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="เพิ่มคำบรรยายหรือรายละเอียดกิจกรรม..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="flex gap-3 pt-4">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                >
                  ยกเลิก
                </button>
              )}
              <button
                type="submit"
                className={`flex-2 py-3 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 ${editingId ? "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"}`}
              >
                {editingId ? "อัปเดตข้อมูล" : "สร้างกิจกรรม"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= ตารางกิจกรรม (ด้านขวา) ================= */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-lg">
              รายการกิจกรรมทั้งหมด
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              {activities.length} รายการ
            </span>
          </div>

          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    กิจกรรม / รายละเอียด
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">
                    หมวดหมู่
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">
                    อัลบั้ม
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((a) => (
                  <tr
                    key={a.ActivityID}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 shrink-0 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative shadow-sm">
                          {a.CoverImage ? (
                            <Image
                              src={a.CoverImage}
                              alt="cover"
                              fill
                              sizes="56px"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base line-clamp-1">
                            {a.Title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
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
                            {new Date(a.ActivityDate).toLocaleDateString(
                              "th-TH",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${a.Category === "company" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-purple-50 text-purple-600 border-purple-200"}`}
                      >
                        {a.Category.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-1.5 px-3 border border-gray-100">
                        <span className="text-base font-extrabold text-gray-700">
                          {a.PhotoCount}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                          Photos
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleEditClick(a)}
                          className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors focus:outline-none"
                          title="แก้ไขเนื้อหา"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => openImageManager(a)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors focus:outline-none"
                          title="จัดการรูปภาพ"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(a.ActivityID)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors focus:outline-none"
                          title="ลบกิจกรรม"
                        >
                          <svg
                            className="w-4 h-4"
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
                      </div>
                    </td>
                  </tr>
                ))}
                {activities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 mb-3 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <p className="font-medium text-gray-500">
                          ยังไม่มีข้อมูลกิจกรรม
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= Modal จัดการรูปภาพ ================= */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2rem w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/20">
            {/* Modal Header */}
            <div className="px-8 py-6 flex justify-between items-center bg-white border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  อัลบั้ม: {selectedActivity.Title}
                </h3>
                <p className="text-sm text-gray-500 mt-1.5 ml-14">
                  อัปโหลด ตั้งเป็นปก หรือลบรูปภาพ (อัปโหลดสูงสุด 10 รูป/ครั้ง)
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedActivity(null);
                  setUploadFiles([]);
                }}
                className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-3 rounded-full transition-all"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Upload Zone */}
            <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 w-full relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="เลือกรูปภาพ"
                />
                <div
                  className={`w-full px-6 py-5 border-2 border-dashed rounded-2xl text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 ${uploadFiles.length > 0 ? "border-blue-400 bg-blue-50/50" : "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400"}`}
                >
                  {uploadFiles.length > 0 ? (
                    <>
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-1">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-blue-700 font-bold text-base">
                        เลือกแล้ว {uploadFiles.length} รูปพร้อมอัปโหลด
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mb-1">
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
                      <span className="text-gray-600 font-bold">
                        คลิกหรือลากรูปภาพมาวางที่นี่
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={handleUploadImages}
                disabled={isUploading || uploadFiles.length === 0}
                className="w-full sm:w-auto shrink-0 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none transition-all flex items-center justify-center gap-3"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                    กำลังอัปโหลด...
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
                    เริ่มอัปโหลด
                  </>
                )}
              </button>
            </div>

            {/* Modal Image Grid */}
            <div className="p-8 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {images.map((img) => {
                  const isCover = selectedActivity.CoverImage === img.ImageUrl;

                  return (
                    <div
                      key={img.ImageID}
                      className={`relative group aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${isCover ? "ring-4 ring-yellow-400 ring-offset-2" : "border border-gray-200 hover:shadow-md"}`}
                    >
                      <Image
                        src={img.ImageUrl}
                        alt="Activity Image"
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {isCover && (
                        <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg shadow-sm tracking-wide uppercase">
                          ⭐ รูปปก
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                        {!isCover && (
                          <button
                            onClick={() => handleSetCover(img.ImageUrl)}
                            className="bg-white/90 text-gray-900 text-xs font-bold px-4 py-2 rounded-xl hover:bg-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                          >
                            ⭐ ตั้งเป็นปก
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteImage(img.ImageID, img.ImageUrl)
                          }
                          className="bg-red-500/90 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-600 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
                        >
                          ลบรูปภาพ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {images.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-10 h-10 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="font-bold text-lg text-gray-600">
                    อัลบั้มว่างเปล่า
                  </p>
                  <p className="text-sm mt-1">
                    ลากรูปภาพมาวางด้านบนเพื่อเริ่มต้น
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

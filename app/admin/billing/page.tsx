"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2"; // 👈 นำเข้า SweetAlert2

interface Schedule {
  SchID: number;
  SchYear: number;
  SchMonth: string;
  StartDate: string;
  EndDate: string;
  IsActive: boolean;
}

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export default function AdminBillingSetupPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [schMonth, setSchMonth] = useState(THAI_MONTHS[new Date().getMonth()]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ดึงข้อมูลเมื่อโหลดหน้าเว็บ
  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/billing");
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // ฟังก์ชันเพิ่มรอบบิล
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    // 💡 ใช้ SweetAlert2 ตรวจสอบข้อมูล
    if (!startDate || !endDate) {
      return Swal.fire("แจ้งเตือน", "กรุณาเลือกวันที่ให้ครบถ้วน", "warning");
    }
    if (new Date(startDate) > new Date(endDate)) {
      return Swal.fire(
        "แจ้งเตือน",
        "วันที่สิ้นสุด ต้องมากกว่าหรือเท่ากับ วันที่เริ่มต้น",
        "warning",
      );
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schMonth, startDate, endDate }),
      });
      const data = await res.json();

      if (data.success) {
        // 💡 ใช้ SweetAlert2 แจ้งเมื่อสำเร็จ
        Swal.fire("สำเร็จ!", "เพิ่มรอบวางบิลใหม่เรียบร้อยแล้ว", "success");
        setStartDate("");
        setEndDate("");
        fetchSchedules(); // โหลดตารางใหม่
      } else {
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันยกเลิกรอบบิล
  const handleCancelSchedule = async (id: number) => {
    // 💡 ใช้ SweetAlert2 ทำกล่องยืนยัน (Confirm Dialog)
    Swal.fire({
      title: "ยืนยันการยกเลิก?",
      text: "คุณต้องการ 'ยกเลิก' รอบวางบิลนี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ใช่, ยกเลิกเลย!",
      cancelButtonText: "ปิด",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("/api/admin/billing", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schId: id }),
          });
          const data = await res.json();

          if (data.success) {
            Swal.fire(
              "ยกเลิกสำเร็จ!",
              "สถานะรอบบิลถูกเปลี่ยนเป็น 'ยกเลิก' แล้ว",
              "success",
            );
            fetchSchedules(); // โหลดตารางใหม่เพื่อให้แสดงสถานะถูกยกเลิก
          } else {
            Swal.fire("ข้อผิดพลาด", "ไม่สามารถยกเลิกรอบวางบิลได้", "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("ข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          จัดการระบบรอบวางบิล (Billing Setup)
        </h2>
        <p className="text-gray-500 mt-1">
          กำหนดเดือน และช่วงวันที่ต้องการเปิดให้ Supplier เข้ามาวางบิล
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* คอลัมน์ซ้าย: ฟอร์มเพิ่มข้อมูล */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
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
              เพิ่มรอบวางบิลใหม่
            </h3>

            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  ประจำเดือน
                </label>
                <select
                  value={schMonth}
                  onChange={(e) => setSchMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-gray-50"
                >
                  {THAI_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  วันเริ่มต้น (เปิดระบบ)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  วันสิ้นสุด (ปิดระบบ)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </form>
          </div>
        </div>

        {/* คอลัมน์ขวา: ตารางประวัติ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-center w-16">#</th>
                    <th className="px-6 py-4">ประจำเดือน / ปี</th>
                    <th className="px-6 py-4 text-center">
                      ช่วงเวลาที่เปิดระบบ
                    </th>
                    <th className="px-6 py-4 text-center">สถานะ</th>
                    <th className="px-6 py-4 text-center w-24">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-gray-500"
                      >
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : schedules.length > 0 ? (
                    schedules.map((sch, index) => (
                      <tr
                        key={sch.SchID}
                        className={`hover:bg-gray-50 ${!sch.IsActive ? "bg-red-50/50 opacity-75" : ""}`}
                      >
                        <td className="px-6 py-4 text-center font-medium text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {sch.SchMonth} {sch.SchYear + 543}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">
                          {new Date(sch.StartDate).toLocaleDateString("th-TH")}{" "}
                          - {new Date(sch.EndDate).toLocaleDateString("th-TH")}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {sch.IsActive ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                              เปิดใช้งาน
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-xs font-bold">
                              ถูกยกเลิก
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {sch.IsActive ? (
                            <button
                              onClick={() => handleCancelSchedule(sch.SchID)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg text-xs font-bold transition-colors border border-red-200"
                            >
                              ยกเลิก
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-gray-500"
                      >
                        ยังไม่มีประวัติการเปิดรอบบิล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

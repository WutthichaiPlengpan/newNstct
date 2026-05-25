"use client";

import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Turnstile } from "@marsidev/react-turnstile";
import Swal from "sweetalert2";

export default function ContactPage() {
  const { t } = useLanguage();

  // State สำหรับฟอร์ม
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // State ควบคุมการโชว์ข้อความสำเร็จ
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State เก็บค่า Token จาก Turnstile
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!turnstileToken) {
      Swal.fire(
        "แจ้งเตือน",
        "กรุณายืนยันตัวตนว่าคุณไม่ใช่บอท (Turnstile)",
        "warning",
      );
      return;
    }

    // 💡 แสดงหน้าต่าง Loading รอระหว่างส่งอีเมล
    Swal.fire({
      title: "กำลังส่งข้อความ...",
      text: "กรุณารอสักครู่",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // 💡 ยิงข้อมูล formData (ที่เป็น State อยู่แล้ว) ไปยัง API
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire(
          "สำเร็จ!",
          "ส่งข้อความของคุณเรียบร้อยแล้ว แอดมินจะติดต่อกลับโดยเร็วที่สุด",
          "success",
        );
        setFormData({ name: "", email: "", subject: "", message: "" }); // เคลียร์ฟอร์ม
        setTurnstileToken(""); // รีเซ็ต Token
      } else {
        Swal.fire(
          "ข้อผิดพลาด",
          data.message || "ไม่สามารถส่งข้อความได้",
          "error",
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire(
        "การเชื่อมต่อล้มเหลว",
        "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้",
        "error",
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      {/* ================= 1. ส่วนหัว (Hero Section) ================= */}
      <div className="bg-blue-900 text-white py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md uppercase">
            {t("contact.title")}
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("contact.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ================= 2. คอลัมน์ซ้าย: ข้อมูลการติดต่อ & แผนที่ ================= */}
          <div className="lg:col-span-2 space-y-8">
            {/* กล่องข้อมูลการติดต่อ */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 border-l-4 border-blue-600 pl-3">
                {t("contact.info_title")}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 mr-4">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {t("contact.address_label")}
                    </h3>
                    <p className="text-gray-600 mt-1 leading-relaxed">
                      {t("contact.address_val")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 mr-4">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {t("contact.phone_label")}
                    </h3>
                    <p className="text-gray-600 mt-1">038 210 170</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 mr-4">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {t("contact.email_label")}
                    </h3>
                    <p className="text-gray-600 mt-1">admin@nstct.co.th</p>
                  </div>
                </div>
              </div>
            </div>

            {/* แผนที่ Google Maps */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">
                {t("contact.map_title")}
              </h3>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-200">
                {/* ใส่พิกัดจำลองของ อมตะ ซิตี้ ชลบุรี */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3880.3407375162888!2d101.0685505750849!3d13.453081186908346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d373337ce2ba7%3A0xf8ff8b54d5959702!2sNST%20COIL%20CENTER%20(THAILAND)%20LTD.!5e0!3m2!1sen!2sth!4v1778148248008!5m2!1sen!2sth"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>

          {/* ================= 3. คอลัมน์ขวา: แบบฟอร์มส่งข้อความ ================= */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-md border border-gray-100 h-full flex flex-col">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-8 border-b border-gray-100 pb-4">
                {t("contact.form_title")}
              </h2>

              {isSubmitted && (
                <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center border border-green-200 animate-in fade-in slide-in-from-top-4">
                  <svg
                    className="w-6 h-6 mr-3 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    {t("contact.submit_success")}
                  </span>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-6 grow flex flex-col"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {t("contact.form_name")}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {t("contact.form_email")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t("contact.form_subject")}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2 grow">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t("contact.form_message")}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full h-150px px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none custom-scrollbar"
                  ></textarea>
                </div>

                {/* กล่องยืนยันตัวตน Cloudflare Turnstile */}
                <div className="flex justify-center bg-gray-50 py-4 rounded-xl border border-gray-100">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onError={() => setTurnstileToken("")}
                    onExpire={() => setTurnstileToken("")}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                  >
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    {t("contact.btn_submit")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* สไตล์ปรับแต่ง Scrollbar สำหรับ Textarea */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
}

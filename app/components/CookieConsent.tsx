"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

export default function CookieConsent() {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 💡 1. แอบเก็บ Log ว่ามีคนเข้าชมเว็บ (PAGE_VISIT) ทุกครั้งที่เปิดเว็บ
    // (ใส่ใน useEffect เพื่อให้มั่นใจว่าทำงานฝั่ง Client และมี object window)
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionType: "PAGE_VISIT",
        details: `Visited: ${window.location.pathname}`,
      }),
    }).catch(() => {}); // catch ไว้เงียบๆ ไม่ต้องให้ User รู้สึกถ้าเกิด Error

    // เช็คว่าผู้ใช้เคยตัดสินใจเรื่อง Cookie หรือยัง (เช็คจาก LocalStorage)
    const consent = localStorage.getItem("nstct_cookie_consent");
    if (!consent) {
      // ถ้ายังไม่เคย ให้หน่วงเวลา 1 วินาทีแล้วค่อยโชว์แบนเนอร์ขึ้นมา (เพื่อให้ดูนุ่มนวล)
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = async (choice: "accepted" | "declined") => {
    // 1. บันทึกลงในเครื่องผู้ใช้ (Browser) ว่าเลือกอะไรไปแล้ว จะได้ไม่โชว์อีก
    localStorage.setItem("nstct_cookie_consent", choice);
    setShowBanner(false); // ปิดแบนเนอร์ทันที

    // 2. ส่งข้อมูลไปเก็บที่ Backend (API + MSSQL) ตามที่มีการเลือก
    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType:
            choice === "accepted" ? "COOKIE_ACCEPT" : "COOKIE_DECLINE",
          details: `User ${choice} cookies on ${window.location.pathname}`,
        }),
      });
      console.log(`Cookie Consent Tracking: User has ${choice}`);
    } catch (error) {
      console.error("Failed to track cookie consent", error);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-9999 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* ข้อความและลิงก์ */}
        <div className="flex-1 text-sm md:text-base text-gray-700 leading-relaxed text-center md:text-left">
          <span className="mr-2 pr-2 border-r-2 border-blue-500 font-bold text-blue-900">
            🍪 Cookies
          </span>
          {t("cookie.message")}{" "}
          <Link
            href="/about/privacy-policy"
            className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition-colors whitespace-nowrap"
          >
            {t("cookie.policy_link")}
          </Link>
        </div>

        {/* ปุ่มกดยอมรับ / ปฏิเสธ */}
        <div className="flex shrink-0 gap-3 w-full md:w-auto">
          <button
            onClick={() => handleConsent("declined")}
            className="flex-1 md:flex-none px-6 py-2.5 border-2 border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors whitespace-nowrap"
          >
            {t("cookie.btn_decline")}
          </button>
          <button
            onClick={() => handleConsent("accepted")}
            className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            {t("cookie.btn_accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

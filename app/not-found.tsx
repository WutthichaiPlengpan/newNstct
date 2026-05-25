"use client";

import Link from "next/link";
import { useLanguage } from "./contexts/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {/* ตัวเลข 404 ขนาดใหญ่ */}
        <h1 className="text-7xl md:text-9xl font-bold text-blue-900 mb-4 opacity-20">
          404
        </h1>
        
        {/* ข้อความแจ้งเตือน */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          {t("not_found.title")}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {t("not_found.description")}
        </p>

        {/* ปุ่มกลับหน้าแรก */}
        <Link 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 shadow-md"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t("not_found.back_home")}
        </Link>
      </div>
    </div>
  );
}
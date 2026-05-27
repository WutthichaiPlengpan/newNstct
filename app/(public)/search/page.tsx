"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../contexts/LanguageContext";

export default function SearchResultsPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (q) {
      fetchResults();
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [q]);

  // ฟังก์ชันช่วยสร้างลิงก์ปลายทางตามประเภทข้อมูล
  const getLinkUrl = (type: string, id: number) => {
    switch (type) {
      case "news":
        return `/news/${id}`;
      case "activity":
        return `/activity/company`; // หรือไปหน้าอัลบั้ม
      case "job":
        return `/job`;
      case "policy":
        return `/about/quality-policy/${id}`;
      default:
        return `/`;
    }
  };

  // ฟังก์ชันช่วยแสดงชื่อประเภทข้อมูล (แปลภาษาได้ถ้าต้องการ)
  const getTypeName = (type: string) => {
    switch (type) {
      case "news":
        return "ข่าวสาร";
      case "activity":
        return "กิจกรรม";
      case "job":
        return "รับสมัครงาน";
      case "policy":
        return "นโยบาย";
      default:
        return "ข้อมูลทั่วไป";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header ของหน้าค้นหา */}
      <div className="bg-blue-900 text-white py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">ผลการค้นหา</h1>
        <p className="text-blue-200">
          คำค้นหา: <span className="font-bold text-white text-xl">"{q}"</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-10">
        {isLoading ? (
          <div className="text-center py-20 text-gray-500 font-medium">
            กำลังค้นหาข้อมูล...
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <p className="text-gray-600 font-medium mb-6">
              พบทั้งหมด {results.length} รายการ
            </p>

            {results.map((item, index) => (
              <Link
                href={getLinkUrl(item.Type, item.ID)}
                key={index}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow group"
              >
                {/* รูปภาพ (ถ้ามี) */}
                {item.ImageUrl ? (
                  <div className="w-full sm:w-48 h-32 relative rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <Image
                      src={item.ImageUrl}
                      alt={item.Title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-48 h-32 relative rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* รายละเอียด */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
                      {getTypeName(item.Type)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.Date).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {item.Title}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {item.Description?.replace(/<[^>]*>?/gm, "") ||
                      "ไม่มีรายละเอียดเพิ่มเติม"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              ไม่พบผลการค้นหา
            </h3>
            <p className="text-gray-500">
              ไม่พบข้อมูลที่ตรงกับคำว่า "{q}" ลองใช้คำค้นหาอื่นดูอีกครั้ง
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

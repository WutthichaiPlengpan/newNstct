"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link"; // 👈 นำเข้า Link สำหรับกดเข้าไปอ่านข่าว

export default function NewsPage() {
  const { t } = useLanguage();

  // สร้าง State สำหรับเก็บข้อมูลข่าวและสถานะการโหลด
  const [newsList, setNewsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลข่าวสารจาก Database ทันทีที่เปิดหน้าเว็บ
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/admin/news");
        const data = await res.json();
        if (data.success) {
          setNewsList(data.data);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            {t("menu.news") || "ข่าวสารและกิจกรรม"}
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {isLoading ? (
          // ระหว่างรอโหลดข้อมูล
          <div className="text-center text-gray-500 font-bold py-20">
            กำลังโหลดข่าวสาร...
          </div>
        ) : newsList.length > 0 ? (
          // โหลดเสร็จแล้ว และมีข่าว
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((news, index) => (
              <Link
                href={`/news/${news.NewsID}`}
                key={news.NewsID}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100 flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  {news.CoverImage ? (
                    <Image
                      src={news.CoverImage}
                      alt={news.Title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                      ไม่มีรูปภาพประกอบ
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col grow">
                  <div className="text-sm font-semibold text-blue-600 mb-2">
                    {/* จัดรูปแบบวันที่ให้เป็นภาษาไทย */}
                    {new Date(news.CreatedAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {news.Title}
                  </h2>
                  {/* แสดงเนื้อหาบางส่วน (ระบบจะตัดคำให้อัตโนมัติด้วย line-clamp-3) */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 grow">
                    {news.Content}
                  </p>

                  <span className="text-blue-600 font-medium text-sm inline-flex items-center mt-auto">
                    {t("types.read_more") || "อ่านเพิ่มเติม"}
                    <svg
                      className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // ถ้าไม่มีข่าวสารในระบบเลย
          <div className="text-center text-gray-500 py-20">
            ยังไม่มีข่าวสารหรือกิจกรรมในขณะนี้
          </div>
        )}
      </div>
    </div>
  );
}

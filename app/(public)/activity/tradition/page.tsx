"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function CompanyActivityPage() {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [albumImages, setAlbumImages] = useState<any[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    // 💡 โหลดเฉพาะกิจกรรมประเภท Company
    const fetchActivities = async () => {
      const res = await fetch("/api/admin/activities?category=tradition");
      const data = await res.json();
      if (data.success) setActivities(data.data);
      setIsLoading(false);
    };
    fetchActivities();
  }, []);

  const openAlbum = async (activity: any) => {
    setSelectedAlbum(activity);
    setCurrentPhotoIndex(0);
    // ดึงรูปภาพในอัลบั้มนั้นๆ
    const res = await fetch(
      `/api/admin/activities/images?activityId=${activity.ActivityID}`,
    );
    const data = await res.json();
    if (data.success) setAlbumImages(data.data);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % albumImages.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? albumImages.length - 1 : prev - 1,
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-16 md:py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t("activity.title_company")}
        </h1>
        <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
          {t("activity.subtitle")}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16">
        {isLoading ? (
          <p className="text-center text-gray-500 font-medium">
            กำลังโหลดข้อมูลกิจกรรม...
          </p>
        ) : activities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((activity) => (
              <div
                key={activity.ActivityID}
                onClick={() => openAlbum(activity)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl cursor-pointer group flex flex-col transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-4/3 bg-gray-200 relative overflow-hidden">
                  {activity.CoverImage ? (
                    <Image
                      src={activity.CoverImage}
                      alt={activity.Title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      ไม่มีรูปภาพ
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {activity.PhotoCount} รูป
                  </div>
                </div>

                <div className="p-5 flex flex-col grow">
                  <p className="text-blue-600 text-xs font-bold mb-2">
                    {new Date(activity.ActivityDate).toLocaleDateString(
                      "th-TH",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
                    {activity.Title}
                  </h3>

                  {/* 💡 เพิ่มการแสดงรายละเอียดบนการ์ดแบบพรีวิวสั้นๆ */}
                  {activity.Description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-auto">
                      {activity.Description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-xl font-medium">ยังไม่มีกิจกรรมในหมวดหมู่นี้</p>
          </div>
        )}
      </div>

      {/* Album Modal */}
      {selectedAlbum && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedAlbum(null)}
        >
          <button
            className="absolute top-4 right-4 md:top-6 md:right-6 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
            onClick={() => setSelectedAlbum(null)}
            title="ปิดหน้าต่าง"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8"
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

          <div
            className="relative w-full max-w-6xl px-4 flex flex-col items-center justify-center h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 💡 ข้อมูลและรายละเอียดกิจกรรมใน Modal */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 text-white z-50 drop-shadow-lg max-w-2xl bg-linear-to-r from-black/80 to-transparent p-4 rounded-xl pointer-events-none">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                {selectedAlbum.Title}
              </h2>

              {selectedAlbum.Description && (
                <p className="text-sm md:text-base text-gray-300 mt-3 whitespace-pre-wrap line-clamp-3 md:line-clamp-none">
                  {selectedAlbum.Description}
                </p>
              )}

              <div className="mt-4 inline-flex items-center bg-blue-600/80 px-3 py-1 rounded-full text-sm font-semibold">
                <svg
                  className="w-4 h-4 mr-2"
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
                {albumImages.length > 0
                  ? `ภาพที่ ${currentPhotoIndex + 1} จากทั้งหมด ${albumImages.length} ภาพ`
                  : "ยังไม่มีรูปภาพในอัลบั้มนี้"}
              </div>
            </div>

            {albumImages.length > 0 ? (
              <div className="relative w-full aspect-video md:aspect-video flex items-center justify-center mt-12 md:mt-0">
                <Image
                  src={albumImages[currentPhotoIndex].ImageUrl}
                  alt={selectedAlbum.Title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            ) : (
              <div className="text-gray-500 flex flex-col items-center">
                <svg
                  className="w-16 h-16 mb-4 opacity-50"
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
                <p className="text-xl">ผู้ดูแลระบบยังไม่ได้อัปโหลดรูปภาพ</p>
              </div>
            )}

            {/* ปุ่มนำทางซ้าย-ขวา */}
            {albumImages.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 md:p-5 rounded-full backdrop-blur-sm transition-all shadow-lg"
                >
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 md:p-5 rounded-full backdrop-blur-sm transition-all shadow-lg"
                >
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

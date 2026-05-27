"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

interface NewsItem {
  NewsID: number;
  Title: string;
  Content: string;
  CoverImage: string | null;
  Images: string | null;
  VideoUrl: string | null;
  Status: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  employeeID: number;
}

interface AlbumImage {
  ImageUrl: string;
}

interface SelectedAlbum {
  title: string;
  discription: string;
  images: AlbumImage[];
}

export default function Home() {
  const { t } = useLanguage();

  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const [selectedAlbum, setSelectedAlbum] = useState<SelectedAlbum | null>(
    null,
  );

  const serviceImages: string[] = [
    "/services/Image_cawbo6ca.png", // รูปสำหรับบริการที่ 1
    "/products/SteelSheet.png", // รูปสำหรับบริการที่ 2
  ];

  const slides: string[] = [
    "/slides/slide-1.png",
    "/slides/slide-2.png",
    "/slides/slide-3.png",
    "/slides/slide-4.png",
  ];

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const AWARDS = [
    {
      id: 1,
      image: "/awards/image_1779268318219532.png",
      title: "SUPPLIER QUALITY AWARD 2024",
      discription: "ได้รับรางวัล Best Supplier Quality Award ประจำปี 2024 จาก Daikin",
    },
    {
      id: 2,
      image: "/awards/image_1779268600634994.png",
      title: "BEST SUPPLIER AWARD 2020",
      discription: "ได้รับรางวัล Best Supplier Award ประจำปี 2020 จาก Daikin",
    },
    {
      id: 3,
      image: "/awards/image_1779269276644598.png",
      title: "GOOD SUPPLIER AWARD 2016",
      discription: "ได้รับรางวัล Good Supplier Award ประจำปี 2016 จาก Daikin",
    },
    {
      id: 4,
      image: "/awards/image_1779269015861755.png",
      title: "DAIKIN QUALITY AWARD 2012",
      discription: "ได้รับรางวัล Quality Award 2012 Best For SB Coil Center (Thailand) LTD.,",
    },
    {
      id: 5,
      image: "/awards/image_1779268902926177.png",
      title: "BEST SUPPLIER AWARD 2013",
      discription: "ได้รับรางวัล Best Supplier Award ประจำปี 2013 จาก Exedy",
    },
    {
      id: 6,
      image: "/awards/image_1779269470809727.png",
      title: "BEST SUPPLIER AWARD 2012",
      discription: "ด้รับรางวัล Best Supplier Award ประจำปี 2012 จาก Exedy ",
    },
    {
      id: 7,
      image: "/awards/image_1779269139288932.png",
      title: "BAST DELIVERY AWARD 2010",
      discription: "ได้รับรางวัล Bast Delivery Award 2010 (100% Time) จาก Hirata Engineering",
    },
    {
      id: 8,
      image: "/awards/image_1779269470809725.png",
      title: "BEST QUALITY AWARD 2009",
      discription: "ได้รับรางวัล  Bast Quality Award 2009 (Material) จาก Hirata Engineering ",
    },
    {
      id: 9,
      image: "/awards/image_1779269470809729.png",
      title: "BEST QCD COOPERATION 2013",
      discription: "ได้รับรางวัล best QCD Cooperation 2013 จาก Mitsui",
    },
    {
      id: 10,
      image: "/awards/image_1779269470809726.png",
      title: "เหรียญเงินจากกระทรวงแรงงาน 2567 (2024)",
      discription: "ได้รับรางวัล เหรียญเงินจากกระทรวงแรงงาน เกี่ยวกับการรณรงค์ลดอุบัติเหตุจากการทำงานเป็นศูนย์ ปีพ.ศ.2567",
    },
    {
      id: 11,
      image: "/awards/image_1779269470809728.png",
      title: "เหรียญทองแดงจากกระทรวงแรงงาน 2565 (2022)",
      discription: "ได้รับรางวัล เหรียญทองแดงจากกระทรวงแรงงาน เกี่ยวกับการรณรงค์ลดอุบัติเหตุจากการทำงานเป็นศูนย์ ปีพ.ศ.2565",
    },
    {
      id: 12,
      image: "/awards/image_1779268441344042.png",
      title: "รางวัลผลการประเมินโรงงาน",
      discription: "ได้รับรางวัล จากจังหวัดชลบุรีเกี่ยวกับผลการผ่านการประเมินมาตราฐานโรงานสีขาว ",
    },
  ];
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

  const recentNews = useMemo(() => {
    return newsList.slice(0, 3);
  }, [newsList]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* ================= 1. ภาพสไลด์โชว์ ================= */}
      <section className="w-full h-[40vh] md:h-[60vh] lg:h-[70vh] relative bg-gray-200 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={slide}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
              <span className="text-2xl text-gray-500 font-bold">
                ภาพสไลด์โชว์ {index + 1}
              </span>
            </div> */}
          </div>
        ))}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-blue-600 w-8" : "bg-white/70 hover:bg-white"}`}
            />
          ))}
        </div>
      </section>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* ================= 2. ส่วนเกี่ยวกับเรา (Intro) ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="aspect-4/3 relative bg-gray-200 rounded-lg overflow-hidden shadow-md group">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-500">
              <Image
                src="/17549c96.png"
                alt="NST Coil Center"
                fill
                className="object-cover" // 💡 แนะนำให้เพิ่ม object-cover ด้วยครับ รูปจะได้ไม่เบี้ยว
                sizes="(max-width: 768px) 100vw, 50vw" // 👈 1. เพิ่ม sizes
                priority // 👈 2. เพิ่ม priority
              />
            </div>
          </div>
          <div className="bg-gray-100 p-8 md:p-12 rounded-lg h-full flex flex-col justify-center shadow-sm">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              {t("home.intro_title")}
            </h2>
            <p className="text-gray-600 mb-8">{t("home.intro_subtitle")}</p>
            <h3 className="text-2xl font-semibold text-blue-800 mb-2">
              {t("home.intro_goal")}
            </h3>
            <p className="text-xl text-gray-700 italic font-medium">
              {t("home.intro_goal_desc")}
            </p>
          </div>
        </section>

        {/* ================= 3. บริการ (Services) ================= */}
        <section>
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12 uppercase">
            {t("home.services_title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 ">
            {/* 💡 เพิ่มพารามิเตอร์ index เพื่อนำไปใช้ดึงรูปภาพจาก Array */}
            {[1, 2].map((item, index) => (
              <div
                key={item}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 group cursor-pointer border border-gray-100"
              >
                <div className="aspect-video relative bg-gray-200 overflow-hidden">
                 
                  <Image
                    src={serviceImages[index]}
                    alt={`Service ${item}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {item === 1
                      ? t("home.service_1")
                      : item === 2
                        ? t("home.service_2")
                        : `บริการที่ ${item}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item === 1
                      ? t("home.service_1_desc")
                      : item === 2
                        ? t("home.service_2_desc")
                        : "รายละเอียดบริการ..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 4. ส่วนถ้วยรางวัลและความสำเร็จ ================= */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-blue-900 mb-2 uppercase">
              {t("home.awards_title")}
            </h2>
            <p className="text-center text-gray-500 mb-12">
              {t("home.awards_desc")}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-12">
              {AWARDS.map((award) => (
                <div
                  key={award.id}
                  onClick={() =>
                    setSelectedAlbum({
                      title: award.title,
                      discription: award.discription,
                      images: [{ ImageUrl: award.image }],
                    })
                  }
                  className="group bg-white rounded-2xl border border-gray-100 p-2 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl">
                    <Image
                      src={award.image}
                      alt={award.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                    {/* Overlay สวยๆ */}
                    <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 p-2 rounded-full text-blue-900 shadow-lg">
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1 group-hover:text-blue-600">
                      {award.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {award.discription}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {selectedAlbum && (
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
            onClick={() => setSelectedAlbum(null)}
          >
            <button
              className="absolute top-6 right-6 z-110 bg-white text-black p-2 rounded-full hover:bg-gray-200"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <Image
                  src={selectedAlbum.images[0].ImageUrl}
                  alt={selectedAlbum.title}
                  
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              <div className="p-4 text-center font-bold text-lg">
                {selectedAlbum.title}
                <p className="text-base font-light">{selectedAlbum.discription}</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. ข่าวสารล่าสุด (Latest News) ================= */}
        <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-blue-900 uppercase">
                  {t("menu.news") || "ข่าวสารล่าสุด"}
                </h2>
                <div className="w-16 h-1 bg-blue-600 mt-2 rounded-full"></div>
              </div>
              <Link
                href="/news"
                className="hidden sm:inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                {t("home.news_all") || "ดูข่าวทั้งหมด"}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center text-gray-400 font-medium py-10">
                กำลังโหลดข่าวสารล่าสุด...
              </div>
            ) : recentNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {recentNews.map((news) => (
                  <Link
                    href={`/news/${news.NewsID}`}
                    key={news.NewsID}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100 flex flex-col h-full"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {news.CoverImage ? (
                        <Image
                          src={news.CoverImage}
                          alt={news.Title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          loading="eager"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                          ไม่มีรูปภาพประกอบ
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {new Date(news.CreatedAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {news.Title}
                      </h3>
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
              <div className="text-center text-gray-400 py-10">
                ไม่มีข้อมูลข่าวสารในขณะนี้
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/news"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                {t("home.news_all") || "ดูข่าวทั้งหมด"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

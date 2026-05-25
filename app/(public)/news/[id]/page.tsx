"use client";

import React, { useEffect, useState } from "react"; // 👈 เพิ่ม React เข้ามา
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../contexts/LanguageContext";
import Swal from "sweetalert2"; // 👈 นำเข้า SweetAlert2

// ปรับแต่งประเภทตัวแปรให้ params รองรับ Promise ตามมาตรฐาน Next.js ใหม่
export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [news, setNews] = useState<any>(null);

  // 💡 คลายปม Promise ของ params ด้วย React.use()
  const unwrappedParams = React.use(params);
  const newsId = unwrappedParams.id;

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const res = await fetch("/api/admin/news");
        const data = await res.json();
        if (data.success) {
          const found = data.data.find(
            (n: any) => n.NewsID === parseInt(newsId),
          );
          if (found) {
            found.imageArray = found.Images ? JSON.parse(found.Images) : [];
            setNews(found);
          } else {
            // 💡 ใช้ SweetAlert2 แจ้งเตือนเมื่อไม่พบข่าว แล้วเตะกลับหน้าหลัก
            Swal.fire({
              title: "ไม่พบข้อมูลข่าวสาร",
              text: "ข่าวสารนี้อาจถูกลบหรือไม่มีอยู่ในระบบ",
              icon: "error",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "ตกลง",
            }).then(() => {
              router.push("/news");
            });
          }
        }
      } catch (err) {
        console.error(err);
        Swal.fire(
          "เกิดข้อผิดพลาด",
          "ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้",
          "error",
        );
      }
    };
    fetchNewsDetail();
  }, [newsId, router]);

  if (!news)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    );

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const embedUrl = news.VideoUrl ? getYoutubeEmbedUrl(news.VideoUrl) : null;

  return (
    <div className="w-full min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <span className="text-blue-600 font-bold mb-2 block">
            {new Date(news.CreatedAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {news.Title}
          </h1>
        </div>

        {/* รูปปกใหญ่ */}
        {news.CoverImage && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-10">
            <Image
              src={news.CoverImage}
              alt={news.Title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {/* เนื้อหาข่าว */}
        <div className="prose max-w-none text-gray-700 text-lg whitespace-pre-line mb-16">
          {news.Content}
        </div>

        <hr className="my-10 border-gray-200" />

        {/* วิดีโอ */}
        {embedUrl && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">
              วิดีโอที่เกี่ยวข้อง
            </h3>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
              <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* แกลเลอรีรูปภาพ */}
        {news.imageArray && news.imageArray.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-blue-900 mb-6">
              อัลบั้มภาพกิจกรรม
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {news.imageArray.map((imgUrl: string, idx: number) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:scale-[1.02] duration-300"
                >
                  <Image
                    src={imgUrl}
                    alt={`Gallery ${idx + 1}`}
                    fill
                    className="object-cover"
                    // 💡 แก้ไขจุดที่ 2: ขนาดภาพแกลเลอรีที่แชร์พื้นที่ในตาราง 2 คอลัมน์บนมือถือ และ 3 คอลัมน์บนจอใหญ่
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

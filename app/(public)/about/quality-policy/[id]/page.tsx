"use client";

import { useLanguage } from "../../../../contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PolicyItem {
  PolicyID: number;
  Title: string;
  Content: string;
  PdfPath: string;
}

export default function QualityPolicyDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [policy, setPolicy] = useState<PolicyItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolicy() {
      try {
        const res = await fetch(`/api/policies/${id}`);
        const data = await res.json();
        if (data.success) {
          setPolicy(data.data);
        }
      } catch (error) {
        console.error("Fetch policy error:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPolicy();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          ไม่พบข้อมูลนโยบาย
        </h1>
        <Link
          href="/about/quality-policy"
          className="text-blue-600 hover:underline"
        >
          {t("quality_policy.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white pb-24">
      {/* 💡 Header / Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link
            href="/about/quality-policy"
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t("quality_policy.back")}
          </Link>

          {/* 💡 ถ้ามีไฟล์ PDF ให้แสดงปุ่มดาวน์โหลดที่ Header ด้วย */}
          {policy.PdfPath && (
            <a
              href={`/api/download/${policy.PdfPath.split("/").pop()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors text-sm"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {t("quality_policy.download_pdf")}
            </a>
          )}
        </div>
      </div>

      {/* 💡 Content Reading Area */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <header className="mb-12 border-b border-gray-100 pb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {policy.Title}
          </h1>
          <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
        </header>

        {/* 🛡️ พื้นที่แสดง HTML จาก ReactQuill */}
        <div className="w-full overflow-x-auto pb-4">
          <div
            className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed 
                       prose-headings:text-blue-900 prose-headings:font-bold prose-a:text-blue-600 prose-a:break-words
                       prose-li:marker:text-blue-500 prose-img:max-w-full prose-img:h-auto prose-img:rounded-xl
                       break-words"
            dangerouslySetInnerHTML={{ __html: policy.Content }}
          />
        </div>

        {/* 💡 ปุ่มดาวน์โหลดไฟล์ PDF แสดงเด่นๆ ด้านล่างสุด */}
        {policy.PdfPath && (
          <div className="mt-16 pt-8 border-t border-gray-100 flex justify-center">
            <a
              href={`/api/download/${policy.PdfPath.split("/").pop()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-1 transition-all"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {t("quality_policy.download_pdf")}
            </a>
          </div>
        )}
      </article>
    </div>
  );
}

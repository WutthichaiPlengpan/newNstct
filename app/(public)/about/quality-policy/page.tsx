"use client";

import { useLanguage } from "../../../contexts/LanguageContext";
import { useEffect, useState } from "react";
import Link from "next/link"; // 💡 นำเข้า Link สำหรับเปลี่ยนหน้า

interface PolicyItem {
  PolicyID: number;
  Title: string;
  Summary: string;
  Content: string;
  PdfPath: string;
}

export default function QualityPolicyPage() {
  const { t } = useLanguage();
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const res = await fetch("/api/policies");
        const data = await res.json();
        if (data.success) setPolicies(data.data);
      } catch (error) {
        console.error("Fetch policies error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPolicies();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-24">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20 md:py-28 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight drop-shadow-md">
            {t("quality_policy.title")}
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            {t("quality_policy.subtitle")}
          </p>
        </div>
      </div>

      {/* Policy List Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 shadow-sm border border-gray-100 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : policies.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
            {t("quality_policy.no_data")}
          </div>
        ) : (
          <div className="space-y-6">
            {policies.map((policy) => (
              <div
                key={policy.PolicyID}
                className="bg-white p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {policy.Title}
                    </h2>
                  </div>
                  <p className="text-gray-500 text-sm md:text-base line-clamp-2 md:pl-13 leading-relaxed">
                    {policy.Summary}
                  </p>
                </div>

                {/* 💡 เปลี่ยนปุ่มธรรมดา เป็นแท็ก Link เพื่อเปิดหน้าใหม่ */}
                <Link
                  href={`/about/quality-policy/${policy.PolicyID}`}
                  className="px-6 py-3 bg-white border-2 border-blue-100 text-blue-600 font-bold rounded-2xl group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all text-sm shrink-0 w-full md:w-auto text-center flex justify-center items-center gap-2"
                >
                  {t("quality_policy.read_more")}
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

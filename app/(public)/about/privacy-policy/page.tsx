"use client";

import { useLanguage } from "../../../contexts/LanguageContext";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  // สร้าง Array 1 ถึง 11 เพื่อวนลูปดึงข้อมูลจาก JSON
  const sections = Array.from({ length: 11 }, (_, i) => i + 1);

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      
      {/* ================= ส่วนหัว (Hero Section) ================= */}
      <div className="bg-blue-900 text-white py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">
            {t("privacy_policy.title")}
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("privacy_policy.subtitle")}
          </p>
        </div>
      </div>

      {/* ================= ส่วนเนื้อหา (Official Document Layout) ================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white p-8 md:p-14 rounded-2xl shadow-sm border border-gray-100">
          
          {/* Intro Paragraph */}
          <p className="text-lg text-gray-700 leading-relaxed mb-10 pb-8 border-b border-gray-200 font-medium">
            {t("privacy_policy.intro")}
          </p>

          <div className="space-y-10">
            {/* วนลูปแสดงผลข้อ 1 ถึง 11 */}
            {sections.map((num) => (
              <div key={num} className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-blue-900">
                  {t(`privacy_policy.sec_${num}_title`)}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {/* whitespace-pre-line ช่วยให้ข้อ 11 ที่มี \n ตัดบรรทัดได้จริง */}
                  {t(`privacy_policy.sec_${num}_desc`)}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
"use client";

import { useLanguage } from "../../../contexts/LanguageContext";

export default function QualityPolicyPage() {
  const { t } = useLanguage();

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      
      {/* ================= 1. ส่วนหัว (Hero Section) ================= */}
      <div className="bg-blue-900 text-white py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
            {t("quality_policy.title")}
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("quality_policy.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {/* จัดวาง 2 กล่องคู่กันบน Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* ================= 2. กล่องนโยบายคุณภาพ (Quality) ================= */}
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
            {/* ไอคอนตกแต่ง */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-32 h-32 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
                {t("quality_policy.quality_heading")}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 font-medium">
                {t("quality_policy.quality_desc")}
              </p>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">✔</span>
                  <span>{t("quality_policy.q_list_1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">✔</span>
                  <span>{t("quality_policy.q_list_2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">✔</span>
                  <span>{t("quality_policy.q_list_3")}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ================= 3. กล่องนโยบายสิ่งแวดล้อม (Environment) ================= */}
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
            {/* ไอคอนตกแต่ง */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-32 h-32 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.0501C12 21.0501 5 15.0501 5 9.05011C5 5.18412 8.13401 2.05011 12 2.05011C15.866 2.05011 19 5.18412 19 9.05011C19 15.0501 12 21.0501 12 21.0501ZM12 11.0501C13.1046 11.0501 14 10.1547 14 9.05011C14 7.94554 13.1046 7.05011 12 7.05011C10.8954 7.05011 10 7.94554 10 9.05011C10 10.1547 10.8954 11.0501 12 11.0501Z" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-green-100">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
                {t("quality_policy.env_heading")}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 font-medium">
                {t("quality_policy.env_desc")}
              </p>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✔</span>
                  <span>{t("quality_policy.e_list_1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✔</span>
                  <span>{t("quality_policy.e_list_2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✔</span>
                  <span>{t("quality_policy.e_list_3")}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
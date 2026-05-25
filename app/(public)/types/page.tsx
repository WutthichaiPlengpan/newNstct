"use client";

import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function SteelTypesPage() {
  const { t } = useLanguage();

  // State สำหรับเก็บข้อมูลชนิดเหล็กที่ถูกคลิกเพื่อเปิด Modal
  const [selectedType, setSelectedType] = useState<{ id: string; titleKey: string; descKey: string } | null>(null);

  // Array ข้อมูลชนิดเหล็ก อ้างอิง Key จากไฟล์ JSON
  const steelTypes = [
    { id: "hot_rolled", titleKey: "hot_rolled", descKey: "hot_rolled_desc", color: "bg-orange-50", iconText: "HR" },
    { id: "cold_rolled", titleKey: "cold_rolled", descKey: "cold_rolled_desc", color: "bg-blue-50", iconText: "CR" },
    { id: "galvanize", titleKey: "galvanize", descKey: "galvanize_desc", color: "bg-slate-100", iconText: "GI" },
    { id: "electro_galv", titleKey: "electro_galv", descKey: "electro_galv_desc", color: "bg-cyan-50", iconText: "EG" },
    { id: "aluminized", titleKey: "aluminized", descKey: "aluminized_desc", color: "bg-gray-100", iconText: "AL" },
    { id: "stainless", titleKey: "stainless", descKey: "stainless_desc", color: "bg-zinc-100", iconText: "SUS" },
    { id: "aluminum", titleKey: "aluminum", descKey: "aluminum_desc", color: "bg-sky-50", iconText: "ALU" },
    { id: "color_steel", titleKey: "color_steel", descKey: "color_steel_desc", color: "bg-rose-50", iconText: "CS" },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      
      {/* ================= ส่วนหัว (Hero Section) ================= */}
      <div className="bg-blue-900 text-white py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md uppercase">
            {t("types.title")}
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("types.subtitle")}
          </p>
        </div>
      </div>

      {/* ================= Grid ส่วนแสดงข้อมูลชนิดเหล็ก ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {steelTypes.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedType(item)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              {/* ไอคอน / ตัวย่อชนิดเหล็ก */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-blue-900 mb-6 ${item.color} group-hover:scale-110 transition-transform`}>
                {item.iconText}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                {t(`types.${item.titleKey}`)}
              </h3>
              
              {/* แสดงตัวอย่างข้อความสั้นๆ 3 บรรทัด (line-clamp-3) */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex line-clamp-3">
                {t(`types.${item.descKey}`)}
              </p>

              {/* ปุ่มอ่านต่อ (หลอก) เพื่อชี้เป้าให้กด */}
              <div className="mt-auto flex items-center text-blue-600 text-sm font-semibold group-hover:text-blue-800">
                <span>{t("types.read_more")}</span>
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ================= Modal อ่านรายละเอียดฉบับเต็ม ================= */}
      {selectedType && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedType(null)} 
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header ของ Modal */}
            <div className={`px-6 py-8 relative ${steelTypes.find(t => t.id === selectedType.id)?.color || 'bg-gray-100'}`}>
               <button 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white text-gray-800 rounded-full transition-colors"
                onClick={() => setSelectedType(null)}
               >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
               <h2 className="text-2xl md:text-3xl font-bold text-blue-900 pr-8">
                 {t(`types.${selectedType.titleKey}`)}
               </h2>
            </div>
            
            {/* เนื้อหาฉบับเต็ม แบบ Scroll ได้ถ้าข้อความยาว */}
            <div className="p-6 md:p-8 overflow-y-auto">
              <p className="text-gray-700 leading-loose text-lg whitespace-pre-line">
                {t(`types.${selectedType.descKey}`)}
              </p>
            </div>
            
            {/* Footer ของ Modal */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button 
                onClick={() => setSelectedType(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t("types.close")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
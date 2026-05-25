"use client";

import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import Image from "next/image"; // นำออกคอมเมนต์เมื่อมีรูปจริง

// ข้อมูลเครื่องจักรทั้งหมด 15 เครื่อง
const machinesData = [
  {
    id: 1,
    name: "SLITTING LINE 01",
    imgSrc: "/machines/SL01.png",
    specs: [
      { label: "SYSTEM", value: "DRIVE CUT & PULLCUT" },
      { label: "MATERIAL", value: "CR, EG,GI,GA,ALS, ST, HR- P/O" },
      { label: "THICKNESS", value: "0.30 ~ 3.2 MM." },
      { label: "COIL WIDTH (INPUT)", value: "400 ~ 1,300 MM." },
      { label: "COIL WEIGHT (INPUT)", value: "15,000 KGS." },
      { label: "COIL ID (INPUT)", value: "508 - 610 MM." },
      { label: "COIL OD (INPUT)", value: "600 - 1,800 MM." },
      { label: "STRIP WIDTH (OUTPUT)", value: "20.2 ~ 1,300 MM." },
      { label: "STRIP ID (OUTPUT)", value: "508 MM." },
      { label: "STRIP OD (OUTPUT)", value: "1,800 MM." },
      { label: "STRIP WEIGHT (OUTPUT)", value: "15,000 KG." },
      { label: "TOLERANCE", value: "± 0.1 MM." },
      { label: "LINE SPEED", value: "140 M/min" },
    ]
  },
  {
    id: 2,
    name: "SLITTING LINE 02",
    imgSrc: "/machines/SL02.png",
    specs: [
      { label: "SYSTEM", value: "DRIVE CUT & PULLCUT" },
      { label: "MATERIAL", value: "CR,GI, GA, ST, HR" },
      { label: "THICKNESS", value: "1.2 ~ 6.5 MM." },
      { label: "COIL WIDTH (INPUT)", value: "600 ~ 1,600 MM." },
      { label: "COIL WEIGHT (INPUT)", value: "20,000 KGS." },
      { label: "COIL ID (INPUT)", value: "508 - 762 MM." },
      { label: "COIL OD (INPUT)", value: "1,800 MM." },
      { label: "STRIP WIDTH (OUTPUT)", value: "40 ~ 1,600 MM." },
      { label: "STRIP ID (OUTPUT)", value: "508 MM." },
      { label: "STRIP OD (OUTPUT)", value: "1,800 MM." },
      { label: "STRIP WEIGHT (OUTPUT)", value: "20,000 KG." },
      { label: "TOLERANCE", value: "± 0.2 MM." },
      { label: "LINE SPEED", value: "120 M/min" },
    ]
  },
  {
    id: 3,
    name: "LEVELLER LINE 01",
    imgSrc: "/machines/LV01.png",
    specs: [
      { label: "MATERIAL", value: "CR, EG,GI,GA,ALS, ST, HR- P/O" },
      { label: "THICKNESS", value: "0.30 ~ 2.3 MM." },
      { label: "WIDTH", value: "300 - 1,250 MM" },
      { label: "LENGHT", value: "200 - 3,100 MM." },
      { label: "LINE SPEED", value: "140 M/min" },
      { label: "WEIGHT", value: "15,000 KGS." },
      { label: "ID", value: "508, 610 MM." },
      { label: "OD", value: "700 - 1,800 MM." },
      { label: "TOLERANCE", value: "± 0.3 MM." },
    ]
  },
  {
    id: 4,
    name: "LEVELLER LINE 02",
    imgSrc: "/machines/LV02.png",
    specs: [
      { label: "MATERIAL", value: "EG,GI,PCM, SUS, AL, Oilless" },
      { label: "THICKNESS", value: "0.2 ~ 1.6 MM." },
      { label: "WIDTH", value: "400 - 1,300 MM" },
      { label: "LENGHT", value: "300 - 2,500 MM." },
      { label: "LINE SPEED", value: "140 M/min" },
      { label: "WEIGHT", value: "20,000 KGS." },
      { label: "ID", value: "508, 610 MM." },
      { label: "OD", value: "1,800 MM." },
      { label: "TOLERANCE", value: "± 0.3 MM." },
    ]
  },
  {
    id: 5,
    name: "MINI LEVELLER LINE",
    imgSrc: "/machines/ML01.png",
    specs: [
      { label: "MATERIAL", value: "CR, EG,GI,GA,ALS, ST, HR- P/O" },
      { label: "THICKNESS", value: "0.30 ~ 2.3 MM." },
      { label: "WIDTH", value: "100 - 850 MM" },
      { label: "LENGHT", value: "150 - 1,820 MM." },
      { label: "LINE SPEED", value: "70 M/min" },
      { label: "WEIGHT", value: "7,000 KGS ." },
      { label: "ID", value: "508, 610 MM." },
      { label: "OD", value: "700 - 1,500 MM." },
      { label: "TOLERANCE", value: "± 0.2 MM." },
    ]
  },
  {
    id: 6,
    name: "RESHEARING LINE",
    imgSrc: "/machines/SH01.png",
    specs: [
      { label: "MATERIAL", value: "CR, ST, PO, EG, GI, GA, AL, HR" },
      { label: "THICKNESS", value: "3.2 ~ 6.5 MM." },
      { label: "WIDTH", value: "40 ~ 1600 MM" },
      { label: "LENGTH", value: "40 ~ 1280 MM" },
      { label: "YILL LOST (LENGTH)", value: "10" },
      { label: "TOLERANCE", value: "± 0.3 MM." },
    ]
  },
  {
    id: 7,
    name: "BLANK LEVELLER LINE 01",
    imgSrc: "/machines/BL01.png",
    specs: [
      { label: "MATERIAL", value: "CR, EG,GI,GA,ALS, ST, HR- P/O" },
      { label: "THICKNESS", value: "0.30 ~ 3.2 MM." },
      { label: "WIDTH", value: "50 - 200 MM" },
      { label: "LENGHT", value: "50 - 3,000 MM." },
      { label: "LINE SPEED", value: "16 M/min" },
      { label: "WEIGHT", value: "2,000 KGS." },
      { label: "ID", value: "508 - 610 MM." },
      { label: "OD", value: "600 - 1,300 MM." },
      { label: "TOLERANCE", value: "± 0.5 MM." },
    ]
  },
  {
    id: 8,
    name: "BLANK LEVELLER LINE 02",
    imgSrc: "/machines/BL02.png",
    specs: [
      { label: "MATERIAL", value: "CR, EG,GI,GA,ALS, ST, HR- P/O" },
      { label: "THICKNESS", value: "0.5 ~ 6.0 MM." },
      { label: "WIDTH", value: "50 - 200 MM" },
      { label: "LINE SPEED", value: "16 M/min" },
      { label: "WEIGHT", value: "2,000 KGS." },
      { label: "ID", value: "460 - 520 MM." },
      { label: "OD", value: "max 1400 MM." },
    ]
  },
  {
    id: 9,
    name: "BLANK LEVELLER LINE 03",
    imgSrc: "/machines/BL03.png",
    specs: [
      { label: "MATERIAL", value: "CR, EG,GI,GA,AL, ST, HR- P/O" },
      { label: "THICKNESS", value: "0.30 ~ 3.2 MM." },
      { label: "WIDTH", value: "50 - 500 MM" },
      { label: "LENGHT", value: "130 - 1,800 MM." },
      { label: "LINE SPEED", value: "16 M/min" },
      { label: "WEIGHT", value: "3,000 KGS." },
      { label: "ID", value: "460 - 520 MM." },
      { label: "OD", value: "600 - 1,300 MM." },
      { label: "TOLERANCE", value: "± 0.3 MM." },
    ]
  },
  {
    id: 10,
    name: "BLANK LEVELLER LINE 04",
    imgSrc: "/machines/BL04.png",
    specs: [
      { label: "MATERIAL", value: "CR, P/O" },
      { label: "THICKNESS", value: "1.50 ~ 8.0 MM." },
      { label: "WIDTH", value: "150 - 500 MM" },
      { label: "LENGHT", value: "150 - 1,450 MM." },
      { label: "LINE SPEED", value: "16 M/min" },
      { label: "WEIGHT", value: "5,000 KGS." },
      { label: "ID", value: "508 MM." },
      { label: "OD", value: "800 - 1,500 MM." },
      { label: "TOLERANCE", value: "± 0.3 MM." },
    ]
  },
  {
    id: 11,
    name: "BLANK LEVELLER LINE 05",
    imgSrc: "/machines/BL05.png",
    specs: [
      { label: "MATERIAL", value: "CR, HR, P/O, EG, GI, GA, AL" },
      { label: "THICKNESS", value: "0.3 ~ 3.2 MM." },
      { label: "WIDTH", value: "20 - 200 MM" },
      { label: "LENGHT", value: "60 - 1,800 MM." },
      { label: "LINE SPEED", value: "16 M/min" },
      { label: "WEIGHT", value: "2,000 KGS." },
      { label: "ID", value: "460 - 520 MM." },
      { label: "OD", value: "600 - 1,300 MM." },
      { label: "TOLERANCE", value: "± 0.3 MM." },
    ]
  },
  {
    id: 12,
    name: "BLANK LEVELLER LINE 06",
    imgSrc: "/machines/BL06.png",
    specs: [
      { label: "MATERIAL", value: "CR, HR, P/O, EG, GI, GA, AL" },
      { label: "THICKNESS", value: "0.3 ~ 3.2 MM." },
      { label: "WIDTH", value: "20 - 200 MM" },
      { label: "LENGHT", value: "60 - 1,800 MM." },
      { label: "LINE SPEED", value: "16 M/min" },
      { label: "WEIGHT", value: "2,000 KGS." },
      { label: "ID", value: "460 - 520 MM." },
      { label: "OD", value: "600 - 1,300 MM." },
      { label: "TOLERANCE", value: "± 0.3 MM." },
    ]
  },
  {
    id: 13,
    name: "BLANKING PRESS MACHINE 01",
    imgSrc: "/machines/800T.png",
    specs: [
      { label: "MATERIAL", value: "CR,HR,High-Tensile,Others" },
      { label: "THICKNESS", value: "1.6 ~ 6.0 MM." },
      { label: "WIDTH", value: "300 ~ 1600 MM" },
      { label: "SPEED", value: "80 spm (Stroke Per Minuits)" },
      { label: "WEIGHT", value: "800 TON(MAX)." },
      { label: "ID", value: "508 - 610 MM." },
      { label: "OD", value: "700 - 1800 MM." },
      { label: "CAPACITY", value: "8000 kN" },
      { label: "SLIDE STROKE", value: "300 MM" },
      { label: "DIE HEIGHT", value: "1250 MM." },
      { label: "SLIDE ADJUSTMENT STROKE", value: "350 MM." },
      { label: "STROKES", value: "15-80 spm." },
    ]
  },
  {
    id: 14,
    name: "BLANKING PRESS MACHINE 02",
    imgSrc: "/machines/1000T.png",
    specs: [
      { label: "MATERIAL", value: "CR,HR,High-Tensile" },
      { label: "THICKNESS", value: "0.8 ~ 5.0 MM." },
      { label: "WIDTH", value: "450 ~ 1850 MM" },
      { label: "SPEED", value: "80 spm (Stroke Per Minuits)" },
      { label: "WEIGHT", value: "1000 TON(MAX)." },
      { label: "ID", value: "508 - 610 MM." },
      { label: "OD", value: "850 - 1900 MM." },
      { label: "CAPACITY", value: "8000 kN" },
      { label: "SLIDE STROKE", value: "300 MM" },
      { label: "DIE HEIGHT", value: "1250 MM." },
      { label: "SLIDE ADJUSTMENT STROKE", value: "350 MM." },
      { label: "STROKES", value: "15-80 spm." },
    ]
  },
  {
    id: 15,
    name: "TURN COIL MACHINE",
    imgSrc: "/machines/TURNCOIL.png",
    specs: [
      { label: "WIDTH (MAX)", value: "650 MM." },
      { label: "WEIGHT (MAX)", value: "3,000 KGS." },
      { label: "OD (MAX)", value: "1,500 MM." },
    ]
  }
];

export default function MachinePage() {
  const { t } = useLanguage();
  
  // State สำหรับเก็บข้อมูลรูปเครื่องจักรที่ถูกคลิกเพื่อแสดงใน Modal
  const [selectedImage, setSelectedImage] = useState<{ src: string; name: string } | null>(null);

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      
      {/* ================= 1. ส่วนหัว (Hero Section) ================= */}
      <div className="bg-blue-900 text-white py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md uppercase">
            {t("machine.title")}
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("machine.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* ================= 2. Grid แสดงรายการเครื่องจักร ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {machinesData.map((machine) => (
            <div key={machine.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
              
              {/* กล่องรูปภาพ (กดเพื่อดูรูปใหญ่) */}
              <div 
                className="aspect-video bg-gray-200 relative group cursor-pointer border-b border-gray-100"
                onClick={() => setSelectedImage({ src: machine.imgSrc, name: machine.name })}
              >
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium group-hover:scale-105 transition-transform duration-500">
                   <Image src={machine.imgSrc} alt={machine.name} fill className="object-cover" />
                 
                </div>
                
                {/* ไอคอน Hover แว่นขยาย */}
                <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <div className="flex flex-col items-center text-white">
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    <span className="text-sm font-medium">{t("machine.click_to_zoom")}</span>
                  </div>
                </div>
              </div>

              {/* ส่วนหัวชื่อเครื่องจักร */}
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <h2 className="text-lg font-bold text-blue-900 text-center uppercase tracking-wide">
                  {machine.name}
                </h2>
              </div>

              {/* ส่วนข้อมูลสเปค (ทำ Scroll Bar ให้มีความสูงเท่ากันทุกกล่อง) */}
              <div className="p-4 h-64 overflow-y-auto custom-scrollbar bg-white flex-grow">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
                  {t("machine.spec_title")}
                </h3>
                <ul className="space-y-2">
                  {machine.specs.map((spec, index) => (
                    <li key={index} className="flex flex-col sm:flex-row sm:justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="font-semibold text-gray-700 mr-4">{spec.label}:</span>
                      <span className="text-gray-600 sm:text-right break-words">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ================= 3. Modal ดูรูปเครื่องจักรขยายใหญ่ (Lightbox) ================= */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)} 
        >
          <div 
            className="relative w-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-bold text-gray-800">{selectedImage.name}</h3>
              <button 
                className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* รูปภาพ */}
            <div className="relative w-full aspect-(16/9) md:aspect-21/9 bg-gray-100 flex items-center justify-center">
             
             <Image src={selectedImage.src} alt={selectedImage.name} fill className="object-contain" /> 
            </div>
          </div>
        </div>
      )}

      {/* สไตล์สำหรับแต่ง Scrollbar ให้ดูเล็กและสะอาดตา */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}} />

    </div>
  );
}
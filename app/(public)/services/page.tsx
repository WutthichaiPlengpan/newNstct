"use client";

import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import Image from "next/image"; // นำออกคอมเมนต์เมื่อมีรูปจริง

export default function ServicesPage() {
  const { t } = useLanguage();

  const [inputs, setInputs] = useState({
    weight: "",
    coating: "",
    thick: "",
    width: "",
    length: "",
  });

  const [result, setResult] = useState({
    unitWeight: "0.000",
    totalPcs: "0",
    isCalculated: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };


  const calculateWeight = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 

    const thick = parseFloat(inputs.thick);
    const width = parseFloat(inputs.width);
    const length = parseFloat(inputs.length);
    const totalWeight = parseFloat(inputs.weight);

    if (thick > 0 && width > 0 && length > 0) {
      let pieceWeight: number = 0;
      pieceWeight = (thick * width * length * 7.85) / 1000000;
      
      let pcs = 0;
      if (totalWeight > 0) {
        pcs = Math.floor(totalWeight / pieceWeight); 
      }

      setResult({
        unitWeight: pieceWeight.toFixed(3), // โชว์ทศนิยม 3 ตำแหน่ง
        totalPcs: pcs.toFixed(3).toString(), // โชว์ทศนิยม 3 ตำแหน่ง
        isCalculated: true,
      });
    } else {
      alert(t("services.calc_error"));
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      {/* ================= ส่วนหัว (Hero Section) ================= */}
      <div className="bg-blue-900 text-white py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md uppercase">
            {t("services.title")}
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("services.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= คอลัมน์ซ้าย: ข้อมูลบริการ ================= */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-blue-900 mb-4 border-l-4 border-blue-600 pl-3">
                {t("services.service_info")}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t("services.service_desc")}
              </p>
              
              <div className="w-full aspect-video bg-blue-50 rounded-lg overflow-hidden relative flex items-center justify-center border border-blue-100">
               
                  <Image
                    src="/services/Image_cawbo6ca.png"
                    alt="Service Video"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 100vw"
                  />
              </div>
            </div>
          </div>

          {/* ================= คอลัมน์ขวา: โปรแกรมคำนวณ (Calculator) ================= */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              
              <div className="bg-amber-400 py-4 px-6">
                <h2 className="text-xl font-bold text-white text-center drop-shadow-sm">
                  {t("services.calc_title")}
                </h2>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={calculateWeight} className="space-y-8">
                  
                  {/* --- 1. ส่วน Input --- */}
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                      {t("services.calc_input")}
                    </h3>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">{t("services.calc_weight")} (kg)</label>
                          <input type="number" name="weight" value={inputs.weight} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">{t("services.calc_coating")}</label>
                          <input type="number" name="coating" value={inputs.coating} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 whitespace-nowrap">{t("services.calc_thick")} (mm)</label>
                          <input type="number" step="0.001" name="thick" value={inputs.thick} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0.000" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 whitespace-nowrap">{t("services.calc_width")} (mm)</label>
                          <input type="number" step="0.001" name="width" value={inputs.width} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0.000" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 whitespace-nowrap">{t("services.calc_length")} (mm)</label>
                          <input type="number" step="0.001" name="length" value={inputs.length} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0.000" />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ปุ่มคำนวณ */}
                  <div className="flex justify-center">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      {t("services.calc_btn")}
                    </button>
                  </div>

                  {/* --- 2. ส่วน Output --- */}
                  <div className="border-t border-gray-100 pt-8 mt-4">
                    <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                      {t("services.calc_output")}
                    </h3>
                    
                    <div className={`transition-all duration-500 ${result.isCalculated ? "opacity-100" : "opacity-30 grayscale pointer-events-none"}`}>
                      {/* แก้ไข 2: ใช้ flex แทน grid เพื่อให้กล่องขยายตามเนื้อหา และไม่ไปบีบตัวหนังสือ */}
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex flex-col sm:flex-row gap-6 relative">
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50 flex-1 min-w-0">
                          <p className="text-gray-500 text-sm mb-1 whitespace-nowrap">{t("services.calc_unit_weight")}</p>
                          <div className="flex items-baseline gap-2 overflow-hidden">
                            {/* ใช้ truncate ป้องกันตัวเลขทะลุกรอบ */}
                            <p className="text-3xl md:text-4xl font-bold text-blue-600 truncate" title={result.unitWeight}>
                              {result.unitWeight}
                            </p>
                            <span className="text-lg font-normal text-gray-500 shrink-0">kg</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50 flex-1 min-w-0">
                          <p className="text-gray-500 text-sm mb-1 whitespace-nowrap">{t("services.calc_total_pcs")}</p>
                          <div className="flex items-baseline gap-2 overflow-hidden">
                            <p className="text-3xl md:text-4xl font-bold text-green-600 truncate" title={result.totalPcs}>
                              {result.totalPcs}
                            </p>
                            <span className="text-lg font-normal text-gray-500 shrink-0">pcs</span>
                          </div>
                        </div>
                      </div>
                      
                      {result.isCalculated && (
                        <div className="text-sm text-gray-500 text-center mt-4 bg-gray-50 py-2 rounded-md">
                          ( Thick: {inputs.thick} mm | Width: {inputs.width} mm | Length: {inputs.length} mm )
                        </div>
                      )}
                    </div>

                  </div>

                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
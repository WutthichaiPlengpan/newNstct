"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ProductsPage() {
  const { t } = useLanguage();

  // State สำหรับเก็บข้อมูลรูปภาพที่ถูกคลิกเพื่อแสดงใน Modal
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  // ข้อมูลจำลองสำหรับรูปภาพในแกลเลอรี
  const productImages = [
    { id: 1, src: "/products/coil.png", nameKey: "product_1" },
    {
      id: 2,
      src: "/products/SteelSheet.png",
      nameKey: "product_2",
    },
    { id: 3, src: "/products/SlitCoil.png", nameKey: "product_3" },
    // { id: 4, src: "/products/", nameKey: "product_4" },
    // { id: 5, src: "/products/", nameKey: "product_5" },
    // { id: 6, src: "/products/", nameKey: "product_6" },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      {/* ================= 1. ส่วนหัว (Hero Section) ================= */}
      <div className="bg-blue-900 text-white py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md uppercase">
            {t("products.title")}
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("products.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* ================= 2. ส่วนข้อมูลรายละเอียด (Introduction) ================= */}
        <section className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
          {/* รูปกราฟิกประดับฝั่งซ้าย */}
          <div className="w-full md:w-1/3 aspect-4/3 bg-blue-50 rounded-xl relative overflow-hidden flex items-center justify-center border border-blue-100">
            <Image
              src="/products/Image_mk3qlimk3qlimk3q.png"
              alt="Product Introduction"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          {/* ข้อความฝั่งขวา */}
          <div className="w-full md:w-2/3 space-y-4 text-gray-700 leading-relaxed text-lg">
            <p>{t("products.desc_1")}</p>
            <p>{t("products.desc_2")}</p>
            <p>{t("products.desc_3")}</p>
          </div>
        </section>

        {/* ================= 3. ส่วนแกลเลอรีรูปภาพ (Product Gallery) ================= */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-900 mb-10 border-b border-gray-200 pb-4 inline-block relative left-1/2 -translate-x-1/2">
            {t("products.gallery_title")}
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-blue-600 rounded-full"></span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productImages.map((product) => (
              <div
                key={product.id}
                onClick={() =>
                  setSelectedImage({
                    src: product.src,
                    alt: t(`products.${product.nameKey}`),
                  })
                }
                className="group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* 💡 แก้ไข: aspect-[4/3] เพื่อให้มีขนาดความสูงที่ถูกต้อง */}
                <div className="aspect-4/3 bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-500">
                    <Image
                      src={product.src}
                      alt={t(`products.${product.nameKey}`)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* ไอคอนแว่นขยายตอน Hover */}
                  <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <svg
                      className="w-10 h-10 text-white drop-shadow-md"
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

                {/* ชื่อสินค้า */}
                <div className="p-4 text-center border-t border-gray-100 bg-white">
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {t(`products.${product.nameKey}`)}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ================= 4. Modal ดูรูปภาพขยายใหญ่ (Lightbox) ================= */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          {/* กล่องเนื้อหา Modal */}
          <div
            className="relative w-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ส่วนหัว Modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedImage.alt}
              </h3>
              <button
                className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                onClick={() => setSelectedImage(null)}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 💡 แก้ไข: ใช้ aspect-[16/9] md:aspect-[21/9] สำหรับ Modal */}
            <div className="relative w-full aspect-vadio md:aspect-21/9 bg-gray-100 flex items-center justify-center">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                sizes="100vw"
                className="object-contain p-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

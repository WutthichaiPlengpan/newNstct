"use client";

import { useLanguage } from "../../../contexts/LanguageContext";
import { useEffect, useState } from "react";
import Image from "next/image";

const equipments = [
  "Big Slitter No.1 (0.3~3.2 mm x 1300 mm)",
  "Big Slitter No.2 (1.2~6.5 mm x 1600 mm)",
  "Big Leveler No.1 (0.3~2.3 mm x 320~1,250 x 200~3,100 mm)",
  "Big Leveler No.2 (0.2~1.6 mm x 400~1,300 x 300~2,500 mm)",
  "Mini Leveler (0.3~2.3 mm x 150~800 x 150~1,820 mm)",
  "Shear 3 Set (3.2 Max, 4.5 Max, 6.5 Max ~ 1,280 mm)",
  "Blank No.1, 5, 6 (0.3~3.2 mm x 20~200 mm, 45 Ton)",
  "Blank No.2 (0.8~6.0 mm x 50~500 mm, 200 Ton)",
  "Blank No.3 (0.3~3.2 mm x 50~500 mm, 110 Ton)",
  "Blank No.4 (1.5~8.0 mm x 150~500 mm, 200 Ton)",
  "Blanking Press 800 Ton (1.6~6.0 mm x 300~1,600 mm)",
  "Blanking Press 1000 Ton (0.8-5.0 mm x 450~1,850 mm)",
];

// ==========================================
// ส่วนประกอบย่อยสำหรับสร้างแผนผังองค์กร (Org Chart)
// ==========================================

// เส้นแนวตั้ง
const VLine = ({
  h = "h-8",
  className = "",
}: {
  h?: string;
  className?: string;
}) => <div className={`w-[2px] bg-blue-300 ${h} ${className}`}></div>;

// เส้นแนวนอน
const HLine = ({
  left,
  right,
  className = "",
}: {
  left: string;
  right: string;
  className?: string;
}) => (
  <div
    className={`absolute top-0 h-[2px] bg-blue-300 ${className}`}
    style={{ left, right }}
  ></div>
);

// การ์ดแสดงข้อมูลบุคคล
interface OrgNodeProps {
  abbr?: string;
  name: string;
  pos: string;
  subPos?: string;
  imageSrc?: string;
}

const OrgNode = ({ abbr, name, pos, subPos, imageSrc }: OrgNodeProps) => (
  <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 flex flex-col items-center text-center group hover:shadow-md hover:-translate-y-1 transition-all duration-300 w-44 z-10">
    <div className="w-14 h-14 bg-gray-50 rounded-full mb-2 flex items-center justify-center border-2 border-blue-100 group-hover:border-blue-300 transition-colors overflow-hidden shrink-0">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={name}
          width={56}
          height={56}
          className="object-cover w-full h-full"
        />
      ) : abbr ? (
        <span className="text-xl font-bold text-blue-800">{abbr}</span>
      ) : (
        <svg
          className="w-6 h-6 text-gray-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </div>
    <h3 className="text-[13px] font-bold text-gray-800 leading-snug">{name}</h3>
    <p className="text-[11px] text-blue-600 font-semibold mt-1 leading-snug">
      {pos}
    </p>
    {subPos && (
      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{subPos}</p>
    )}
  </div>
);

// ==========================================
// 3. Component หลักสำหรับหน้าเว็บ
// ==========================================
export default function HistoryPage() {
  const [listemployee, setListemployee] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/admin/employees");
        const data = await res.json();

        if (data.success) {
          setListemployee(data.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const { t } = useLanguage();

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
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
            {t("history.title")}
          </h1>
          <p className="text-blue-200 text-lg md:text-xl font-light">
            {t("history.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-20">
        {/* ================= 2. Company Profile (ข้อมูลบริษัท) ================= */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-8 border-l-4 border-blue-600 pl-4">
            {t("history.profile_title")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <ul className="space-y-4 text-sm md:text-base">
                <li className="grid grid-cols-3 gap-4 border-b border-gray-50 pb-3">
                  <span className="font-semibold text-gray-700">
                    {t("history.label_established")}
                  </span>
                  <span className="col-span-2 text-gray-600">
                    {t("history.val_established")}
                  </span>
                </li>
                <li className="grid grid-cols-3 gap-4 border-b border-gray-50 pb-3">
                  <span className="font-semibold text-gray-700">
                    {t("history.label_capital")}
                  </span>
                  <span className="col-span-2 text-gray-600">
                    {t("history.val_capital")}
                  </span>
                </li>
                <li className="grid grid-cols-3 gap-4 border-b border-gray-50 pb-3">
                  <span className="font-semibold text-gray-700">
                    {t("history.label_shareholders")}
                  </span>
                  <span className="col-span-2 text-gray-600 leading-relaxed">
                    Nippon Steel Trading Corporation (86%)
                    <br />
                    CSGT International Corporation (13%)
                    <br />
                    Nippon Steel Trading (Thailand) (1%)
                  </span>
                </li>
                <li className="grid grid-cols-3 gap-4 border-b border-gray-50 pb-3">
                  <span className="font-semibold text-gray-700">
                    {t("history.label_business")}
                  </span>
                  <span className="col-span-2 text-gray-600">
                    {t("history.val_business")}
                  </span>
                </li>
                <li className="grid grid-cols-3 gap-4 border-b border-gray-50 pb-3">
                  <span className="font-semibold text-gray-700">
                    {t("history.label_steel")}
                  </span>
                  <span className="col-span-2 text-gray-600">
                    {t("history.val_steel")}
                  </span>
                </li>
                <li className="grid grid-cols-3 gap-4 border-b border-gray-50 pb-3">
                  <span className="font-semibold text-gray-700">
                    {t("history.label_area")}
                  </span>
                  <span className="col-span-2 text-gray-600">
                    {t("history.val_area")}
                  </span>
                </li>
                <li className="grid grid-cols-3 gap-4 border-b border-gray-50 pb-3">
                  <span className="font-semibold text-gray-700">
                    {t("history.label_employees")}
                  </span>
                  <span className="col-span-2 text-gray-600">
                    {listemployee} {t("history.val_employees")}
                  </span>
                </li>
                <li className="grid grid-cols-3 gap-4">
                  <span className="font-semibold text-gray-700">
                    {t("history.label_customers")}
                  </span>
                  <span className="col-span-2 text-gray-600">
                    {t("history.val_customers")}
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-6 md:p-8">
              <h3 className="font-bold text-lg text-blue-900 mb-4">
                {t("history.equip_title")}
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                {equipments.map((eq, i) => (
                  <li key={i}>{eq}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= 3. Timeline (เส้นเวลา) ================= */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-8 border-l-4 border-blue-600 pl-4">
            {t("history.timeline_title")}
          </h2>
          <div className="relative border-l-4 border-blue-200 ml-4 md:ml-8 py-4 space-y-10 max-w-4xl">
            {[1, 2].map((item) => (
              <div key={item} className="relative pl-8 md:pl-16 group">
                <div className="absolute -left-3.5 top-1 w-6 h-6 bg-white border-4 border-blue-600 rounded-full group-hover:bg-blue-600 group-hover:scale-125 transition-all duration-300 z-10"></div>
                <div className="mb-2 ml-1">
                  <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 font-bold text-sm rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    {t(`history.year_${item}`)}
                  </span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-300">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {t(`history.title_${item}`)}
                  </h3>
                  <p className="text-gray-600">{t(`history.desc_${item}`)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 4. Executive Management (ผังองค์กรแบบใหม่) ================= */}
        <section className="bg-white rounded-3xl p-4 md:p-12 shadow-sm border border-gray-100 overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-900 mb-6 md:mb-12">
            {t("history.exec_title")}
          </h2>

          {/* 💡 1. เพิ่มข้อความบอกใบ้สำหรับมือถือ (จะซ่อนอัตโนมัติบนจอใหญ่) */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6 md:hidden animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span>เลื่อนซ้าย-ขวาเพื่อดูโครงสร้าง</span>
          </div>

          {/* 💡 2. เพิ่ม overflow-x-auto เพื่อให้เลื่อนแนวนอนได้ และซ่อน Scrollbar แนวตั้ง */}
          <div className="w-full pb-12 overflow-x-auto scrollbar-hide">
            {/* 💡 3. บังคับความกว้างขั้นต่ำ (min-w-[1000px]) เพื่อรักษาโครงสร้างไม่ให้ถูกบีบเละบนจอมือถือ */}
            <div className="min-w-[1000px] w-full flex flex-col items-center mx-auto px-4">
              {/* Level 1: P */}
              <OrgNode
                abbr="P"
                name={t("history.exec_1_name")}
                pos={t("history.exec_1_pos")}
                imageSrc="/managers/Yamazaki.jpg"
              />
              <VLine />

              {/* Level 2: VP */}
              <OrgNode
                abbr="VP"
                name={t("history.exec_2_name")}
                pos={t("history.exec_2_pos")}
                imageSrc="/managers/Goh.jpg"
              />
              <VLine />

              {/* เส้นแยกระดับแผนก (3 แผนกหลัก) */}
              <div className="w-full relative flex pt-8">
                <HLine left="16.66%" right="16.66%" />
                <VLine className="absolute top-0 left-[16.66%] -translate-x-1/2" />
                <VLine className="absolute top-0 left-[50%] -translate-x-1/2" />
                <VLine className="absolute top-0 left-[83.33%] -translate-x-1/2" />

                {/* Branch 1: Factory Group */}
                <div className="w-1/3 flex flex-col items-center">
                  <VLine h="h-48" />
                  <div className="w-max relative pt-8">
                    <HLine left="88px" right="88px" />
                    <VLine className="absolute top-0 left-[88px] -translate-x-1/2" />
                    <VLine className="absolute top-0 right-[88px] translate-x-1/2" />

                    <div className="flex gap-6 w-full">
                      <div className="flex flex-col items-center">
                        <OrgNode
                          name={t("history.exec_3_name")}
                          pos={t("history.exec_3_pos")}
                          imageSrc="/managers/Inouet.jpg"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <OrgNode
                          name="Mr.SAKDA WONGKAEW"
                          pos="Production Manager"
                          imageSrc="/managers/SAKDA.png"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Branch 2: AGM */}
                <div className="w-1/2 flex flex-col items-center px-4">
                  <VLine h="h-16" />
                  <OrgNode
                    abbr="AGM"
                    name="Ms. Dara Hussain"
                    pos="Assit General Manager"
                    imageSrc="/managers/Dara.jpg"
                  />
                  <VLine />
                  <OrgNode
                    name="Ms. Pila Khwayota"
                    pos="Account Manager"
                    imageSrc="/managers/Pila.jpg"
                  />
                </div>

                {/* Branch 3: GM Group */}
                <div className="w-1/3 flex flex-col items-center relative">
                  <OrgNode
                    abbr="GM"
                    name={t("history.exec_5_name")}
                    pos={t("history.exec_5_pos")}
                    imageSrc="/managers/Prapaporn.jpg"
                  />
                  <VLine h="h-60" />

                  <div className="w-max relative -translate-x-[200px] pt-8">
                    <HLine left="88px" right="88px" />
                    <VLine className="absolute top-0 left-[88px] -translate-x-1/2" />
                    <VLine className="absolute top-0 left-1/2 -translate-x-1/2" />
                    <VLine className="absolute top-0 right-[88px] translate-x-1/2" />

                    <div className="flex gap-6 w-full">
                      <div className="flex flex-col items-center">
                        <OrgNode
                          name={t("history.exec_4_name")}
                          pos={t("history.exec_4_pos")}
                          imageSrc="/managers/Yoshisue.jpg"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <OrgNode
                          name="Ms. SUPREEYA Phungbarameeupatham"
                          pos="Marketing Manager"
                          imageSrc="/managers/SUPREEYA.jpg"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <OrgNode
                          name="Mr. BAROM SANGNAKRIT"
                          pos="System Control Manager"
                          imageSrc="/managers/BAROM.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 5. Corporate Culture (วัฒนธรรมองค์กร) ================= */}
        <section className="bg-linear-to-t from-blue-900 to-blue-700 rounded-3xl p-8 md:p-16 text-center text-white shadow-lg relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("history.culture_title")}
            </h2>
            <p className="text-blue-100 text-lg md:text-xl leading-relaxed font-light">
              {t("history.culture_desc")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; // 💡 1. Import useRouter
import { useLanguage } from "../../contexts/LanguageContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentLang, setCurrentLang, t } = useLanguage();
  const router = useRouter(); // 💡 3. เรียกใช้งาน router

  const menus = [
    { name: t("menu.home"), href: "/" },
    {
      name: t("menu.about"),
      href: "#",
      dropdown: [
        { name: t("menu.history"), href: "/about/history" },
        { name: t("menu.quality"), href: "/about/quality-policy" },
      ],
    },
    {
      name: t("menu.product"),
      href: "#",
      dropdown: [
        { name: "Product", href: "/products" },
        { name: "Service", href: "/services" },
        { name: "Type", href: "/types" },
      ],
    },
    { name: t("menu.machine"), href: "/machine" },
    {
      name: t("menu.online_service"),
      href: "#",
      dropdown: [
        {
          name: "Customer Support",
          href: "https://pcs.nstct.co.th/login.php",
          isExternal: true,
        },
        { name: "Download", href: "/download" },
        { name: "Billing", href: "/billing" },
      ],
    },
    {
      name: t("menu.activity"),
      href: "#",
      dropdown: [
        { name: "Company", href: "/activity/company" },
        { name: "Tradition", href: "/activity/tradition" },
      ],
    },
    { name: t("menu.news") || "News", href: "/news" }, // 👈 เพิ่มเมนู News ตรงนี้
    { name: t("menu.job"), href: "/job" },
    { name: t("menu.contact"), href: "/contact" },
  ];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      // พาไปหน้า search พร้อมส่งคำค้นหาไปใน URL
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false); // ปิดเมนูมือถือ (ถ้าเปิดอยู่)
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* ปรับ max-w ให้กว้างขึ้นเพื่อรองรับเมนูที่เยอะขึ้น */}
      <div className="max-w-370 mx-auto px-4 xl:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* ส่วนของ Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logonst_OK.png"
                alt="NSTCT Logo"
                width={600}
                height={300}
                className="w-auto h-16 md:h-20 object-contain" // ลดขนาดโลโก้ลงนิดนึงให้มีพื้นที่เหลือ
                priority
              />
            </Link>
          </div>

          {/* เมนูสำหรับ Desktop - ลด space-x จาก 6 เหลือ 2-4 */}
          <nav className="hidden lg:flex space-x-2 xl:space-x-4">
            {menus.map((menu, index) => (
              <div key={index} className="relative group">
                <Link
                  href={menu.href}
                  className="text-gray-700 hover:text-blue-600 font-bold px-2 py-2 flex items-center transition-colors text-xs xl:text-sm uppercase tracking-wide"
                >
                  {menu.name}
                  {menu.dropdown && (
                    <svg
                      className="w-3.5 h-3.5 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>

                {menu.dropdown && (
                  <div className="absolute left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left bg-white border border-gray-100 shadow-lg rounded-md overflow-hidden">
                    <div className="py-2">
                      {menu.dropdown.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          href={sub.href}
                          target={sub.isExternal ? "_blank" : undefined}
                          rel={
                            sub.isExternal ? "noopener noreferrer" : undefined
                          }
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* ส่วนขวา: ค้นหา และ เปลี่ยนภาษา (Desktop) - ปรับ Search Bar ให้เล็กลง */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {/* Search Bar - เล็กลง (w-24 -> w-28) */}
            <div className="relative group">
              <input
                type="text"
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch} // ตรวจจับการกด Enter
                className="w-24 xl:w-36 pl-8 pr-2 py-1.5 border border-gray-300 rounded-full text-xs xl:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 focus:w-40 xl:focus:w-48"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-2.5 top-2 cursor-pointer hover:text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                onClick={() => {
                  if (searchQuery.trim() !== "") {
                    router.push(
                      `/search?q=${encodeURIComponent(searchQuery.trim())}`,
                    );
                  }
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Language Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {["TH", "EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${currentLang === lang ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* ปุ่ม Hamburger สำหรับ Mobile */}
          <div className="flex items-center lg:hidden space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* เมนูสำหรับ Mobile (ซ่อนไว้เมื่อจอใหญ่) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-inner">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-center space-x-2 bg-gray-50">
            {["TH", "EN", "JP"].map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setCurrentLang(lang);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-1 text-sm font-bold rounded-md border ${currentLang === lang ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
              >
                {lang}
              </button>
            ))}
          </div>
          <div className="px-4 pt-2 pb-6 space-y-1 max-h-[70vh] overflow-y-auto">
            {menus.map((menu, index) => (
              <div key={index} className="py-2">
                <Link
                  href={menu.href}
                  onClick={() => !menu.dropdown && setIsMobileMenuOpen(false)}
                  className="block font-bold text-gray-800 hover:text-blue-600 uppercase text-sm"
                >
                  {menu.name}
                </Link>
                {menu.dropdown && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-blue-100">
                    {menu.dropdown.map((sub, subIndex) => (
                      <Link
                        key={subIndex}
                        href={sub.href}
                        target={sub.isExternal ? "_blank" : undefined}
                        rel={sub.isExternal ? "noopener noreferrer" : undefined}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm font-medium text-gray-600 hover:text-blue-600"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

"use client"; 

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-blue-900 text-white pt-12 pb-6">
      <div className="max-w-370 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          
          {/* ส่วนที่ 1: ข้อมูลบริษัท */}
          <div className="lg:col-span-2">
            <Image
              src="/logonst_OK.png"
              alt="NSTCT Logo"
              width={450}
              height={250}
              className="w-auto h-16 md:h-20 object-contain mb-4"
              priority
            />
            <p className="text-blue-100 text-sm mb-4 max-w-md leading-relaxed">
              NST COIL CENTER (THAILAND) LTD.
              <br />
              {t("footer.desc")}
            </p>
            <div className="text-blue-200 text-sm space-y-3">
              <div className="flex items-start">
                <span className="mr-2 mt-0.5 shrink-0">📍</span>
                <span className="w-20 shrink-0 font-medium">
                  {t("footer.address_label")}
                </span>
                <span className="leading-relaxed">{t("footer.address")}</span>
              </div>

              <div className="flex items-start">
                <span className="mr-2 shrink-0">📞</span>
                <span className="w-20 shrink-0 font-medium">
                  {t("footer.phone_label")}
                </span>
                <span>038 210 170</span>
              </div>

              <div className="flex items-start">
                <span className="mr-2 shrink-0">✉️</span>
                <span className="w-20 shrink-0 font-medium">
                  {t("footer.email_label")}
                </span>
                <span>admin@nstct.co.th</span>
              </div>
            </div>
          </div>

          {/* ส่วนที่ 2: เมนูลัด (Quick Links) */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300 uppercase tracking-wider">
              {t("footer.quick_links")}
            </h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t("menu.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-white transition-colors"
                >
                  {t("menu.product")}
                </Link>
              </li>
              <li>
                <Link
                  href="/machine"
                  className="hover:text-white transition-colors"
                >
                  {t("menu.machine")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  {t("menu.contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="/job"
                  className="hover:text-white transition-colors"
                >
                  {t("menu.job")}
                </Link>
              </li>
            </ul>
          </div>

          {/* ส่วนที่ 3: นโยบาย (Policies) */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300 uppercase tracking-wider">
              {t("footer.legal_policy")}
            </h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <Link
                  href="/about/quality-policy"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.quality_policy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.privacy_policy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* เส้นคั่น */}
        <div className="border-t border-white pt-6 mt-6 flex flex-col md:flex-row justify-between items-center text-xs text-blue-300">
          <p>
            © {currentYear} NST COIL CENTER (THAILAND) LTD. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="#" className="hover:text-white transition-colors">
              Facebook
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              LinkedIn
            </Link>
            <Link href="https://www.jobthai.com/th/company/56567" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Jobthai
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
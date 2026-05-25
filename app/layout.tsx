
import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./contexts/LanguageContext";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {

  metadataBase: new URL("https://www.nstct.co.th"),
  title: {
    template: "%s | NST COIL CENTER (THAILAND)",
    default: "NST COIL CENTER (THAILAND) LTD. - ผู้ให้บริการศูนย์ตัดเหล็กม้วนคุณภาพสูง",
  },
  description: "ผู้ให้บริการศูนย์ตัดเหล็กม้วนคุณภาพสูง (Coil Center) ผู้นำด้านการแปรรูปเหล็กแผ่นและคอยล์ มาตรฐานระดับสากล",
  keywords: ["เหล็กแผ่น", "คอยล์", "ตัดเหล็กม้วน", "NSTCT", "Coil Center", "ชลบุรี", "Amata City"],
  openGraph: {
    title: "NST COIL CENTER (THAILAND) LTD.",
    description: "ผู้นำด้านการแปรรูปเหล็กแผ่นและคอยล์ มาตรฐานระดับสากล",
    url: "https://www.nstct.co.th", // ⚠️ อย่าลืมเปลี่ยนเป็นโดเมนจริงเมื่อนำขึ้นระบบ
    siteName: "NSTCT",
    images: [
      {
        url: "/logonst_OK.png",
        width: 1200,
        height: 630,
        alt: "NSTCT Cover Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 💡 เปลี่ยน lang เป็น th เพื่อผลลัพธ์ SEO ในไทยที่ดีกว่า
    <html lang="th" className={`${prompt.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <LanguageProvider>
          {children} 
        </LanguageProvider>
      </body>
    </html>
  );
}
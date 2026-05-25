import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    // ถ้า placehold.co มีปัญหาเรื่องการโหลดรูป ให้เพิ่มบรรทัดนี้ด้วย
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;

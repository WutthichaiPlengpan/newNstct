import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    // 🛡️ Security Check: ตรวจสอบชนิดข้อมูลป้องกันการส่งค่าแปลกๆ เข้ามา
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุรหัสผ่านให้ถูกต้อง" },
        { status: 400 },
      );
    }

    // 💡 1. แก้ไข Directory ให้ชี้ไปที่โฟลเดอร์ส่วนตัว (Private Uploads)
    const dirPath = path.join(process.cwd(), "private_uploads");
    let allFiles: string[] = [];

    try {
      allFiles = await readdir(dirPath);
    } catch (err) {
      // ถ้าโฟลเดอร์ยังไม่ถูกสร้าง (ยังไม่เคยมีใครอัปโหลด)
      return NextResponse.json({ success: true, files: [] });
    }

    const matchedFiles = [];

    // วนลูปหาไฟล์ที่ชื่อขึ้นต้นด้วย "รหัส_"
    for (const file of allFiles) {
      if (file.startsWith(`${code}_`)) {
        const filePath = path.join(dirPath, file);
        const fileStat = await stat(filePath);

        // คำนวณขนาดไฟล์เป็น MB
        const sizeInMB = (fileStat.size / (1024 * 1024)).toFixed(2);

        // ตัดรหัส 8 หลักและ _ ออกจากชื่อไฟล์เพื่อความสวยงามตอนแสดงผล
        // (ใช้ substring ปลอดภัยกว่า replace เผื่อบังเอิญชื่อไฟล์มีรหัสนี้ซ้ำ)
        const originalName = file.substring(code.length + 1);

        matchedFiles.push({
          name: originalName,
          size: `${sizeInMB} MB`,
          // 💡 2. เปลี่ยน URL ให้วิ่งไปหา Stream API ที่เราสร้างไว้แทน
          url: `/api/download/${file}`,
        });
      }
    }

    return NextResponse.json({ success: true, files: matchedFiles });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, message: "เซิร์ฟเวอร์เกิดข้อผิดพลาด" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { createReadStream, existsSync } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // 🛡️ ป้องกัน Path Traversal ดึงเฉพาะชื่อไฟล์จริง
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), "private_uploads", safeFilename);

    // ตรวจสอบว่ามีไฟล์อยู่จริงหรือไม่
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "ไม่พบไฟล์ที่ต้องการดาวน์โหลด" }, { status: 404 });
    }

    const fileStat = await stat(filePath);
    const nodeStream = createReadStream(filePath);
    
    // แปลง Node.js ReadStream เป็น Web ReadableStream ให้เข้ากับ Next.js App Router
    const webStream = Readable.toWeb(nodeStream);

    // ตั้งค่า Headers บังคับดาวน์โหลดและระบุขนาดไฟล์ที่ถูกต้อง
    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Length", fileStat.size.toString());
    // บังคับให้เบราว์เซอร์บันทึกเป็นไฟล์ตามชื่อดั้งเดิม (ตัดรหัส 8 หลักด้านหน้าออกตอนดาวน์โหลดถ้าต้องการ)
    const originalName = safeFilename.substring(safeFilename.indexOf("_") + 1);
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(originalName)}"`);

    return new NextResponse(webStream as any, { headers });
  } catch (error) {
    console.error("Download Stream Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์" }, { status: 500 });
  }
}
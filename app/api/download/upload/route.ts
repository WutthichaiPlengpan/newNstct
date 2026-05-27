import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { z } from "zod";

// 💡 1. Zod Schema สำหรับตรวจสอบ Input ป้องกัน Payload ประหลาด
const uploadSchema = z.object({
  topic: z.string().min(1, "ข้อมูลไม่ครบถ้วน").max(200, "ชื่อหัวข้อยาวเกินไป"),
});

// 💡 2. Whitelist นามสกุลไฟล์ที่อนุญาต (ป้องกันการปลอมแปลง MIME Type)
const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
];

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "image/jpeg",
  "image/png",
];

// จำกัดขนาดไฟล์รวมทั้งหมดที่ 10 MB
const MAX_TOTAL_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const files = formData.getAll("files") as File[];
    const topicRaw = formData.get("topic") as string;

    // --- Security Check 1: Validate Input ---
    const parseResult = uploadSchema.safeParse({ topic: topicRaw });
    if (!parseResult.success || !files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลไม่ครบถ้วน หรือไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    let totalSize = 0;
    for (const file of files) {
      totalSize += file.size;

      // --- Security Check 2: MIME Type ---
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: `ไม่อนุญาตให้อัปโหลดไฟล์: ${file.name}` },
          { status: 400 },
        );
      }

      // --- Security Check 3: Strict Extension & Null-byte ---
      const originalName = file.name.replace(/\0/g, ""); // ลบ Null-byte (%00)
      const ext = path.extname(originalName).toLowerCase(); // ดึงนามสกุลสุดท้ายเท่านั้น

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { success: false, message: `นามสกุลไฟล์ไม่ปลอดภัย: ${ext}` },
          { status: 403 },
        );
      }
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { success: false, message: "ขนาดไฟล์รวมทั้งหมดต้องไม่เกิน 10MB" },
        { status: 400 },
      );
    }

    // สร้างรหัส 8 หลัก
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const dirPath = path.join(process.cwd(), "private_uploads");
    await mkdir(dirPath, { recursive: true });

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // --- Security Check 4: Secure File Naming ---
      const originalName = file.name.replace(/\0/g, "");
      const ext = path.extname(originalName).toLowerCase();

      // สกัดเฉพาะชื่อไฟล์ (ไม่เอานามสกุล)
      let baseName = path.basename(originalName, ext);

      // 💡 กรองอักขระพิเศษออกทั้งหมด (จุด . จะถูกแทนที่ด้วย _ เพื่อกัน Path Traversal และ Double Extension)
      baseName = baseName.replace(/[^a-zA-Z0-9\-_\u0E00-\u0E7F\s]/g, "_");

      // ประกอบร่างใหม่: รหัส_ชื่อที่ปลอดภัย.นามสกุลที่ตรวจสอบแล้ว
      const finalFileName = `${code}_${baseName}${ext}`;

      const uploadPath = path.join(dirPath, finalFileName);
      await writeFile(uploadPath, buffer);
    }

    return NextResponse.json({ success: true, code: code });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการอัปโหลด" },
      { status: 500 },
    );
  }
}

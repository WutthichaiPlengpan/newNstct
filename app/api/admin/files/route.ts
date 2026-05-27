import { NextResponse } from "next/server";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";

const dirPath = path.join(process.cwd(), "private_uploads");

export async function GET() {
  try {
    let allFiles = [];
    try {
      allFiles = await readdir(dirPath);
    } catch (e) {
      return NextResponse.json({ success: true, files: [] });
    }

    const fileDetails = await Promise.all(
      allFiles.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const fileStat = await stat(filePath);

        const firstUnderscore = file.indexOf("_");
        const code =
          firstUnderscore > -1 ? file.substring(0, firstUnderscore) : "-";
        const originalName =
          firstUnderscore > -1 ? file.substring(firstUnderscore + 1) : file;

        return {
          filename: file,
          code: code,
          name: originalName,
          size: (fileStat.size / (1024 * 1024)).toFixed(2),
          createdAt: fileStat.birthtime,
        };
      }),
    );

    fileDetails.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return NextResponse.json({ success: true, files: fileDetails });
  } catch (error) {
    console.error("Read Files Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถอ่านโฟลเดอร์ได้" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { filename } = await request.json();
    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { success: false, error: "ชื่อไฟล์ไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    // 🛡️ ป้องกัน Path Traversal ดึงเฉพาะชื่อไฟล์ท้ายสุด
    const safeFilename = path.basename(filename);
    const filePath = path.join(dirPath, safeFilename);

    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete File Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถลบไฟล์ได้" },
      { status: 500 },
    );
  }
}

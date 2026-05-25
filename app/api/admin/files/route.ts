import { NextResponse } from "next/server";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";

export async function GET() {
    try {
        const dirPath = path.join(process.cwd(), "public/uploads/shared");
        let allFiles = [];

        try {
            allFiles = await readdir(dirPath);
        } catch (e) {
            // กรณีโฟลเดอร์ยังไม่มี (ยังไม่มีใครอัปโหลดไฟล์เลย)
            return NextResponse.json({ success: true, files: [] });
        }

        const fileDetails = await Promise.all(allFiles.map(async (file) => {
            const filePath = path.join(dirPath, file);
            const fileStat = await stat(filePath);
            
            // สกัดแยกรหัส 8 หลัก และชื่อไฟล์ออกจากกัน (เช่น X9F2K8M1_Doc.pdf)
            const firstUnderscore = file.indexOf('_');
            const code = firstUnderscore > -1 ? file.substring(0, firstUnderscore) : "-";
            const originalName = firstUnderscore > -1 ? file.substring(firstUnderscore + 1) : file;

            return {
                filename: file, // ชื่อไฟล์จริงบนเซิร์ฟเวอร์
                code: code,     // รหัสสำหรับดาวน์โหลด
                name: originalName,
                size: (fileStat.size / (1024 * 1024)).toFixed(2), // MB
                createdAt: fileStat.birthtime
            };
        }));

        // เรียงลำดับจากไฟล์ใหม่ล่าสุดขึ้นก่อน
        fileDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ success: true, files: fileDetails });
    } catch (error) {
        console.error("Read Files Error:", error);
        return NextResponse.json({ success: false, error: "ไม่สามารถอ่านโฟลเดอร์ได้" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { filename } = await request.json();
        const filePath = path.join(process.cwd(), "public/uploads/shared", filename);
        
        await unlink(filePath); // ลบไฟล์ออกจากเครื่องเซิร์ฟเวอร์
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete File Error:", error);
        return NextResponse.json({ success: false, error: "ไม่สามารถลบไฟล์ได้" }, { status: 500 });
    }
}
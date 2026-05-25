import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const { code } = await request.json();
        
        if (!code) {
            return NextResponse.json({ success: false, message: "กรุณาระบุรหัสผ่าน" }, { status: 400 });
        }

        const dirPath = path.join(process.cwd(), "public/uploads/shared");
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
                
                // ตัดรหัสออกจากชื่อไฟล์เพื่อความสวยงามตอนแสดงผล
                const originalName = file.replace(`${code}_`, "");

                matchedFiles.push({
                    name: originalName,
                    size: `${sizeInMB} MB`,
                    url: `/uploads/shared/${file}` // 💡 URL จริงที่จะใช้ดาวน์โหลด
                });
            }
        }

        return NextResponse.json({ success: true, files: matchedFiles });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ success: false, message: "เซิร์ฟเวอร์เกิดข้อผิดพลาด" }, { status: 500 });
    }
}
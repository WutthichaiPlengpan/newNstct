import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

// ดึงรูปภาพในอัลบั้ม
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const activityId = searchParams.get("activityId");
        const pool = await connectDB();
        const result = await pool.request()
            .input('ActivityID', sql.Int, activityId)
            .query(`SELECT * FROM tb_hr_ActivityImages WHERE ActivityID = @ActivityID ORDER BY UploadedAt DESC`);
        return NextResponse.json({ success: true, data: result.recordset });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

// อัปโหลดรูปภาพ
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const activityId = formData.get("activityId") as string;
        const category = formData.get("category") as string;
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) return NextResponse.json({ success: false, message: "ไม่มีไฟล์" }, { status: 400 });

        // สร้างโฟลเดอร์เฉพาะของกิจกรรมนี้: /public/uploads/activities/company/12/
        const dirPath = path.join(process.cwd(), `public/uploads/activities/${category}/${activityId}`);
        await mkdir(dirPath, { recursive: true });

        const pool = await connectDB();

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const safeName = file.name.replace(/[^a-zA-Z0-9.\-_\u0E00-\u0E7F\s]/g, "_");
            const finalName = `${Date.now()}_${safeName}`;
            const uploadPath = path.join(dirPath, finalName);
            
            await writeFile(uploadPath, buffer);
            const dbUrl = `/uploads/activities/${category}/${activityId}/${finalName}`;

            await pool.request()
                .input('ActivityID', sql.Int, activityId)
                .input('ImageUrl', sql.NVarChar, dbUrl)
                .query(`INSERT INTO tb_hr_ActivityImages (ActivityID, ImageUrl) VALUES (@ActivityID, @ImageUrl)`);
                
            // เซ็ตรูปแรกให้เป็นรูปปก (Cover) ถ้ายังไม่มี
            await pool.request()
                .input('ActivityID', sql.Int, activityId)
                .input('CoverImage', sql.NVarChar, dbUrl)
                .query(`UPDATE tb_hr_Activities SET CoverImage = @CoverImage WHERE ActivityID = @ActivityID AND CoverImage IS NULL`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

// ลบรูปภาพทีละรูป
export async function DELETE(request: Request) {
    try {
        const { imageId, imageUrl } = await request.json();
        const pool = await connectDB();
        
        // ลบออกจากฐานข้อมูล
        await pool.request().input('ImageID', sql.Int, imageId).query(`DELETE FROM tb_hr_ActivityImages WHERE ImageID = @ImageID`);
        
        // ลบไฟล์จริงออกจากเซิร์ฟเวอร์
        const filePath = path.join(process.cwd(), "public", imageUrl);
        try { await unlink(filePath); } catch (e) { console.log("File not found on disk"); }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
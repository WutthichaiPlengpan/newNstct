import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ปรับปรุงฟังก์ชันช่วยเซฟไฟล์ให้ฉลาดขึ้น สร้างโฟลเดอร์อัตโนมัติ
async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

  // 💡 กำหนด Path ของโฟลเดอร์ปลายทาง
  const dirPath = path.join(process.cwd(), "public/uploads/news");

  // 💡 สั่งให้ตรวจสอบและสร้างโฟลเดอร์ปลายทางหากยังไม่มีในเครื่อง (recursive: true คือสร้างโฟลเดอร์ซ้อนโฟลเดอร์ได้)
  await mkdir(dirPath, { recursive: true });

  // กำหนด Path เต็มสำหรับการเขียนไฟล์
  const uploadPath = path.join(dirPath, fileName);
  await writeFile(uploadPath, buffer);

  return `/uploads/news/${fileName}`;
}

export async function GET(request: Request) {
  try {
    const pool = await connectDB();
    const result = await pool.request().execute("SP_hr_News_GetAll");
    return NextResponse.json({ success: true, data: result.recordset });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const videoUrl = (formData.get("videoUrl") as string) || "";

    // รับไฟล์ภาพปก
    const coverFile = formData.get("coverImage") as File;
    let coverImagePath = "";
    if (coverFile && coverFile.size > 0) {
      coverImagePath = await saveFile(coverFile);
    }

    // รับไฟล์แกลเลอรี (หลายรูป)
    const imageFiles = formData.getAll("images") as File[];
    const imagePaths: string[] = [];
    for (const file of imageFiles) {
      if (file.size > 0) {
        const p = await saveFile(file);
        imagePaths.push(p);
      }
    }

    const pool = await connectDB();
    await pool
      .request()
      .input("Title", title)
      .input("Content",  content)
      .input("CoverImage", coverImagePath)
      .input("Images",  JSON.stringify(imagePaths))
      .input("VideoUrl", videoUrl)
      .execute("SP_hr_News_Insert");

    return NextResponse.json({ success: true, message: "เพิ่มข่าวสารสำเร็จ" });
  } catch (error) {
    console.error("News POST Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถอัปโหลดข้อมูลข่าวได้" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    // 🛡️ เช็คว่ามี id ส่งมาจริงๆ หรือไม่
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสข่าวที่ต้องการลบ (Missing ID)" },
        { status: 400 },
      );
    }

    const pool = await connectDB();
    await pool
      .request()
      .input("NewsID", id)
      .execute("SP_hr_News_Delete");

    return NextResponse.json({ success: true, message: "ลบข้อมูลสำเร็จ" });
  } catch (error) {
    // 💡 เพิ่มการแสดงผล Error ใน Terminal เพื่อให้รู้สาเหตุที่แท้จริง
    console.error("News DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 },
    );
  }
}

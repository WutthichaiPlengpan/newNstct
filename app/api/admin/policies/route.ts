import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const dirPath = path.join(process.cwd(), "private_uploads");

async function savePdf(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // ทำความสะอาดชื่อไฟล์ ป้องกัน Path Traversal ปลอมแปลงนามสกุล
    const safeName = `${Date.now()}_${path.basename(file.name).replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    await mkdir(dirPath, { recursive: true });
    await writeFile(path.join(dirPath, safeName), buffer);
    return `/private_uploads/${safeName}`;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const summary = formData.get("summary") as string;
        const content = formData.get("content") as string;
        const pdfFile = formData.get("pdf") as File | null;

        let pdfPath = "";
        if (pdfFile && pdfFile.size > 0) {
            pdfPath = await savePdf(pdfFile);
        }

        const pool = await connectDB();
        await pool.request()
            .input("Title",  title)
            .input("Summary",  summary)
            .input("Content", content)
            .input("PdfPath",  pdfPath)
            .query("INSERT INTO tb_hr_Company_Policies (Title, Summary, Content, PdfPath) VALUES (@Title, @Summary, @Content, @PdfPath)");

        return NextResponse.json({ success: true, message: "สร้างนโยบายสำเร็จ" });
    } catch (error) {
        console.error("Admin Policy POST Error:", error);
        return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const formData = await request.formData();
        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const summary = formData.get("summary") as string;
        const content = formData.get("content") as string;
        const pdfFile = formData.get("pdf") as File | null;

        if (!id) return NextResponse.json({ success: false, message: "ID Missing" }, { status: 400 });

        const pool = await connectDB();
        
        let query = "UPDATE tb_hr_Company_Policies SET Title = @Title, Summary = @Summary, Content = @Content, UpdatedAt = GETDATE() WHERE PolicyID = @ID";
        const req = pool.request()
            .input("ID",  parseInt(id))
            .input("Title", title)
            .input("Summary",  summary)
            .input("Content",  content);

        if (pdfFile && pdfFile.size > 0) {
            const pdfPath = await savePdf(pdfFile);
            query = "UPDATE tb_hr_Company_Policies SET Title = @Title, Summary = @Summary, Content = @Content, PdfPath = @PdfPath, UpdatedAt = GETDATE() WHERE PolicyID = @ID";
            req.input("PdfPath", pdfPath);
        }

        await req.query(query);
        return NextResponse.json({ success: true, message: "แก้ไขนโยบายสำเร็จ" });
    } catch (error) {
        console.error("Admin Policy PUT Error:", error);
        return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ success: false, message: "ID Missing" }, { status: 400 });

        const pool = await connectDB();
        await pool.request()
            .input("ID", id)
            .query("DELETE FROM tb_hr_Company_Policies WHERE PolicyID = @ID");

        return NextResponse.json({ success: true, message: "ลบนโยบายสำเร็จ" });
    } catch (error) {
        console.error("Admin Policy DELETE Error:", error);
        return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
    }
}
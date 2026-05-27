import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 💡 Next.js 15+ Params เป็น Promise
) {
  try {
    const { id } = await params;
    const pool = await connectDB();
    const result = await pool.request()
      .input("ID",  parseInt(id))
      .query("SELECT PolicyID, Title, Summary, Content, PdfPath FROM tb_hr_Company_Policies WHERE PolicyID = @ID");

    if (result.recordset.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูล" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Fetch Single Policy Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
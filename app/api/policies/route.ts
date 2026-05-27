import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";

export async function GET() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(
      "SELECT PolicyID, Title, Summary, Content, PdfPath FROM tb_hr_Company_Policies ORDER BY PolicyID DESC"
    );
    return NextResponse.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Public Fetch Policies API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
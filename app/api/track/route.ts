import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";

export async function POST(request: Request) {
  try {
    const { actionType, details } = await request.json();

    // ดึง IP ของ User (ถ้ามี)
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("remote-addr") ||
      "Unknown";

    const pool = await connectDB();
    await pool
      .request()
      .input("ActionType", actionType)
      .input("Details", details)
      .input("IPAddress", ip)
      .query(
        `INSERT INTO tb_web_nstct_Logs (ActionType, Details, IPAddress) VALUES (@ActionType, @Details, @IPAddress)`,
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

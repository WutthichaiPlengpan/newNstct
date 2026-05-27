import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // ทำลายคุกกี้โดยตั้งค่า Expire ให้ย้อนกลับไปในอดีต
    cookieStore.set("nstct_admin_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0), // บังคับหมดอายุทันที
      path: "/",
    });

    return NextResponse.json({ success: true, message: "ออกจากระบบสำเร็จ" });
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการออกจากระบบ" },
      { status: 500 }
    );
  }
}
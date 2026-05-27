import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose"; // ใช้ไลบรารี jose ตัวเดียวกับตอน Sign Token

export async function GET() {
  try {
    // 1. ดึงคุกกี้จาก Request (เนื่องจากเป็น Next.js เวอร์ชันใหม่ cookies() จะเป็นแบบ async)
    const cookieStore = await cookies();
    const token = cookieStore.get("nstct_admin_token")?.value;

    // 2. ถ้าไม่มี Token แสดงว่าไม่ได้ล็อกอิน
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: ไม่พบข้อมูลการเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    // 3. ตรวจสอบความถูกต้องและถอดรหัส JWT Token
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);

    // 4. ส่งข้อมูลผู้ใช้งานกลับไปให้ฝั่ง Client 
    return NextResponse.json({
      success: true,
      user: {
        FullName: payload.FullName,
        Role: payload.Role,
      },
    });
  } catch (error) {
    console.error("Fetch current user API Error:", error);
    // ในกรณีที่ Token หมดอายุ หรือถูกดัดแปลง จะเกิด Error ขึ้น ให้ส่ง 401 กลับไป
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
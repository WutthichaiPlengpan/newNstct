import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";
import bcrypt from "bcryptjs";
import { z } from "zod";

// 💡 1. สร้าง Zod Schema กำหนดกฎเหล็กสำหรับ Input
const loginSchema = z.object({
  // อนุญาตเฉพาะตัวอักษร ตัวเลข จุด ขีดล่าง ขีดกลาง และ @ เท่านั้น (กัน Payload ที่เป็น SQL Syntax)
  username: z
    .string()
    .min(3, "ชื่อผู้ใช้งานสั้นเกินไป")
    .max(50, "ชื่อผู้ใช้งานยาวเกินไป")
    .regex(/^[a-zA-Z0-9_.@\-]+$/, "ชื่อผู้ใช้งานมีอักขระที่ไม่ได้รับอนุญาต"),

  // รหัสผ่านไม่ควรจำกัด regex เพราะบางคนอาจใช้รหัสผ่านที่มีอักขระพิเศษ แต่จำกัดความยาวไว้เพื่อกัน DoS
  password: z
    .string()
    .min(4, "รหัสผ่านสั้นเกินไป")
    .max(100, "รหัสผ่านยาวเกินไป"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- Security Check: Validate Input ---
    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      // ส่งกลับ 400 Bad Request ทันทีถ้า Input ไม่ตรงตามกฎ โดยไม่ต้องแตะ Database
      return NextResponse.json(
        {
          success: false,
          message: "ข้อมูลไม่ถูกต้อง หรือตรวจพบอักขระที่ไม่ปลอดภัย",
        },
        { status: 400 },
      );
    }

    // ดึงข้อมูลที่ผ่านการกรองจนสะอาดแล้วมาใช้งาน
    const { username, password } = parseResult.data;

    const pool = await connectDB();
    const query = `
            SELECT us.user_name, 
                us.user_passwordh
            FROM tb_User us
            WHERE us.user_status <> 0
            AND us.user_name = @username
        `;

    // Parameterized Query (ด่านที่ 2 ป้องกัน SQLi)
    const result = await pool
      .request()
      .input("username", username)
      .query(query);

    // เช็คว่าเจอ User หรือไม่
    if (result.recordset.length > 0) {
      const dbUser = result.recordset[0];

      // เปรียบเทียบ Hash Password
      const isPasswordMatch = await bcrypt.compare(
        password,
        dbUser.user_passwordh,
      );

      if (isPasswordMatch) {
        return NextResponse.json({ success: true, message: "Login สำเร็จ" });
      }
    }

    // 💡 Security Best Practice: ส่งข้อความแบบกว้างๆ เสมอ เพื่อป้องกัน User Enumeration (เดาชื่อผู้ใช้)
    return NextResponse.json(
      { success: false, message: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" },
      { status: 500 },
    );
  }
}

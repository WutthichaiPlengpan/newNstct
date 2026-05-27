import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { SignJWT } from "jose";

// 💡 1. Zod Schema: ด่านหน้าสกัดกั้น Payload และป้องกัน ReDoS
const adminLoginSchema = z.object({
  username: z
    .string()
    .min(3, "ชื่อผู้ใช้งานสั้นเกินไป")
    .max(50, "ชื่อผู้ใช้งานยาวเกินไป")
    .regex(/^[a-zA-Z0-9_.@\-]+$/, "ชื่อผู้ใช้งานมีอักขระที่ไม่ได้รับอนุญาต"),
  password: z
    .string()
    .min(4, "รหัสผ่านสั้นเกินไป")
    .max(100, "รหัสผ่านยาวเกินไป"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- Security Check 1: Validate Input ด้วย Zod ---
    const parseResult = adminLoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "ข้อมูลไม่ถูกต้อง หรือตรวจพบอักขระที่ไม่ปลอดภัย",
        },
        { status: 400 },
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "CRITICAL ERROR: Missing JWT_SECRET in environment variables.",
      );
      return NextResponse.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการตั้งค่าเซิร์ฟเวอร์ (Missing Secret)",
        },
        { status: 500 },
      );
    }

    const { username, password } = parseResult.data;
    const pool = await connectDB();

    // 💡 2. SQL Query: ใช้เฉพาะ Parameterized Query
    const query = `
            SELECT 
                em.emp_name, 
                em.emp_lname, 
                em.emp_section, 
                us.user_passwordh 
            FROM tb_User us 
            LEFT JOIN tb_hr_employee em ON us.user_id = em.emp_id 
            WHERE em.emp_status = 1 
              AND em.emp_section IN ('admin','System','account') 
              AND us.user_status <> 0 
              AND us.user_name = @username
        `;

    const result = await pool
      .request()
      .input("username", username)
      .query(query);

    if (result.recordset.length > 0) {
      const dbUser = result.recordset[0];
      const isPasswordMatch = await bcrypt.compare(
        password,
        dbUser.user_passwordh,
      );

      if (isPasswordMatch) {
        const payload = {
          FullName: `${dbUser.emp_name} ${dbUser.emp_lname}`,
          Role: dbUser.emp_section,
        };

        // 🛡️ ป้องกัน Cookie Tampering ด้วยการทำ JWT
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET); // อย่าลืมใส่ใน .env
        const token = await new SignJWT(payload)
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("1d") // หมดอายุใน 1 วัน
          .sign(secretKey);

        const response = NextResponse.json({
          success: true,
          message: "เข้าสู่ระบบสำเร็จ",
        });

        // 🛡️ ป้องกัน XSS ด้วย httpOnly: true เสมอ
        response.cookies.set("nstct_admin_token", token, {
          httpOnly: true, // เปลี่ยนเป็น true เด็ดขาด
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
          path: "/",
        });

        return response;
      }
    }

    // 💡 ตอบกลับแบบกว้างๆ เพื่อป้องกัน User Enumeration
    return NextResponse.json(
      { success: false, message: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" },
      { status: 500 },
    );
  }
}

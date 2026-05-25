import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";
import bcrypt from "bcryptjs";
import { z } from "zod";

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
              AND em.emp_section IN ('admin','System') 
              AND us.user_status <> 0 
              AND us.user_name = @username
        `;

    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(query);

    if (result.recordset.length > 0) {
      const dbUser = result.recordset[0];

      // เปรียบเทียบรหัสผ่าน
      const isPasswordMatch = await bcrypt.compare(
        password,
        dbUser.user_passwordh,
      );

      if (isPasswordMatch) {
        const user = {
          FullName: `${dbUser.emp_name} ${dbUser.emp_lname}`,
          Role: dbUser.emp_section,
        };

        const response = NextResponse.json({ success: true, user });

        // --- Security Check 3: Secure Cookie Settings ---
        response.cookies.set(
          "nstct_admin_token",
          encodeURIComponent(JSON.stringify(user)),
          {
            httpOnly: false, // ⚠️ แนะนำ: ถ้าหน้าเว็บ (Client) ไม่ได้ใช้คำสั่งอ่านคุกกี้นี้ ควรเปลี่ยนเป็น true เพื่อกัน XSS
            secure: process.env.NODE_ENV === "production", // บังคับใช้ HTTPS บน Server จริง
            sameSite: "lax", // 🛡️ ป้องกันการโจมตีข้ามไซต์ (CSRF)
            maxAge: 60 * 60 * 24, // 1 วัน
            path: "/",
          },
        );

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

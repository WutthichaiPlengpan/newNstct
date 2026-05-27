import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT_REQUESTS = 5; // อนุญาตให้ยิงได้สูงสุด 5 ครั้ง
const WINDOW_TIME = 60 * 1000; // ในช่วงเวลา 1 นาที

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);

  if (!clientData) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_TIME });
    return false;
  }

  if (now > clientData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_TIME });
    return false;
  }

  clientData.count++;

  if (clientData.count > LIMIT_REQUESTS) {
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "คุณส่งคำขอถี่เกินไป กรุณารออีก 1 นาทีก่อนลองใหม่อีกครั้ง",
        },
        { status: 429 },
      );
    }

    // 💡 เราอ่านข้อมูล (body) ตรงนี้ครั้งเดียวเสร็จเรียบร้อยแล้ว
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // ใช้ TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"NSTCT Contact Form" <${process.env.EMAIL_USER}>`,
      to: "admin@nstct.co.th",
      replyTo: email,
      subject: `[Contact Us] ${subject}`,
      html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <h2 style="color: #1e3a8a; border-bottom: 2px solid #bfdbfe; padding-bottom: 12px; margin-top: 0;">
                        📬 มีข้อความใหม่จากหน้า "ติดต่อเรา"
                    </h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; width: 120px;"><strong>ชื่อผู้ติดต่อ:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><strong>อีเมล:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><strong>หัวข้อเรื่อง:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold;">${subject}</td>
                        </tr>
                    </table>

                    <h4 style="margin-bottom: 8px; color: #4b5563;">รายละเอียดข้อความ:</h4>
                    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap; line-height: 1.6;">${message}</div>
                    
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; text-align: center;">
                        คุณสามารถกด "ตอบกลับ (Reply)" อีเมลฉบับนี้ เพื่อตอบกลับไปยัง <b>${email}</b> ได้โดยตรง
                    </p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "ส่งข้อความสำเร็จ" });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาด" },
      { status: 500 },
    );
  }
}

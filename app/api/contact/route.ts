import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
    try {
        const { name, email, subject, message } = await request.json();

        // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
        if (!name || !email || !subject || !message) {
            return NextResponse.json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
        }

        // 💡 ตั้งค่าการเชื่อมต่อ Email (ใช้อีเมลเดียวกับระบบก่อนหน้านี้)
        const transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            secure: false, // ใช้ TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 💡 จัดรูปแบบอีเมลส่งหา Admin
        const mailOptions = {
            from: `"NSTCT Contact Form" <${process.env.EMAIL_USER}>`,
            to: "admin@nstct.co.th", // 👈 ส่งเข้าอีเมลแอดมิน
            replyTo: email, // 💡 ทริค: กำหนด Reply-To ให้แอดมินกด "ตอบกลับ" แล้วเด้งเข้าอีเมลของลูกค้าทันที
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
        console.error("Contact Form Error:", error);
        return NextResponse.json({ success: false, message: "ระบบส่งอีเมลขัดข้องชั่วคราว" }, { status: 500 });
    }
}
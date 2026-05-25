import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// 💡 กำหนดชนิดไฟล์ที่ปลอดภัย (ป้องกันไฟล์ .exe, .bat, .js ที่อาจเป็นไวรัส)
const ALLOWED_MIME_TYPES = [
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
];

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        
        // ดึงข้อมูลจากฟอร์ม
        const position = formData.get("position") as string;
        const fullname = formData.get("fullname") as string;
        const phone = formData.get("phone") as string;
        const email = formData.get("email") as string;
        const resume = formData.get("resume") as File;

        if (!position || !fullname || !phone || !email || !resume) {
            return NextResponse.json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
        }

        // 💡 ตรวจสอบความปลอดภัย: เช็คชนิดไฟล์ว่าเป็นเอกสารจริงๆ
        if (!ALLOWED_MIME_TYPES.includes(resume.type)) {
            return NextResponse.json({ 
                success: false, 
                message: "เพื่อความปลอดภัย อนุญาตให้อัปโหลดเฉพาะไฟล์ PDF หรือ Word (DOC, DOCX) เท่านั้น" 
            }, { status: 400 });
        }

        // แปลงไฟล์เป็น Buffer เพื่อแนบไปกับอีเมล
        const bytes = await resume.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 💡 ตั้งค่าการเชื่อมต่อ Email (ใช้อีเมลเดียวกับระบบ Billing)
        const transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            secure: false, // ใช้ TLS
            auth: {
                user: process.env.EMAIL_USER, // ดึงจาก .env.local
                pass: process.env.EMAIL_PASS, // ดึงจาก .env.local
            },
        });

        // 💡 จัดรูปแบบอีเมลให้ดูเป็นมืออาชีพ ไม่เป็นสแปม
        const mailOptions = {
            from: `"NSTCT Recruitment" <${process.env.EMAIL_USER}>`,
            to: "admin@nstct.co.th", // 👈 ส่งไปที่อีเมลที่ต้องการ
            subject: `[Job Application] มีผู้สมัครงานใหม่ตำแหน่ง: ${position}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">แจ้งเตือน: มีผู้สมัครงานใหม่</h2>
                    <p><strong>ตำแหน่งที่สมัคร:</strong> ${position}</p>
                    <p><strong>ชื่อ - นามสกุล:</strong> ${fullname}</p>
                    <p><strong>เบอร์โทรศัพท์:</strong> <a href="tel:${phone}">${phone}</a></p>
                    <p><strong>อีเมล:</strong> <a href="mailto:${email}">${email}</a></p>
                    <br/>
                    <p style="font-size: 14px; color: #666;">
                        * โปรดตรวจสอบเอกสาร Resume / CV ของผู้สมัครจากไฟล์แนบ
                    </p>
                </div>
            `,
            attachments: [
                {
                    filename: resume.name, // ชื่อไฟล์
                    content: buffer,       // ข้อมูลไฟล์
                    contentType: resume.type // แจ้ง Mail Server ว่าเป็นไฟล์อะไร (ช่วยลดโอกาสโดนมองเป็นไวรัส)
                }
            ]
        };

        // สั่งส่งอีเมล
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: "ส่งอีเมลใบสมัครเรียบร้อย" });

    } catch (error) {
        console.error("Apply Job Error:", error);
        return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการส่งอีเมล" }, { status: 500 });
    }
}
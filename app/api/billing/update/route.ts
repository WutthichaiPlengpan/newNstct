import { NextResponse } from "next/server";
import { connectAccountDB } from "@/app/lib/db";
import sql from "mssql";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
    try {
        const { supplierCode, action, invoices } = await request.json();

        if (!supplierCode || !invoices || invoices.length === 0) {
            return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
        }

        const pool = await connectAccountDB();
        let totalPay = 0;
        let emailBodyHTML = "";
        let emailSubject = "";

        // ==========================================
        // 1. กรณี: กดยืนยันการวางบิล (Confirm)
        // ==========================================
        if (action === 'confirm') {
            emailSubject = "[Notification] Confirm Billing";
            emailBodyHTML = `
                <h2 style="color: #1e3a8a;">Confirm Billing</h2>
                <p><b>By Supplier Code:</b> ${supplierCode}</p>
                <p><b>Date:</b> ${new Date().toLocaleDateString('th-TH')}</p>
                <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">
                    <tr style="background-color: #f3f4f6;">
                        <th>Invoice No</th>
                        <th>WHT (%)</th>
                        <th>WHT Amount</th>
                        <th>Net Payment</th>
                    </tr>
            `;

            for (const inv of invoices) {
                // คำนวณยอดเงินบน Server เพื่อความปลอดภัย
                const actualGrand = inv.grandTotal * inv.type;
                const whtAmount = (inv.amount * inv.whtPercent) / 100 * inv.type;
                const netPayment = actualGrand - whtAmount;

                // อัปเดตฐานข้อมูล
                await pool.request()
                    .input("WHT", sql.Decimal(5, 2), inv.whtPercent)
                    .input("Payment", sql.Decimal(18, 2), netPayment)
                    .input("WHTData", sql.Decimal(18, 2), whtAmount)
                    .input("InvNo", sql.VarChar, inv.invNo)
                    .input("Supplier", sql.VarChar, supplierCode)
                    .query(`
                        UPDATE Tb_BillingSup 
                        SET WithHolding = @WHT, Payment = @Payment, Status = 'Y', WithHoldData = @WHTData 
                        WHERE InvoiceNo = @InvNo AND Supplier = @Supplier
                    `);

                totalPay += netPayment;
                emailBodyHTML += `
                    <tr>
                        <td align="center">${inv.invNo}</td>
                        <td align="center">${inv.whtPercent}%</td>
                        <td align="right">${whtAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td align="right"><b>${netPayment.toLocaleString('en-US', {minimumFractionDigits: 2})}</b></td>
                    </tr>
                `;
            }
            emailBodyHTML += `
                    <tr style="background-color: #eef2ff;">
                        <td colspan="3" align="right"><b>Grand Total</b></td>
                        <td align="right"><b style="color: #2563eb; font-size: 16px;">${totalPay.toLocaleString('en-US', {minimumFractionDigits: 2})}</b></td>
                    </tr>
                </table>
            `;

        } 
        // ==========================================
        // 2. กรณี: กดยกเลิกการวางบิล (Cancel)
        // ==========================================
        else if (action === 'cancel') {
            emailSubject = "[Notification] Cancel Billing";
            emailBodyHTML = `
                <h2 style="color: #dc2626;">Cancel Billing</h2>
                <p><b>By Supplier Code:</b> ${supplierCode}</p>
                <p><b>Date:</b> ${new Date().toLocaleDateString('th-TH')}</p>
                <p>รายการ Invoice ที่ถูกยกเลิก:</p>
                <ul>
            `;

            for (const inv of invoices) {
                // อัปเดตเคลียร์ค่าทั้งหมดกลับเป็น N
                await pool.request()
                    .input("InvNo", sql.VarChar, inv.invNo)
                    .input("Supplier", sql.VarChar, supplierCode)
                    .query(`
                        UPDATE Tb_BillingSup 
                        SET WithHolding = NULL, WithHoldData = 0, Payment = NULL, Status = 'N' 
                        WHERE InvoiceNo = @InvNo AND Supplier = @Supplier
                    `);
                emailBodyHTML += `<li>${inv.invNo}</li>`;
            }
            emailBodyHTML += `</ul>`;
        }

        // ==========================================
        // 3. ระบบส่งอีเมลแจ้งเตือนแผนกบัญชี
        // ==========================================
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
            from: '"NSTCT Billing System" <info@nstct.co.th>',
            to: [
                "info@nstct.co.th", 
                "supattra@nstct.co.th", 
                "pila@nstct.co.th", 
                "piraporn@nstct.co.th", 
                "wannapa@nstct.co.th"
            ],
            subject: emailSubject,
            html: emailBodyHTML, // ใช้อีเมลรูปแบบ HTML เพื่อตารางที่สวยงาม
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailErr) {
            console.error("Mail Send Error:", mailErr);
            // ไม่ return error ออกไป เพราะถึงส่งเมลไม่ผ่าน แต่บันทึกลง Database สำเร็จแล้ว
        }

        return NextResponse.json({ 
            success: true, 
            message: action === 'confirm' ? "ระบบวางบิลสำเร็จ" : "ยกเลิกการวางบิลแล้ว" 
        });

    } catch (error) {
        console.error("Update Billing Error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}
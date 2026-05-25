import { NextResponse } from "next/server";
import { connectAccountDB } from "@/app/lib/db"; 
import sql from "mssql";

export async function POST(request: Request) {
    try {
        const { supplierCode, taxId } = await request.json();

        if (!supplierCode || !taxId) {
            return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
        }

        const pool = await connectAccountDB();

        // ==========================================
        // 1. ตรวจสอบ Supplier (อ้างอิงจาก Logic PHP เดิม RIGHT(Taxid,4))
        // ==========================================
        const authQuery = `
            SELECT SupplierCode, SupplierName 
            FROM Tb_Supplier 
            WHERE SupplierCode = @supplierCode AND RIGHT(Taxid, 4) = @taxId
        `;

        const authResult = await pool.request()
            .input("supplierCode", sql.VarChar, supplierCode)
            .input("taxId", sql.VarChar, taxId)
            .query(authQuery);

        // ถ้าไม่เจอข้อมูล แปลว่ารหัสผิด
        if (authResult.recordset.length === 0) {
            return NextResponse.json({ success: false, message: "รหัสผู้ใช้งานหรือ Tax ID ไม่ถูกต้อง" }, { status: 401 });
        }

        // เก็บชื่อ Supplier ไว้โชว์ที่หน้าเว็บ
        const supplierName = authResult.recordset[0].SupplierName;

        // ==========================================
        // 2. ดึงข้อมูล Invoices ของ Supplier เจ้านี้
        // ==========================================
        // (ดึงย้อนหลัง 1 ปี เพื่อไม่ให้ข้อมูลโหลดหนักเกินไป หรือคุณจะแก้เป็นดึงทั้งหมดก็ได้)
        const invQuery = `
            SELECT 
                bs.InvoiceNo, 
                bs.InvoiceDate, 
                bs.Amount, 
                bs.GrandTotal, 
                bs.WithHolding, 
                bs.Status, 
                ah.APType
            FROM Tb_BillingSup bs
            LEFT JOIN Tb_APEntryH ah ON ah.Supplier = bs.Supplier AND bs.InvoiceNo = ah.InvoiceNo
            WHERE bs.Supplier = @supplierCode 
              AND bs.InvoiceDate >= DATEADD(year, -1, GETDATE()) 
            ORDER BY bs.InvoiceDate DESC
        `;

        const invResult = await pool.request()
            .input("supplierCode", sql.VarChar, supplierCode)
            .query(invQuery);

        // ==========================================
        // 3. จัดรูปแบบข้อมูลส่งกลับไปให้หน้า React (Frontend)
        // ==========================================
        const invoices = invResult.recordset.map((row, index) => {
            
            // แปลงวันที่จาก Database ให้อยู่ในรูปแบบ DD/MM/YYYY
            const dateObj = new Date(row.InvoiceDate);
            const formattedDate = dateObj.toLocaleDateString('en-GB'); 

            return {
                id: index + 1, // สร้าง ID จำลองเพื่อให้ Checkbox ใน React ทำงานได้
                invNo: row.InvoiceNo,
                date: formattedDate,
                amount: row.Amount || 0,
                grandTotal: row.GrandTotal || 0,
                type: String(row.APType).trim() === 'C' ? -1 : 1, // เช็คว่าเป็น Credit Note (หักลบ) หรือไม่
                whtPercent: row.WithHolding || 0,
                status: row.Status || 'N'
            };
        });

        // ส่งผลลัพธ์กลับไปยังหน้าเว็บ
        return NextResponse.json({
            success: true,
            supplierName: supplierName,
            invoices: invoices
        });

    } catch (error) {
        console.error("POST /api/billing/login Error:", error);
        return NextResponse.json(
            { success: false, error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ฐานข้อมูล" },
            { status: 500 }
        );
    }
}
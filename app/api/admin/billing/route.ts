import { NextResponse } from "next/server";
import { connectAccountDB } from "@/app/lib/db";
import sql from "mssql";

// 1. ดึงข้อมูลรอบบิลทั้งหมดมาแสดงในตาราง Admin
export async function GET() {
    try {
        const pool = await connectAccountDB();
        const result = await pool.request().query(`
            SELECT SchID, SchYear, SchMonth, StartDate, EndDate, IsActive 
            FROM tb_BillingSchedules 
            ORDER BY StartDate DESC
        `);
        return NextResponse.json({ success: true, data: result.recordset });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}

// 2. เพิ่มรอบวางบิลใหม่
export async function POST(request: Request) {
    try {
        const { schMonth, startDate, endDate } = await request.json();
        
        // คำนวณปีจากวันที่เริ่ม
        const schYear = new Date(startDate).getFullYear();

        const pool = await connectAccountDB();
        await pool.request()
            .input('SchYear',  schYear)
            .input('SchMonth', schMonth)
            .input('StartDate',  startDate)
            .input('EndDate',  endDate)
            .query(`
                INSERT INTO tb_BillingSchedules (SchYear, SchMonth, StartDate, EndDate, IsActive) 
                VALUES (@SchYear, @SchMonth, @StartDate, @EndDate, 1)
            `);
            
        return NextResponse.json({ success: true, message: "เพิ่มรอบบิลสำเร็จ" });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}

// 3. ยกเลิกรอบวางบิล (อัปเดต IsActive = 0 แทนการลบทิ้ง เพื่อเก็บประวัติไว้)
export async function PUT(request: Request) {
    try {
        const { schId } = await request.json();
        const pool = await connectAccountDB();
        await pool.request()
            .input('SchID',  schId)
            .query(`
                UPDATE tb_BillingSchedules 
                SET IsActive = 0 
                WHERE SchID = @SchID
            `);
            
        return NextResponse.json({ success: true, message: "ยกเลิกรอบบิลสำเร็จ" });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}
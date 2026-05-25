import { NextResponse } from "next/server";
import { connectAccountDB } from "@/app/lib/db";
import sql from "mssql";

export async function GET(request: Request) {
   try {
        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get("year");
        const targetYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

        // 2. ใช้ pool ของฝั่งบัญชี
        const pool = await connectAccountDB(); 

        const query = `
            SELECT SchMonth, StartDate, EndDate 
            FROM tb_BillingSchedules 
            WHERE SchYear = @year AND IsActive = 1
            ORDER BY StartDate ASC
        `;

        const result = await pool.request()
            .input("year", sql.Int, targetYear)
            .query(query);

        const schedules = result.recordset;

        // 4. ตรวจสอบว่า "วันนี้" อยู่ในช่วงเปิดวางบิลรอบไหนหรือไม่ (isOpenNow)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // ตัดเวลาทิ้ง เอาแค่วันที่

        let isOpenNow = false;

        for (const sch of schedules) {
            // วันที่จาก Database
            const startDate = new Date(sch.StartDate);
            const endDate = new Date(sch.EndDate);
            
            // ปรับเวลาให้ครอบคลุมถึงสิ้นวันของ EndDate
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            // เช็คว่า วันนี้ อยู่ระหว่าง StartDate และ EndDate หรือไม่
            if (today >= startDate && today <= endDate) {
                isOpenNow = true;
                break; // ถ้าเจอแล้วว่าอยู่ในช่วง ก็หยุดหาได้เลย
            }
        }

        // 5. ส่งข้อมูลกลับไปให้หน้า Frontend (React)
        return NextResponse.json({
            success: true,
            data: schedules,
            isOpenNow: isOpenNow,
            year: targetYear
        });

    } catch (error) {
        console.error("GET /api/billing/schedule Error:", error);
        return NextResponse.json(
            { success: false, error: "ไม่สามารถดึงข้อมูลรอบวางบิลได้" },
            { status: 500 }
        );
    }
}
import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q");

        if (!q || q.trim() === "") {
            return NextResponse.json({ success: true, results: [] });
        }

        const pool = await connectDB();
        
        // 💡 เราจะใช้ UNION ALL เพื่อดึงข้อมูลจากหลายๆ ตารางมารวมกัน
        // ใช้ LIKE @keyword เพื่อป้องกัน SQL Injection
        const query = `
            -- 1. ค้นหาใน ข่าวสาร (News)
            SELECT 
                'news' as Type, 
                NewsID as ID, 
                Title, 
                Content as Description, 
                CoverImage as ImageUrl,
                CreatedAt as Date
            FROM tb_hr_News 
            WHERE Status = 1 AND (Title LIKE @keyword OR Content LIKE @keyword)

            UNION ALL

            -- 2. ค้นหาใน กิจกรรม (Activities)
            SELECT 
                'activity' as Type, 
                ActivityID as ID, 
                Title, 
                Description, 
                CoverImage as ImageUrl,
                ActivityDate as Date
            FROM tb_hr_Activities 
            WHERE IsActive = 1 AND (Title LIKE @keyword OR Description LIKE @keyword)

            UNION ALL

            -- 3. ค้นหาใน ตำแหน่งงาน (Jobs)
            SELECT 
                'job' as Type, 
                JobID as ID, 
                Title, 
                Requirements as Description, 
                NULL as ImageUrl,
                CreatedAt as Date
            FROM tb_hr_Jobs 
            WHERE IsActive = 1 AND (Title LIKE @keyword OR Requirements LIKE @keyword)
            
            ORDER BY Date DESC
        `;

        // 💡 ใส่ % ครอบคำค้นหา และบังคับเป็น NVarChar เพื่อรองรับ ไทย/ญี่ปุ่น
        const searchKeyword = `%${q}%`;
        const result = await pool.request()
            .input('keyword', sql.NVarChar, searchKeyword)
            .query(query);

        return NextResponse.json({ success: true, results: result.recordset });
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการค้นหา" }, { status: 500 });
    }
}
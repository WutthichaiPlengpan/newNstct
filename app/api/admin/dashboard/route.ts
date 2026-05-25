import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";

export async function GET() {
    try {
        const pool = await connectDB();
        
        // 💡 ดึงข้อมูลสถิติที่สำคัญมารวมกัน
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM tb_web_nstct_Logs WHERE ActionType = 'PAGE_VISIT') as TotalVisits,
                (SELECT COUNT(*) FROM tb_web_nstct_Logs WHERE ActionType = 'COOKIE_ACCEPT') as TotalCookieAccepts,
                (SELECT COUNT(*) FROM tb_hr_Jobs WHERE IsActive = 1) as ActiveJobs,
                (SELECT COUNT(*) FROM tb_hr_Activities WHERE IsActive = 1) as TotalActivities
        `;
        const statsResult = await pool.request().query(statsQuery);

        const logsQuery = `
            SELECT TOP 20 * FROM tb_web_nstct_Logs 
            ORDER BY CreatedAt DESC
        `;
        const logsResult = await pool.request().query(logsQuery);

        return NextResponse.json({ 
            success: true, 
            stats: statsResult.recordset[0],
            recentLogs: logsResult.recordset 
        });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
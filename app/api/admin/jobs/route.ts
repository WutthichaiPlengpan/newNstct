import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";

export async function GET() {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT * FROM tb_hr_Jobs 
            WHERE IsActive = 1 
            ORDER BY CreatedAt DESC
        `);
        return NextResponse.json({ success: true, data: result.recordset });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { title, department, location, requirements } = await request.json();
        const pool = await connectDB();
        
        await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Department', sql.NVarChar, department)
            .input('Location', sql.NVarChar, location)
            .input('Requirements', sql.NVarChar, requirements)
            .query(`
                INSERT INTO tb_hr_Jobs (Title, Department, Location, Requirements)
                VALUES (@Title, @Department, @Location, @Requirements)
            `);

        return NextResponse.json({ success: true, message: "บันทึกสำเร็จ" });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, title, department, location, requirements } = await request.json();
        const pool = await connectDB();
        
        await pool.request()
            .input('JobID', sql.Int, id)
            .input('Title', sql.NVarChar, title)
            .input('Department', sql.NVarChar, department)
            .input('Location', sql.NVarChar, location)
            .input('Requirements', sql.NVarChar, requirements)
            .query(`
                UPDATE tb_hr_jobs 
                SET Title = @Title, 
                    Department = @Department, 
                    Location = @Location, 
                    Requirements = @Requirements
                WHERE JobID = @JobID
            `);

        return NextResponse.json({ success: true, message: "อัปเดตสำเร็จ" });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const pool = await connectDB();
        
        // Soft Delete (เปลี่ยนสถานะเป็น 0 แทนการลบทิ้งถาวร)
        await pool.request()
            .input('JobID', sql.Int, id)
            .query(`UPDATE tb_hr_jobs SET IsActive = 0 WHERE JobID = @JobID`);
            
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
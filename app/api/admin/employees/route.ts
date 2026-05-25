import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";




export async function GET(request: Request) {

    try{
        const pool = await connectDB();
        const result = await pool.request().query(`
            select COUNT(*) as emp from tb_hr_employee where emp_status = 1`);

        return NextResponse.json({ success: true, data: result.recordset[0].emp });
    }

    catch(error){
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }


}

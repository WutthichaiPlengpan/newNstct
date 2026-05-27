import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import sql from "mssql";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const pool = await connectDB();
    let query = `
            SELECT a.*, 
                   (SELECT COUNT(*) FROM tb_hr_ActivityImages i WHERE i.ActivityID = a.ActivityID) as PhotoCount
            FROM tb_hr_Activities a 
            WHERE a.IsActive = 1
        `;
    if (category) query += ` AND a.Category = @Category`;
    query += ` ORDER BY a.ActivityDate DESC`;

    const requestSql = pool.request();
    if (category) requestSql.input("Category", category);

    const result = await requestSql.query(query);
    return NextResponse.json({ success: true, data: result.recordset });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, category, date, description } = await request.json();
    const pool = await connectDB();
    await pool
      .request()
      .input("Title", title)
      .input("Category", category)
      .input("ActivityDate", date)
      .input("Description", description || "")
      .query(
        `INSERT INTO tb_hr_Activities (Title, Category, ActivityDate, Description) VALUES (@Title, @Category, @ActivityDate, @Description)`,
      );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const pool = await connectDB();

    // 💡 แยกว่าเป็นการทำงานแบบ "ตั้งเป็นรูปปก" หรือ "อัปเดตข้อมูลกิจกรรม"
    if (body.action === "setCover") {
      await pool
        .request()
        .input("ActivityID", body.id)
        .input("CoverImage", body.coverImage)
        .query(
          `UPDATE tb_hr_Activities SET CoverImage = @CoverImage WHERE ActivityID = @ActivityID`,
        );
      return NextResponse.json({
        success: true,
        message: "ตั้งเป็นรูปปกสำเร็จ",
      });
    }

    // กรณีอัปเดตข้อมูลกิจกรรม
    await pool
      .request()
      .input("ActivityID", body.id)
      .input("Title", body.title)
      .input("Category", body.category)
      .input("ActivityDate", body.date)
      .input("Description", body.description || "").query(`
                UPDATE tb_hr_Activities 
                SET Title = @Title, Category = @Category, ActivityDate = @ActivityDate, Description = @Description
                WHERE ActivityID = @ActivityID
            `);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const pool = await connectDB();
    await pool
      .request()
      .input("ActivityID", id)
      .query(
        `UPDATE tb_hr_Activities SET IsActive = 0 WHERE ActivityID = @ActivityID`,
      );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

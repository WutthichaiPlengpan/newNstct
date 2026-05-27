import sql from "mssql";

declare global {
  var poolMain: sql.ConnectionPool | null;
  var poolAccount: sql.ConnectionPool | null;
}

// 1. Config สำหรับก้อนที่ 1 (ฐานข้อมูลหลัก / HR / Web)
const configMain = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "",
  database: process.env.DB_NAME,

  //   options: {
  //     encrypt: process.env.DB_ENCRYPT === "true",
  //     trustServerCertificate: true, // สำคัญมากสำหรับ Local Server
  //   },

  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.NODE_ENV === "development",
  },
};

// 2. Config สำหรับก้อนที่ 2 (ฐานข้อมูลบัญชี / Account)
const configAccount = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "",
  database: process.env.DB_NAME_ACC, // ชี้ไปที่ DB_NAME_ACC
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.NODE_ENV === "development",
  },
};

// ==========================================
// ฟังก์ชันเรียกใช้ฐานข้อมูลหลัก (DB 1)
// ==========================================
export async function connectDB() {
  try {
    // 🛡️ ป้องกัน Connection Leak ใน Next.js
    if (global.poolMain) return global.poolMain;

    const pool = await new sql.ConnectionPool(configMain).connect();
    if (process.env.NODE_ENV !== "production") global.poolMain = pool;
    return pool;
  } catch (err) {
    console.error("Main Database Connection Failed: ", err);
    throw err;
  }
}

// ==========================================
// ฟังก์ชันเรียกใช้ฐานข้อมูลบัญชี (DB 2)
// ==========================================
export async function connectAccountDB() {
  try {
    if (global.poolAccount) return global.poolAccount;

    const pool = await new sql.ConnectionPool(configAccount).connect();
    if (process.env.NODE_ENV !== "production") global.poolAccount = pool;
    return pool;
  } catch (err) {
    console.error("Account Database Connection Failed: ", err);
    throw err;
  }
}

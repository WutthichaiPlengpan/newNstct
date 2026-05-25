import sql from 'mssql';

// 1. Config สำหรับก้อนที่ 1 (ฐานข้อมูลหลัก / HR / Web)
const configMain = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || '',
    database: process.env.DB_NAME,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true, // สำคัญมากสำหรับ Local Server
    },
};

// 2. Config สำหรับก้อนที่ 2 (ฐานข้อมูลบัญชี / Account)
const configAccount = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || '',
    database: process.env.DB_NAME_ACC, // ชี้ไปที่ DB_NAME_ACC
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true,
    },
};

// ตัวแปรเก็บสถานะการเชื่อมต่อ (เพื่อไม่ให้สร้าง Connection ใหม่ทุกครั้งที่มีคนรีเฟรชหน้าเว็บ)
let poolMain: sql.ConnectionPool | null = null;
let poolAccount: sql.ConnectionPool | null = null;

// ==========================================
// ฟังก์ชันเรียกใช้ฐานข้อมูลหลัก (DB 1)
// ==========================================
export async function connectDB() {
    try {
        if (poolMain) return poolMain; // ถ้าเคยต่อแล้ว ให้ใช้ของเดิม
        poolMain = await new sql.ConnectionPool(configMain).connect();
        return poolMain;
    } catch (err) {
        console.error('Main Database Connection Failed: ', err);
        throw err;
    }
}

// ==========================================
// ฟังก์ชันเรียกใช้ฐานข้อมูลบัญชี (DB 2)
// ==========================================
export async function connectAccountDB() {
    try {
        if (poolAccount) return poolAccount; // ถ้าเคยต่อแล้ว ให้ใช้ของเดิม
        poolAccount = await new sql.ConnectionPool(configAccount).connect();
        return poolAccount;
    } catch (err) {
        console.error('Account Database Connection Failed: ', err);
        throw err;
    }
}
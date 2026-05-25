# 📌 Project Overview: NSTCT Corporate Website
**Project Name:** NST Coil Center (Thailand) Ltd. Corporate Website
**Description:** เว็บไซต์องค์กรสำหรับผู้ให้บริการศูนย์ตัดเหล็กม้วนคุณภาพสูง รองรับ 3 ภาษา มีระบบความปลอดภัย (Anti-Bot) รองรับ PDPA และมีระบบจัดการหลังบ้าน (Back-office) แยกส่วนชัดเจน
**Current Stage:** Frontend (UI) เสร็จสมบูรณ์ 95% กำลังเข้าสู่เฟส Backend (API & Database)

---

## 🛠️ 1. Tech Stack & Tools (เครื่องมือที่ใช้)
* **Framework:** Next.js 14+ (App Router)
* **Language:** TypeScript (Strict typing)
* **Styling:** Tailwind CSS
* **Package Manager:** Bun
* **State Management:** React Context API (สำหรับระบบแปลภาษา)
* **Security / Anti-Bot:** Cloudflare Turnstile (`@marsidev/react-turnstile`)
* **Database (Planned):** Microsoft SQL Server (MSSQL)
* **API (Planned):** Next.js Route Handlers (`app/api/...`)

---

## 📂 2. Project Architecture (โครงสร้างโปรเจกต์)
ใช้การแบ่ง **Route Groups** เพื่อแยก Layout และ Security ระหว่างหน้าบ้านและหลังบ้านอย่างเด็ดขาด

```text
app/
├── (public)/              # กลุ่มหน้าเว็บสำหรับบุคคลทั่วไป
│   ├── about/             # ประวัติ, นโยบายคุณภาพ, นโยบายความเป็นส่วนตัว
│   ├── activity/          # กิจกรรมบริษัท, ประเพณี
│   ├── billing/           # ตรวจสอบรอบวางบิล
│   ├── contact/           # ติดต่อเรา (ฟอร์ม + Map)
│   ├── download/          # ดาวน์โหลดและอัปโหลดไฟล์ (ต้องใช้ Code / Login)
│   ├── job/               # สมัครงาน (ฟอร์ม + Upload Resume)
│   ├── machine/           # เครื่องจักร
│   ├── products/          # สินค้า
│   ├── services/          # บริการ
│   ├── types/             # ชนิดเหล็ก
│   ├── layout.tsx         # Public Layout (มี Header, Footer, Cookie Consent)
│   └── page.tsx           # หน้าแรก (Home)
│
├── (admin)/               # กลุ่มจัดการหลังบ้าน (ต้อง Login)
│   ├── dashboard/         # หน้าหลักระบบหลังบ้าน
│   ├── login/             # หน้าเข้าสู่ระบบสำหรับพนักงาน
│   └── layout.tsx         # Admin Layout (มี Sidebar, ไม่มี Public Header/Footer)
│
├── api/                   # (Planned) API Endpoints สำหรับต่อ Database
├── components/            # UI Components ที่ใช้ร่วมกัน (Header, Footer, CookieConsent)
├── contexts/              # Global State (เช่น LanguageContext.tsx)
├── locales/               # ไฟล์แปลภาษา (th.json, en.json, jp.json)
└── layout.tsx             # Root Layout (ตั้งค่า Font Prompt, Language Provider)

✅ 3. Implemented Features (งานที่ทำเสร็จแล้ว)
Multi-language System (i18n): * สร้าง LanguageContext จัดการภาษา TH, EN, JP แบบ Custom

บันทึกค่าภาษาลง localStorage เพื่อจดจำการใช้งาน

Security Forms: * ติดตั้ง @marsidev/react-turnstile ในหน้า Contact, Job และ Download เพื่อป้องกัน Bot สแปมฟอร์ม

PDPA Compliance: * สร้าง CookieConsent component แถบแจ้งเตือนคุกกี้ที่บันทึกค่าลง localStorage

UI / UX Design: * ออกแบบด้วย Tailwind CSS เน้นโทนสีน้ำเงิน/ขาว ดูน่าเชื่อถือ ทันสมัย และ Responsive รองรับมือถือ 100%

Route Separation: * แยก (public) และ (admin) สำเร็จเพื่อป้องกัน Layout ชนกัน

🚀 4. Roadmap & Pending Tasks (สิ่งที่ต้องทำต่อไป)
Phase 2: Backend & Database Integration
[ ] Database Connection: ติดตั้ง mssql และสร้าง Utility สำหรับเชื่อมต่อฐานข้อมูล

[ ] API - Billing: สร้าง API ดึงข้อมูลรอบบิลและสถานะอินวอยซ์จาก MSSQL

[ ] API - Upload/Download: ทำระบบ Upload ไฟล์ขึ้น Server และสร้างรหัส Token สุ่ม 10 หลักเก็บลง Database

[ ] API - Job Application: รับข้อมูลจากฟอร์ม ตรวจสอบ Turnstile Secret Key ฝั่งเซิร์ฟเวอร์ บันทึกไฟล์ Resume ลงเครื่อง และเซฟข้อมูลลง MSSQL

[ ] API - Contact: ทำระบบส่งอีเมล (เช่นใช้ nodemailer หรือ Resend) แจ้งเตือนแอดมินเมื่อมีคนกรอกฟอร์ม

Phase 3: Admin Back-office & Security
[ ] Admin Login: ทำระบบ Login ตรวจสอบ Username/Password จาก MSSQL

[ ] Authentication Middleware: สร้าง middleware.ts เพื่อป้องกันไม่ให้คนไม่มีสิทธิ์เข้าถึง Route /admin/... (ใช้ JWT หรือ HTTP-only Cookies)

[ ] Admin Dashboards: ทำหน้าจอให้ HR ดูใบสมัคร, บัญชีดูรอบบิล, ไอทีดูไฟล์อัปโหลด

🤖 5. Rules for AI Agents (ข้อบังคับในการเขียนโค้ดสำหรับ AI)
เมื่อ AI (เช่น คุณ) ต้องทำการเขียนหรือแก้ไขโค้ดในโปรเจกต์นี้ ต้องปฏิบัติตามกฎเหล่านี้อย่างเคร่งครัด:

Use Next.js App Router Standards: ใช้โครงสร้าง App Router เท่านั้น ห้ามใช้ Page Router เด็ดขาด ("use client" หรือ "use server" ต้องใส่ให้ถูกที่)

TypeScript Strictly: ต้องระบุ Type หรือ Interface เสมอ ห้ามใช้ any โดยไม่จำเป็น

Tailwind CSS Only: ใช้ Tailwind ในการจัดการ CSS (ยกเว้น Custom Scrollbar หรือสิ่งที่ Tailwind ทำไม่ได้จริงๆ ให้เขียนแบบ Inline Style หรือลงใน globals.css)

Environment Variables: ห้าม Hardcode Secret Keys ลงในไฟล์โค้ดเด็ดขาด (เช่น Turnstile Secret, Database Password) ให้ดึงจาก process.env เท่านั้น

i18n Consistency: หากเพิ่มข้อความใหม่ใน UI ต้องเพิ่มคีย์แปลภาษาใน locales/th.json, en.json, jp.json ทุกครั้ง และเรียกใช้ผ่านฟังก์ชัน t("key")

No Duplicate Scripts: สำหรับ Cloudflare Turnstile ให้ใช้ Component <Turnstile /> จาก @marsidev/react-turnstile เท่านั้น ห้าม import <Script> ซ้ำซ้อนเพื่อป้องกัน Error TrustedHTML

🔐 6. Environment Variables Requirements
ตัวแปรที่ต้องมีในไฟล์ .env.local (ห้าม Commit ลง Git)

Code snippet
# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAACMmd13JoBGwBlqE
TURNSTILE_SECRET_KEY=your_secret_key_here

# Database (MSSQL)
DB_SERVER=your_db_server
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT / Auth
JWT_SECRET=your_strong_secret


# Role and Objective
คุณคือ Senior Next.js Security Engineer ภารกิจหลักของคุณคือการเขียนโค้ด Next.js (App Router) ให้มีความปลอดภัยสูงสุด โดยต้องป้องกันช่องโหว่ระดับวิกฤต เช่น Remote Code Execution (RCE), Local File Inclusion (LFI) และ SQL Injection อย่างเด็ดขาด อ้างอิงจากการโจมตีผ่าน Automated Vulnerability Scanner

# Strict Security Rules for Code Generation

## 1. File Upload Security (ป้องกัน RCE & LFI)
เมื่อต้องเขียนฟังก์ชันเกี่ยวกับการอัปโหลดไฟล์ (เช่น ผ่าน Server Actions หรือ API Routes) ให้ยึดกฎต่อไปนี้:
- **ห้ามใช้ชื่อไฟล์เดิมเด็ดขาด (Never trust user filename):** ให้เปลี่ยนชื่อไฟล์ใหม่ทั้งหมดด้วย `crypto.randomUUID()` ทุกครั้ง
- **Strict Whitelist Extensions:** อนุญาตเฉพาะนามสกุลไฟล์ที่กำหนดเท่านั้น และต้องตรวจสอบคู่กับ MIME Type อย่างเข้มงวด
- **Validation:** ใช้ไลบรารีอย่าง `Zod` ในการตรวจสอบขนาดไฟล์ (Max Size) และประเภทไฟล์ก่อนนำไปประมวลผลต่อ
- **Storage:** หากเป็นไปได้ ให้แนะนำการเก็บไฟล์ไว้ที่ Cloud Storage (เช่น AWS S3, Cloudflare R2) แทนการเก็บลง Local Disk (public folder) เพื่อป้องกันการรันสคริปต์บนเซิร์ฟเวอร์หลัก

## 2. Database & SQL Injection Prevention
- **ใช้ ORM หรือ Parameterized Queries เท่านั้น:** แนะนำให้ใช้ ORM (เช่น Prisma หรือ Drizzle) ในการติดต่อฐานข้อมูล 
- **ห้ามทำ Dynamic SQL / String Concatenation:** หากจำเป็นต้องใช้ Raw Query ห้ามนำตัวแปรมาต่อสตริงโดยตรงเด็ดขาด ต้องใช้ฟีเจอร์ Parameterized (เช่น `sql\`SELECT * FROM users WHERE id = ${id}\``)
- **Sanitize Input:** ทำความสะอาดข้อมูลทุกครั้งก่อนส่งเข้าฐานข้อมูล

## 3. General Input Validation (Zod is Mandatory)
- ข้อมูลที่รับมาจาก Client ทุกประเภท (Forms, URL Params, Search Params, Headers) ต้องผ่านการ Validate ด้วย `Zod` schema ในฝั่งเซิร์ฟเวอร์เสมอ
- ปฏิเสธ Request ทันที (Return 400 Bad Request) หากข้อมูลมีอักขระต้องสงสัย หรือไม่ตรงตาม Schema

## 4. Next.js Specific Security
- **Server Actions Security:** ใน Server Actions ทุกตัว ต้องมีการตรวจสอบสิทธิ์ (Authentication & Authorization check) ก่อนเริ่มทำงานเสมอ ป้องกันกระบวนการ Insecure Direct Object Reference (IDOR)
- **Environment Variables:** ห้ามหลุดข้อมูลความลับ (Secrets, DB URL) ไปฝั่ง Client เด็ดขาด ตัวแปรฝั่งเซิร์ฟเวอร์ห้ามขึ้นต้นด้วย `NEXT_PUBLIC_`
- **Security Headers:** แนะนำการตั้งค่า Content-Security-Policy (CSP) และ Security Headers อื่นๆ ในไฟล์ `next.config.js`

# Response Format
เมื่อผู้ใช้ขอให้คุณเขียนโค้ดที่เกี่ยวกับการรับส่งข้อมูลหรืออัปโหลดไฟล์ คุณต้อง:
1. เขียนโค้ดที่อิมพลีเมนต์กฎความปลอดภัยด้านบนโดยอัตโนมัติ
2. อธิบายสั้นๆ ว่าโค้ดส่วนไหนที่เขียนขึ้นเพื่อป้องกัน SQLi หรือ RCE/LFI
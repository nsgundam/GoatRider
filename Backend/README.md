# 🐐 GoatRider - Backend Server

Backend service สำหรับเกมการ์ด GoatRider (Web3 Card Game) พัฒนาด้วย **Node.js**, **Express**, **TypeScript**, และ **PostgreSQL**

## 🛠 Tech Stack

* **Runtime:** Node.js (v18+)
* **Language:** TypeScript
* **Framework:** Express.js
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Real-time:** Socket.IO
* **Web3/Auth:** Ethers.js (Verify Signature), JSON Web Token (JWT)

---

## 🚀 Getting Started (วิธีรันโปรเจ็ค)

### 1. Prerequisites (สิ่งที่ต้องมี)
* Node.js (แนะนำ v18 หรือ v20)
* PostgreSQL (ต้องติดตั้งและรัน Service อยู่)

### 2. Installation
```bash
# ติดตั้ง dependencies
npm install
```

### 3. Environment Setup (.env)
สร้างไฟล์ .env ที่ root folder และใส่ค่าดังนี้:

``` bash
PORT=3001
# แก้ username:password และชื่อ DB ให้ตรงกับเครื่องตัวเอง
DATABASE_URL="postgresql://postgres:password@localhost:5432/GoatRider?schema=public"

# คีย์ลับสำหรับสร้าง Token (ตั้งยากๆ ห้ามบอกใคร)
JWT_SECRET="super_secret_key_change_this_in_production"
```

### 4. Database Setup
# สร้างตารางใน Database (Migration)
npx prisma migrate dev --name init_db

### 5. Run Server
# รันโหมด Developer (Auto-restart)
```bash
npm run dev
```
Server จะรันที่: http://localhost:3001

## API Documentation

🔐 Authentication (Web3 Login)

⚠️ Important: ข้อความที่ใช้ Sign (Sign Message) ต้องตรงกันทั้ง Frontend และ Backend คือ:

"Welcome to GoatRider! Please sign this message to login."

### 1. Login (เช็คชื่อ / เข้าสู่ระบบ)

Endpoint: POST /api/auth/login
Body: 
``` JSON
{
  "walletAddress": "0x123...",
  "signature": "0xabc..."
}
```
Response (Success - มีชื่อแล้ว):
```JSON
{
  "status": "LOGIN_SUCCESS",
  "token": "eyJhbG...",
  "user": { "username": "Somchai", ... }
}
```
Response (User Not Found - ต้องสมัครก่อน):
```JSON
{
  "status": "REGISTER_REQUIRED",
  "isRegistered": false
}
```

### 2. Register (สมัครสมาชิกใหม่)
Endpoint: POST /api/auth/register
Body:
```JSON
{
  "walletAddress": "0x123...",
  "signature": "0xabc...", 
  "username": "MyCoolName"
}
```
Response:
```JSON
{
  "status": "REGISTER_SUCCESS",
  "token": "eyJhbG...",
  "user": { ... }
}
```

## 🔌 Socket.IO Events (Real-time)

Connection URL: ws://localhost:3001

Event Name	Direction	         Description
connection	Client -> Server	 เมื่อ Client เชื่อมต่อ Socket สำเร็จ
join_room	Client -> Server	 ส่ง roomId เพื่อขอเข้าห้อง
message	    Server -> Client	 ข้อความแจ้งเตือนทั่วไปจาก Server

📂 Project Structure
``` Plaintext
src/
├── config/         # ค่า Config ต่างๆ
├── controllers/    # Logic การทำงานหลัก (Auth, Room, Game)
├── routes/         # กำหนด URL Path (API Endpoints)
├── services/       # Business Logic ที่ซับซ้อน
├── sockets/        # จัดการ Real-time Events
└── server.ts       # Entry point ของ Server
```

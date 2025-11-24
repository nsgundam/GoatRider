// src/server.ts
import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// --- (1) เพิ่มบรรทัดนี้: นำเข้า Route ของระบบ Auth ---
import authRoutes from './routes/authRoutes'; 

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient(); // ตัวเชื่อม DB

// Setup CORS (อนุญาตให้ Frontend เข้าถึง)
app.use(cors({
    origin: "http://localhost:3000", // URL ของ Frontend Next.js
    methods: ["GET", "POST"]
}));
app.use(express.json()); // อ่าน JSON body ได้

// --- (2) เพิ่มบรรทัดนี้: เปิดใช้งาน API Login ---
// ถ้ามีคนยิงมาที่ /api/auth/login มันจะวิ่งไปที่ authRoutes
app.use('/api/auth', authRoutes);


// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// --- Test Routes (REST API) ---
app.get('/', (req: Request, res: Response) => {
    res.send('Card Game Backend is Running! 🚀');
});

app.get('/health', async (req: Request, res: Response) => {
    try {
        // ลองยิง DB เล่นๆ เช็คว่าต่อติดไหม
        await prisma.$queryRaw`SELECT 1`; 
        res.json({ status: 'OK', database: 'Connected' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', database: 'Disconnected', error });
    }
});

// --- Socket.IO Logic (เบื้องต้น) ---
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // ลองรับ Event Join Room
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
        // ส่งกลับไปบอกทุกคนในห้อง
        io.to(roomId).emit('message', `User ${socket.id} has joined!`);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
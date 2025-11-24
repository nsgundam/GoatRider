// src/server.ts
import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes'; 
import roomRoutes from './routes/roomRoutes';
import { roomHandler } from './sockets/roomHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);


// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// --- Test Routes (REST API) ---
app.get('/', (req: Request, res: Response) => {
    res.send('GOAT RIDER is Running! 🚀');
});


// --- Socket.IO Logic (เบื้องต้น) ---
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // เรียกใช้ Logic ห้องแยกออกมา
    roomHandler(io, socket);

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
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
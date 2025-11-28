// src/sockets/roomHandler.ts
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const roomHandler = (io: Server, socket: Socket) => {
    
    // Event: ผู้เล่นขอเข้าห้อง
    socket.on('join_room', async (data: { roomId: string, walletAddress: string }) => {
        const { roomId, walletAddress } = data;
        console.log(`🔌 Socket ${socket.id} requesting to join room: ${roomId}`);

        if (!roomId || typeof roomId !== 'string') {
            socket.emit('error', 'Invalid Room ID');
            return;
        }
        if (!walletAddress || typeof walletAddress !== 'string') {
            socket.emit('error', 'Invalid Wallet Address');
            return;
        }

        try {
            // 1. เช็คว่าห้องมีอยู่จริงไหม และสถานะ WAITING ไหม
            const room = await prisma.room.findUnique({
                where: { roomId },
                include: { players: true }
            });

            if (!room) {
                socket.emit('error', 'Room not found');
                return;
            }

            if (room.status !== 'WAITING') {
                socket.emit('error', 'Game already started or finished');
                return;
            }

            if (room.players.length >= room.maxPlayers) {
                const isMember = room.players.some(p => p.walletAddress === walletAddress);
                if (!isMember) {
                    socket.emit('error', 'Room is full');
                    return;
                }
            }

            // 2. บันทึกคนเข้าห้องลง DB
            await prisma.playerRoomState.upsert({
                where: {
                    roomId_walletAddress: {
                        roomId: roomId,
                        walletAddress: walletAddress
                    }
                },
                update: {},
                create: {
                    roomId: roomId,
                    walletAddress: walletAddress,
                    isReady: false
                }
            });

            // 3. ดึง Socket เข้าห้อง
            socket.join(roomId);

            // 4. ดึงข้อมูลผู้เล่นล่าสุดในห้อง
            const playersInRoom = await prisma.playerRoomState.findMany({
                where: { roomId },
                include: { user: true }
            });

            // 5. แจ้งเตือนทุกคนในห้อง
            // ✅ UPDATE: ส่ง requiredStake ไปด้วย (เอามาจากตัวแปร room ด้านบน)
            io.to(roomId).emit('room_update', {
                roomId,
                players: playersInRoom,
                requiredStake: room.requiredStake 
            });

            console.log(`✅ User ${walletAddress} joined room ${roomId}`);

        } catch (error) {
            console.error("Join Room Error:", error);
            socket.emit('error', 'Internal server error during join');
        }
    });

    // Event: ผู้เล่นกด Ready (หรือ Backend แจ้งว่าจ่ายเงินแล้ว)
    socket.on('player_ready', async (data: { roomId: string, walletAddress: string }) => {
        const { roomId, walletAddress } = data;

        if (!roomId || !walletAddress) return;

        try {
            await prisma.playerRoomState.update({
                where: {
                    roomId_walletAddress: { roomId, walletAddress }
                },
                data: { isReady: true }
            });

            const players = await prisma.playerRoomState.findMany({
                where: { roomId },
                include: { user: true }
            });

            // ✅ UPDATE: ต้อง Query ห้องมาเพื่อเอา requiredStake ก่อนส่งกลับ
            const roomInfo = await prisma.room.findUnique({
                where: { roomId },
                select: { requiredStake: true } // เลือกมาแค่ field เดียวเพื่อความเร็ว
            });

            io.to(roomId).emit('room_update', { 
                roomId, 
                players,
                requiredStake: roomInfo?.requiredStake || 0 
            });
            
            // เช็คว่าพร้อมครบทุกคนหรือยัง?
            const allReady = players.every(p => p.isReady);
            if (allReady && players.length >= 2) {
                 io.to(roomId).emit('can_start_game', true);
            }

        } catch (error) {
            console.error("Ready Error:", error);
        }
    });
};
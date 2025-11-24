// src/sockets/roomHandler.ts
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const roomHandler = (io: Server, socket: Socket) => {
    
    // Event: ผู้เล่นขอเข้าห้อง
    socket.on('join_room', async ({ roomId, walletAddress }) => {
        console.log(`🔌 Socket ${socket.id} requesting to join room: ${roomId}`);

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
                // เช็คว่าคนนี้เคยอยู่ในห้องอยู่แล้วหรือเปล่า (Re-join)
                const isMember = room.players.some(p => p.walletAddress === walletAddress);
                if (!isMember) {
                    socket.emit('error', 'Room is full');
                    return;
                }
            }

            // 2. บันทึกคนเข้าห้องลง DB (PlayerRoomState)
            // ใช้ upsert เพื่อป้องกันการ insert ซ้ำถ้าเขากด join รัวๆ
            await prisma.playerRoomState.upsert({
                where: {
                    roomId_walletAddress: {
                        roomId: roomId,
                        walletAddress: walletAddress
                    }
                },
                update: {}, // ถ้ามีแล้วไม่ต้องทำอะไร
                create: {
                    roomId: roomId,
                    walletAddress: walletAddress,
                    isReady: false
                }
            });

            // 3. ดึง Socket เข้าห้อง
            socket.join(roomId);

            // 4. ดึงข้อมูลผู้เล่นล่าสุดในห้อง เพื่อส่งให้ทุกคนดู
            const playersInRoom = await prisma.playerRoomState.findMany({
                where: { roomId },
                include: { user: true } // เอาชื่อ Username มาด้วย
            });

            // 5. แจ้งเตือนทุกคนในห้อง (รวมตัวเราด้วย)
            io.to(roomId).emit('room_update', {
                roomId,
                players: playersInRoom
            });

            console.log(`✅ User ${walletAddress} joined room ${roomId}`);

        } catch (error) {
            console.error("Join Room Error:", error);
            socket.emit('error', 'Internal server error during join');
        }
    });

    // Event: ผู้เล่นกด Ready
    socket.on('player_ready', async ({ roomId, walletAddress }) => {
        try {
            // อัปเดตสถานะ Ready ใน DB
            await prisma.playerRoomState.update({
                where: {
                    roomId_walletAddress: { roomId, walletAddress }
                },
                data: { isReady: true }
            });

            // แจ้งทุกคนว่าคนนี้พร้อมแล้ว
            const players = await prisma.playerRoomState.findMany({
                where: { roomId },
                include: { user: true }
            });

            io.to(roomId).emit('room_update', { roomId, players });
            
            // เช็คว่าพร้อมครบทุกคนหรือยัง? (ถ้าครบ -> ส่งสัญญาณให้เจ้าของห้องเห็นปุ่ม Start)
            const allReady = players.every(p => p.isReady);
            if (allReady && players.length >= 2) { // อย่างน้อย 2 คน
                 io.to(roomId).emit('can_start_game', true);
            }

        } catch (error) {
            console.error("Ready Error:", error);
        }
    });
};
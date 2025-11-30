// src/sockets/gameHandler.ts
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { setGame } from '../utils/gameStore';
import { initializeGame } from '../utils/gameLogic';

const prisma = new PrismaClient();

export const gameHandler = (io: Server, socket: Socket) => {

    // ✅ รับคำสั่ง Start Game ตรงนี้
    socket.on('start_game', async ({ roomId }) => {
        try {
            console.log(`🎮 Start Game Requested: ${roomId}`);

            // 1. ดึงข้อมูลผู้เล่น
            const playersDB = await prisma.playerRoomState.findMany({
                where: { roomId },
                include: { user: true },
                orderBy: { walletAddress: 'asc' }
            });

            // (Optional) เช็คจำนวนคน
            if (playersDB.length < 1) return; // แก้เป็น 2 ถ้าต้องการบังคับ

            // 2. เตรียมข้อมูลเกม
            const playersData = playersDB.map(p => ({
                wallet: p.walletAddress,
                username: p.user.username
            }));

            // 3. สับไพ่
            const { deck, players } = initializeGame(playersData);

            // 4. เก็บสถานะเกมเข้า Memory
            setGame(roomId, {
                roomId,
                players,
                deck,
                discardPile: [],
                turnIndex: 0,
                turnDirection: 1,
                attackTurns: 1,
                gameStatus: 'PLAYING'
            });

            // 5. อัปเดต DB
            await prisma.room.update({
                where: { roomId },
                data: { status: 'IN_GAME' }
            });

            // 6. 🚀 ส่งสัญญาณ Game Started (Frontend จะ Redirect ตอนนี้)
            io.to(roomId).emit('game_started', { timestamp: Date.now() });

            // 7. แจกไพ่เข้ามือ
            players.forEach(p => {
                io.to(roomId).emit('update_hand', {
                    walletAddress: p.walletAddress,
                    hand: p.hand
                });
            });

            // 8. บอกตาเริ่ม
            io.to(roomId).emit('turn_change', {
                currentTurnWallet: players[0].walletAddress,
                timeLeft: 30
            });

        } catch (error) {
            console.error("Start Game Error:", error);
        }
    });
};
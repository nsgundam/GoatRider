// src/controllers/roomController.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

// ==========================================
// 1. Create Room (สร้างห้อง)
// ==========================================
export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { requiredStake, maxPlayers} = req.body;
        const creatorAddress = req.user?.walletAddress; // ได้มาจาก Middleware

        if (!creatorAddress) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // สร้างห้องใน DB
        const newRoom = await prisma.room.create({
            data: {
                requiredStake: Number(requiredStake),
                maxPlayers: Number(maxPlayers),
                creatorWalletAddress: creatorAddress,
                status: 'WAITING', // สถานะเริ่มต้น
            }
        });

        res.status(201).json({
            message: "Room created successfully",
            room: newRoom
        });

    } catch (error) {
        console.error("Create Room Error:", error);
        res.status(500).json({ error: "Failed to create room" });
    }
};

// ==========================================
// 2. Get Rooms (ดึงรายชื่อห้อง หน้า Lobby)
// ==========================================
export const getRooms = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // ดึงเฉพาะห้องที่กำลังรอ (WAITING)
        const rooms = await prisma.room.findMany({
            where: { status: 'WAITING' },
            include: {
                creator: { select: { username: true } }, // ดึงชื่อคนสร้างมาโชว์ด้วย
                _count: { select: { players: true } }    // นับจำนวนคนในห้อง
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(rooms);
    } catch (error) {
        console.error("Get Rooms Error:", error);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
};

// ==========================================
// 3. Get Single Room (ดึงข้อมูลห้องเดียว)
// ==========================================
export const getRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;

        if(!roomId){
            res.status(400).json({ error: "Room ID is required" });
            return;
        }

        const room = await prisma.room.findUnique({
            where: { roomId },
            include: {
                players: {
                    include: { user: true } // ดึงข้อมูลผู้เล่นในห้องด้วย
                }
            }
        });

        if (!room) {
            res.status(404).json({ error: "Room not found" });
            return;
        }

        res.json(room); // ส่งข้อมูลห้อง (รวม requiredStake) กลับไป
    } catch (error) {
        console.error("Get Room Error:", error);
        res.status(500).json({ error: "Failed to fetch room" });
    }
};

// ==========================================
// [TEST ONLY] จำลองการจ่ายเงิน (Mock Payment)
// ==========================================
export const mockPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roomId, walletAddress } = req.body;
        
        // 1. อัปเดต DB เหมือน Listener ตัวจริง
        await prisma.playerRoomState.update({
            where: {
                roomId_walletAddress: { roomId, walletAddress }
            },
            data: { isReady: true }
        });

        // 2. (ข้อจำกัด: เราไม่มี access ถึง object 'io' ตรงนี้ง่ายๆ)
        // แต่ไม่เป็นไร แค่เช็ค DB ว่าเปลี่ยนเป็น true ก็พอแล้วสำหรับการเทสเบื้องต้น
        
        res.json({ message: `Mock payment success for ${walletAddress} in room ${roomId}` });

    } catch (error) {
        res.status(500).json({ error: "Mock payment failed" });
    }
};
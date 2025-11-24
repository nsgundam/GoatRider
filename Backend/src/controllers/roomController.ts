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
        const { roomName, requiredStake, maxPlayers, password } = req.body;
        const creatorAddress = req.user?.walletAddress; // ได้มาจาก Middleware

        if (!creatorAddress) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // สร้างห้องใน DB
        const newRoom = await prisma.room.create({
            data: {
                roomName,
                requiredStake: Number(requiredStake),
                maxPlayers: Number(maxPlayers),
                password, // (ถ้าไม่มีจะเป็น null)
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
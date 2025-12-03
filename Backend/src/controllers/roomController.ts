import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

// 1. Create Room 
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

// 2. Get Single Room 
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
                    include: { user: true }
                }
            }
        });

        if (!room) {
            res.status(404).json({ error: "Room not found" });
            return;
        }

        res.json(room);
    } catch (error) {
        console.error("Get Room Error:", error);
        res.status(500).json({ error: "Failed to fetch room" });
    }
};

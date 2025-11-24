// src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// ข้อความที่ให้ User เซ็น (ต้องตรงกับ Frontend เป๊ะๆ)
const SIGN_MESSAGE = "Welcome to GoatRider! Please sign this message to login.";

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { walletAddress, signature } = req.body;

        if (!walletAddress || !signature) {
            res.status(400).json({ error: "Missing walletAddress or signature" });
            return;
        }

        // 1. ตรวจสอบลายเซ็น (Verify Signature)
        // logic: เอาลายเซ็น + ข้อความ -> แกะออกมาเป็น Address ผู้เซ็น
        const recoveredAddress = ethers.verifyMessage(SIGN_MESSAGE, signature);

        // 2. เช็คว่าคนที่เซ็น คือคนเดียวกับ walletAddress ที่ส่งมาไหม?
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            res.status(401).json({ error: "Invalid signature" });
            return;
        }

        // 3. ถ้าถูกตัวจริง -> หา User ใน DB (ถ้าไม่มีให้สร้างใหม่)
        // ใช้ upsert: ถ้ามี update lastLogin, ถ้าไม่มี create
        let user = await prisma.user.upsert({
            where: { walletAddress: walletAddress },
            update: { lastLogin: new Date() },
            create: {
                walletAddress: walletAddress,
                username: `Player_${walletAddress.slice(0, 6)}`, // ตั้งชื่อมั่วๆ ไปก่อน
            }
        });

        // 4. สร้าง JWT Token (บัตรผ่าน)
        const token = jwt.sign(
            { walletAddress: user.walletAddress },
            process.env.JWT_SECRET || "default_secret_key", // เดี๋ยวไปตั้งใน .env
            { expiresIn: "1d" } // อายุ 1 วัน
        );

        // 5. ส่งกลับไปให้ Frontend
        res.json({
            message: "Login successful",
            token,
            user
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
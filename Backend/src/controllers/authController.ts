// src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// ข้อความสำหรับ Sign (ต้องตรงกับ Frontend)
const SIGN_MESSAGE = "Welcome to GoatRider! Please sign this message to login.";

// --- Helper Function: สร้าง Token ---
const generateToken = (walletAddress: string) => {
    return jwt.sign(
        { walletAddress },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "1d" }
    );
};

// ==========================================
// 1. LOGIN: เช็คว่ามี User ไหม
// ==========================================
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { walletAddress, signature } = req.body;

        if (!walletAddress || !signature) {
             res.status(400).json({ error: "Missing parameters" });
             return;
        }

        // 1. ตรวจสอบลายเซ็น (Verify Signature)
        const recoveredAddress = ethers.verifyMessage(SIGN_MESSAGE, signature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
             res.status(401).json({ error: "Invalid signature" });
             return;
        }

        // 2. ค้นหา User ใน DB
        const user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress }
        });

        // 3. เงื่อนไขการตอบกลับ
        if (user) {
            // A. เจอชื่อ -> ล็อกอินสำเร็จ -> ส่ง Token กลับไป
            const token = generateToken(user.walletAddress);
            
            // อัปเดตเวลา Login ล่าสุด
            await prisma.user.update({
                where: { walletAddress },
                data: { lastLogin: new Date() }
            });

            res.json({
                status: "LOGIN_SUCCESS",
                isRegistered: true,
                token,
                user
            });
        } else {
            // B. ไม่เจอชื่อ -> แจ้งกลับไปว่าต้องลงทะเบียนก่อน
            res.json({
                status: "REGISTER_REQUIRED",
                isRegistered: false
                // ยังไม่ให้ Token จนกว่าจะ Register เสร็จ
            });
        }

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ==========================================
// 2. REGISTER: ลงทะเบียนพร้อมชื่อ
// ==========================================
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { walletAddress, signature, username } = req.body;

        if (!walletAddress || !signature || !username) {
             res.status(400).json({ error: "Missing parameters" });
             return;
        }

        // 1. ตรวจสอบลายเซ็นอีกรอบ (เพื่อความปลอดภัย ป้องกันคนแอบอ้างสวมรอยมาสมัคร)
        const recoveredAddress = ethers.verifyMessage(SIGN_MESSAGE, signature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
             res.status(401).json({ error: "Invalid signature" });
             return;
        }

        // 2. ตรวจสอบว่าชื่อซ้ำไหม?
        const existingName = await prisma.user.findUnique({
            where: { username: username }
        });
        if (existingName) {
             res.status(400).json({ error: "Username already taken" });
             return;
        }

        // 3. สร้าง User ใหม่
        const newUser = await prisma.user.create({
            data: {
                walletAddress: walletAddress,
                username: username
            }
        });

        // 4. สมัครเสร็จ -> ให้ Token เลย (จะได้เข้าเมนูต่อได้ทันที)
        const token = generateToken(newUser.walletAddress);

        res.json({
            status: "REGISTER_SUCCESS",
            token,
            user: newUser
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
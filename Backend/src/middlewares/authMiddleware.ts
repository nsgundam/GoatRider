// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { walletAddress: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // 1. ดึง Token จาก Header (Format: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: "Access denied. No token provided." });
        return;
    }

    // 2. ตรวจสอบ Token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key") as { walletAddress: string };
        req.user = decoded; // แปะข้อมูล user ไว้ใน request
        next(); // ปล่อยผ่านไปทำงานต่อ
    } catch (error) {
        res.status(403).json({ error: "Invalid token." });
    }
};
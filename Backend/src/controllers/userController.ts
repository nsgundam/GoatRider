import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { AuthRequest } from '../middlewares/authMiddleware'; // ใช้ middleware ที่มี user.walletAddress
import TOKEN_ABI from '../config/TokenABI.json'; // ต้องคัดลอกไฟล์นี้มาใช้

const prisma = new PrismaClient();

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const walletAddress = req.user?.walletAddress;

        if (!walletAddress) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // 1. ดึงข้อมูลพื้นฐานจาก DB (Username)
        const user = await prisma.user.findUnique({
            where: { walletAddress }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        // 2. ดึงยอดเหรียญล่าสุดจาก Blockchain
        const rpcUrl = process.env.RPC_URL;
        const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;

        if (!rpcUrl || !tokenAddress) {
             // ถ้า config ไม่สมบูรณ์ ให้ส่งแค่ DB data กลับไป
             res.json({ user, tokenBalance: 'N/A' }); 
             return;
        }
        
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);

        // เรียกฟังก์ชัน balanceOf(address) บน Smart Contract
        const balanceBigInt = await (tokenContract as any).balanceOf(walletAddress);

        // แปลง BigInt ให้เป็นหน่วยที่อ่านได้ (เช่น 100.00 GRD)
        const balanceString = ethers.formatUnits(balanceBigInt, 18); 

        // 3. ส่งข้อมูลทั้งหมดรวมกันกลับไป
        res.json({
            username: user.username,
            walletAddress: user.walletAddress,
            tokenBalance: balanceString 
        });

    } catch (error) {
        console.error("Get User Profile Error:", error);
        res.status(500).json({ error: "Failed to fetch profile data" });
    }
};
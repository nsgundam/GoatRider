import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { AuthRequest } from '../middlewares/authMiddleware';
import TOKEN_ABI from '../config/TokenABI.json';

const prisma = new PrismaClient();

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const walletAddress = req.user?.walletAddress;

        if (!walletAddress) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // 1. ดึงข้อมูลพื้นฐานจาก DB 
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
             res.json({ user, tokenBalance: 'N/A' }); 
             return;
        }
        
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);

        const balanceBigInt = await (tokenContract as any).balanceOf(walletAddress);
        const balanceString = ethers.formatUnits(balanceBigInt, 18); 

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
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import TOKEN_ABI from "../config/TokenABI.json";

const prisma = new PrismaClient();

// ข้อความสำหรับ Sign
const SIGN_MESSAGE = "Welcome to GoatRider! Please sign this message to login.";

// สร้าง Token สำหรับการยืนยันตัวตน
const generateToken = (walletAddress: string) => {
  return jwt.sign(
    { walletAddress },
    process.env.JWT_SECRET || "default_secret_key",
    { expiresIn: "1d" }
  );
};

// 1. LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      res.status(400).json({ error: "Missing parameters" });
      return;
    }

    // 1. ตรวจสอบลายเซ็น
    const recoveredAddress = ethers.verifyMessage(SIGN_MESSAGE, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    // 2. ค้นหา User ใน DB
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress },
    });

    // 3. เงื่อนไขการตอบกลับ
    if (user) {
      const token = generateToken(user.walletAddress);

      await prisma.user.update({
        where: { walletAddress },
        data: { lastLogin: new Date() },
      });

      res.json({
        status: "LOGIN_SUCCESS",
        isRegistered: true,
        token,
        user,
      });
    } else {
      res.json({
        status: "REGISTER_REQUIRED",
        isRegistered: false,
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 2. REGISTER
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress, signature, username } = req.body;

    if (!walletAddress || !signature || !username) {
      res.status(400).json({ error: "Missing parameters" });
      return;
    }

    // 1. ตรวจสอบลายเซ็น
    const recoveredAddress = ethers.verifyMessage(SIGN_MESSAGE, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    // 2. ตรวจสอบว่าชื่อซ้ำไหม
    const existingName = await prisma.user.findUnique({
      where: { username: username },
    });
    if (existingName) {
      res.status(400).json({ error: "Username already taken" });
      return;
    }

    // 3. สร้าง User ใหม่
    const newUser = await prisma.user.create({
      data: {
        walletAddress: walletAddress,
        username: username,
      },
    });

    //แจกเหรียญฟรี 100 GRD
    try {
      // เช็ค Config 
      if (
        process.env.ADMIN_PRIVATE_KEY &&
        process.env.TOKEN_CONTRACT_ADDRESS &&
        process.env.RPC_URL
      ) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const adminWallet = new ethers.Wallet(
          process.env.ADMIN_PRIVATE_KEY,
          provider
        );
        const tokenContract = new ethers.Contract(
          process.env.TOKEN_CONTRACT_ADDRESS!,
          TOKEN_ABI,
          adminWallet
        );

        const amount = ethers.parseUnits("100", 18);

        console.log(`🎁 Faucet: Sending 100 GRD to ${walletAddress}...`);

        const tx = await (tokenContract as any).adminTransfer(walletAddress, amount);
        await tx.wait();

        console.log(`✅ Mint Success: ${tx.hash}`);
      } else {
        console.warn("⚠️ Faucet skipped: Missing .env config");
      }
    } catch (faucetError) {
      console.error("❌ Faucet Error:", faucetError);
    }

    const token = generateToken(newUser.walletAddress);

    res.json({
      status: "REGISTER_SUCCESS",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// src/services/blockchainService.ts
import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
// ⚠️ ต้องมั่นใจว่าไฟล์นี้คือ ABI ตัวล่าสุดที่คุณเพิ่งอัปเดต
import GAME_POOL_ABI from '../config/GamePoolABI.json'; 

const prisma = new PrismaClient();

let contract: ethers.Contract;
let provider: ethers.JsonRpcProvider;

export const initBlockchainListener = (io: Server) => {
    console.log("🔄 Initializing Blockchain Listener...");

    try {
        const rpcUrl = process.env.RPC_URL;
        const contractAddress = process.env.GAME_CONTRACT_ADDRESS;

        if (!rpcUrl || !contractAddress) {
            console.error("❌ Missing RPC_URL or GAME_CONTRACT_ADDRESS in .env");
            return;
        }

        // 1. เชื่อมต่อ Blockchain
        provider = new ethers.JsonRpcProvider(rpcUrl);
        // ใช้ Polling Interval เพื่อความเสถียร (เช็คทุก 3 วินาที)
        provider.pollingInterval = 3000; 

        contract = new ethers.Contract(contractAddress, GAME_POOL_ABI, provider);

        console.log(`👂 Listening to GamePool at: ${contractAddress}`);

        // 2. ฟัง Event: PlayerJoined
        // event PlayerJoined(string indexed roomId, address indexed player, uint256 amount);
        contract.on("PlayerJoined", async (roomId, playerAddress, amount, event) => {
            console.log(`💰 [EVENT] PlayerJoined Detected!`);
            console.log(`   - Room: ${roomId}`);
            console.log(`   - Player: ${playerAddress}`);
            console.log(`   - Amount: ${ethers.formatEther(amount)} GRD`);

            try {
                // A. อัปเดต Database: isReady = true
                // หมายเหตุ: ใช้ updateMany เผื่อกรณี Wallet Address ตัวพิมพ์เล็ก/ใหญ่ไม่ตรงกัน
                const updateResult = await prisma.playerRoomState.updateMany({
                    where: {
                        roomId: roomId,
                        // ใช้ mode: 'insensitive' ไม่ได้ใน updateMany ของ Prisma บางเวอร์ชัน
                        // ดังนั้นเราจะพยายามหาตรงๆ หรือถ้า User เก็บ lowercase ก็จะเจอ
                        walletAddress: {
                            equals: playerAddress,
                            mode: 'insensitive' // บังคับไม่สนตัวพิมพ์เล็กใหญ่
                        } 
                    },
                    data: { isReady: true }
                });

                if (updateResult.count === 0) {
                    console.warn(`⚠️ Warning: User ${playerAddress} not found in room ${roomId} (DB not updated)`);
                    // กรณีนี้อาจเกิดถ้า User จ่ายเงินก่อนกด Join ใน DB (แต่ระบบเรา Join DB ก่อนเสมอ)
                } else {
                    console.log(`✅ Database Updated: ${playerAddress} is READY.`);
                }

                // B. ดึงข้อมูลล่าสุดเพื่อส่ง Socket
                const players = await prisma.playerRoomState.findMany({
                    where: { roomId },
                    include: { user: true }
                });

                const roomInfo = await prisma.room.findUnique({
                    where: { roomId }
                });

                // C. แจ้งเตือน Frontend ผ่าน Socket
                io.to(roomId).emit('room_update', { 
                    roomId, 
                    players,
                    requiredStake: roomInfo?.requiredStake || 0
                });

                // D. เช็คว่าเริ่มเกมได้หรือยัง
                const allReady = players.every(p => p.isReady);
                if (allReady && players.length >= 2) {
                    console.log(`🚀 Room ${roomId} is ready to start!`);
                    io.to(roomId).emit('can_start_game', true);
                }

            } catch (err) {
                console.error("❌ Error processing PlayerJoined event:", err);
            }
        });

    } catch (error) {
        console.error("❌ Failed to init blockchain listener:", error);
    }
};

// ฟังก์ชันจ่ายรางวัล (คงเดิม)
export const payoutWinner = async (roomId: string, winnerAddress: string) => {
    try {
        const privateKey = process.env.ADMIN_PRIVATE_KEY;
        if (!privateKey) throw new Error("Admin Private Key missing");

        const wallet = new ethers.Wallet(privateKey, provider);
        // ใช้ as any เพื่อเลี่ยง TS check ชั่วคราว
        const contractWithSigner = contract.connect(wallet) as any;

        console.log(`💸 Distributing reward for Room ${roomId} to ${winnerAddress}...`);
        
        const tx = await contractWithSigner.distributeReward(roomId, winnerAddress);
        await tx.wait();

        console.log(`✅ Payout Success! TX: ${tx.hash}`);
        return tx.hash;

    } catch (error) {
        console.error("❌ Payout Failed:", error);
        throw error;
    }
};
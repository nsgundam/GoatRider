// src/services/blockchainService.ts
import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import GAME_POOL_ABI from '../config/GamePoolABI.json';// Import ไฟล์ ABI ที่สร้างตะกี้

const prisma = new PrismaClient();

// ตัวแปรเก็บ Instance
let contract: ethers.Contract;
let provider: ethers.JsonRpcProvider;

export const initBlockchainListener = (io: Server) => {
    try {
        const rpcUrl = process.env.RPC_URL;
        const contractAddress = process.env.GAME_CONTRACT_ADDRESS;

        if (!rpcUrl || !contractAddress) {
            console.warn("⚠️ Blockchain config missing. Listener skipped.");
            return;
        }

        // 1. Setup Connection
        provider = new ethers.JsonRpcProvider(rpcUrl);
        contract = new ethers.Contract(contractAddress, GAME_POOL_ABI, provider);

        console.log(`👂 Listening to Contract at: ${contractAddress}`);

        // 2. Listen to 'PlayerJoined' Event
        contract.on("PlayerJoined", async (roomId, playerAddress, amount, event) => {
            console.log(`💰 Payment Detected! Room: ${roomId}, Player: ${playerAddress}`);

            try {
                // A. อัปเดต DB ว่าจ่ายเงินแล้ว
                await prisma.playerRoomState.update({
                    where: {
                        roomId_walletAddress: {
                            roomId: roomId,
                            walletAddress: playerAddress
                        }
                    },
                    data: { 
                        isReady: true // ถือว่าจ่ายเงิน = พร้อมเล่น
                    }
                });

                // B. แจ้งเตือนทุกคนในห้องผ่าน Socket
                io.to(roomId).emit('player_paid', {
                    walletAddress: playerAddress,
                    status: 'PAID'
                });
                
                // C. อัปเดตรายชื่อคนในห้องใหม่
                const players = await prisma.playerRoomState.findMany({
                    where: { roomId },
                    include: { user: true }
                });
                io.to(roomId).emit('room_update', { roomId, players });

                // D. เช็คว่าครบคนหรือยัง เพื่อเริ่มเกม (เหมือนใน RoomHandler)
                const allReady = players.every(p => p.isReady);
                if (allReady && players.length >= 2) {
                    io.to(roomId).emit('can_start_game', true);
                }

            } catch (err) {
                console.error("❌ Error handling payment event:", err);
            }
        });

    } catch (error) {
        console.error("❌ Failed to init blockchain listener:", error);
    }
};

// ฟังก์ชันสำหรับจ่ายเงินรางวัล (เรียกตอนจบเกม)
export const payoutWinner = async (roomId: string, winnerAddress: string) => {
    try {
        const privateKey = process.env.ADMIN_PRIVATE_KEY;
        if (!privateKey) throw new Error("Admin Private Key missing");

        const wallet = new ethers.Wallet(privateKey, provider);
        const contractWithSigner = contract.connect(wallet) as ethers.Contract;

        console.log(`💸 Distributing reward for Room ${roomId} to ${winnerAddress}...`);
        
        // เรียกฟังก์ชัน Smart Contract
        const tx = await  (contractWithSigner as any).distributeReward(roomId, winnerAddress);
        await tx.wait(); // รอ Transaction ยืนยัน

        console.log(`✅ Payout Success! TX: ${tx.hash}`);
        return tx.hash;

    } catch (error) {
        console.error("❌ Payout Failed:", error);
        throw error;
    }
};
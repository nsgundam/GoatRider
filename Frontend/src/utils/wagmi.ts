import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// 11155111 คือ Chain ID ของ Sepolia
const targetChain = sepolia;

// กำหนด Chain ที่รองรับ: ในโปรเจกต์นี้ใช้แค่ Sepolia
export const config = getDefaultConfig({
    appName: 'Goat Ridder', // ชื่อ DApp ของคุณ
    projectId: 'YOUR_PROJECT_ID', // ต้องใส่ ID ที่ได้จาก WalletConnect (ฟรี)
    chains: [targetChain],
    ssr: true, // รองรับ Server-Side Rendering ของ Next.js
});
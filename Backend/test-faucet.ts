// test-faucet.ts
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// 1. ตั้งค่า Config
const RPC_URL = process.env.RPC_URL;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const TOKEN_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS; 
const RECIPIENT_ADDRESS = "0xb9ab6ef3338ba3c6c527d2fc4ef01e3864562069"; // ⚠️ อย่าลืมแก้ตรงนี้

// Minimal ABI
const ABI = [
  "function adminTransfer(address to, uint256 amount) external",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function main() {
  console.log("🔍 Starting Faucet Test...\n");

  if (!RPC_URL || !ADMIN_PRIVATE_KEY || !TOKEN_ADDRESS) {
    throw new Error("❌ Missing .env config (RPC, KEY, or ADDRESS)");
  }

  // Setup Provider & Wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

  // 🔴 แก้ตรงนี้: เติม 'as any' เพื่อปิด TypeScript Check สำหรับ object นี้
  const contract = new ethers.Contract(TOKEN_ADDRESS, ABI, adminWallet) as any;

  console.log(`👤 Admin Address: ${adminWallet.address}`);
  console.log(`🪙 Token Contract: ${TOKEN_ADDRESS}`);

  // ---------------------------------------------------------
  // CHECK 1: Admin มีค่าแก๊ส (ETH) ไหม?
  // ---------------------------------------------------------
  const ethBalance = await provider.getBalance(adminWallet.address);
  console.log(`⛽ Admin ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);
  
  if (ethBalance === BigInt(0)) {
    console.error("❌ ERROR: Admin has 0 ETH! Cannot pay gas.");
    return;
  }

  // ---------------------------------------------------------
  // CHECK 2: Smart Contract มีเหรียญ GRD ให้แจกไหม?
  // ---------------------------------------------------------
  try {
      const contractTokenBalance = await contract.balanceOf(TOKEN_ADDRESS);
      console.log(`🏦 Contract GRD Balance: ${ethers.formatEther(contractTokenBalance)} GRD`);

      const amountToSend = ethers.parseUnits("100", 18); 

      if (contractTokenBalance < amountToSend) {
        console.error("❌ ERROR: Smart Contract ถังแตก! (มีเหรียญไม่พอแจก)");
        console.log("💡 Solution: โอนเหรียญ GRD เข้าไปที่ Address ของ Smart Contract ด่วน");
        return;
      }

      // ---------------------------------------------------------
      // ACTION: ลองสั่งโอน
      // ---------------------------------------------------------
      console.log(`\n🚀 Attempting to transfer 100 GRD to ${RECIPIENT_ADDRESS}...`);

      // เรียก adminTransfer
      const tx = await contract.adminTransfer(RECIPIENT_ADDRESS, amountToSend);
      console.log(`⏳ Transaction sent! Hash: ${tx.hash}`);
      console.log("   Waiting for confirmation...");

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
          console.log("✅ Transaction Confirmed!");
          
          // เช็คยอดเงินปลายทาง
          const userBal = await contract.balanceOf(RECIPIENT_ADDRESS);
          console.log(`🎉 User New Balance: ${ethers.formatEther(userBal)} GRD`);
      } else {
          console.error("❌ Transaction Failed on-chain.");
      }

  } catch (error: any) {
    console.error("\n❌ Transaction Error:", error.reason || error.message);
    if (error.code === "CALL_EXCEPTION") {
        console.log("👉 สาเหตุที่เป็นไปได้: Contract ไม่มีเหรียญ หรือ คุณไม่ใช่ Owner");
    }
  }
}

main();
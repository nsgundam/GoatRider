// test-start-game.ts
import { io } from "socket.io-client";

// 1. ตั้งค่า Config
const SERVER_URL = "http://localhost:3001";

// ⚠️ ใส่ ID ห้องที่คุณเพิ่งสร้าง (ไปดูใน Prisma Studio หรือ Response ตอน Create)
const TEST_ROOM_ID = "4b6da150-d1c3-4af2-8bbd-d4af586f4985"; 

// ⚠️ ใส่ Wallet Address ของคุณที่มีใน DB
const MY_WALLET = "0xb9ab6eF3338BA3C6C527D2FC4Ef01e3864562069"; 

console.log("🤖 Initializing Game Start Test...");

const socket = io(SERVER_URL);

socket.on("connect", () => {
    console.log(`✅ Connected to Server! (Socket ID: ${socket.id})`);

    // 2. ขั้นแรกต้อง Join ห้องก่อน (เพื่อให้ Server รู้ตัวตน)
    console.log(`🚪 Joining Room: ${TEST_ROOM_ID}...`);
    socket.emit("join_room", {
        roomId: TEST_ROOM_ID,
        walletAddress: MY_WALLET
    });

    // 3. รอ 1 วินาที แล้วส่งคำสั่ง Start Game
    setTimeout(() => {
        console.log(`\n🎮 Sending 'start_game' command...`);
        socket.emit("start_game", { roomId: TEST_ROOM_ID });
    }, 1500);
});

// --- Listeners: รอฟังผลลัพธ์จาก Server ---

// A. ฟังว่าเกมเริ่มหรือยัง
socket.on("game_started", (data) => {
    console.log(`\n🚀 [EVENT] game_started Received!`);
    console.log(`   Timestamp: ${data.timestamp}`);
    console.log("   ✅ Server signals to redirect to MainGame.");
});

// B. ฟังว่าได้ไพ่อะไรบ้าง
socket.on("update_hand", (data) => {
    // Server จะส่งไพ่ของทุกคนมา (ถ้าเขียนแบบ Broadcast) หรือส่งเฉพาะของเรา
    // เราเช็คเฉพาะของเรา
    if (data.walletAddress === MY_WALLET) {
        console.log(`\n🃏 [EVENT] update_hand (My Hand):`);
        console.log(`   Cards:`, data.hand); // ควรเห็น ['defuse', '...', '...']
        console.log(`   Total: ${data.hand.length} cards`);
    } else {
        console.log(`   (Hand update for other player: ${data.walletAddress})`);
    }
});

// C. ฟังว่าตาใคร
socket.on("turn_change", (data) => {
    console.log(`\n👉 [EVENT] turn_change:`);
    console.log(`   Current Turn: ${data.currentTurnWallet}`);
    console.log(`   Time Left: ${data.timeLeft}s`);
    
    if (data.currentTurnWallet === MY_WALLET) {
        console.log("   🟢 IT IS YOUR TURN!");
    } else {
        console.log("   🔴 Waiting for opponent...");
    }
    
    // จบการทดสอบ
    console.log("\n🎉 Test Sequence Completed.");
    // socket.disconnect(); // ปิด Socket (ถ้าอยากดู Log ค้างไว้ ให้ comment บรรทัดนี้)
});

// ฟัง Error
socket.on("error", (msg) => {
    console.error(`❌ Error from Server:`, msg);
});
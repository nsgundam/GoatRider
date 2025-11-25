// test-socket.ts
import { io } from "socket.io-client";

// 1. ตั้งค่าการเชื่อมต่อ
const SOCKET_URL = "http://localhost:3001";
const socket = io(SOCKET_URL);

// ข้อมูลจำลอง (Mock Data)
// ⚠️ คุณต้องไปสร้างห้องผ่าน API /api/rooms มาก่อน แล้วเอา ID มาใส่ตรงนี้
const TARGET_ROOM_ID = "ec2b2bb4-60f7-4e3c-8326-6cf3d9ef4857"; 
const MY_WALLET = "0x12f3E7624AdFFc6c7d882445b1033F3Cf7281227"; // เมคขึ้นมาได้เลย

console.log("🔌 Connecting to server...");

socket.on("connect", () => {
    console.log(`✅ Connected! Socket ID: ${socket.id}`);

    // 2. ส่งคำสั่ง Join Room
    console.log(`🚪 Joining room: ${TARGET_ROOM_ID}...`);
    socket.emit("join_room", {
        roomId: TARGET_ROOM_ID,
        walletAddress: MY_WALLET
    });
});

// 3. รอฟังผลตอบรับ (Events ที่ Server ส่งกลับมา)
socket.on("room_update", (data) => {
    console.log("\n📢 ROOM UPDATE RECEIVED:");
    console.log(`   Room ID: ${data.roomId}`);
    console.log(`   Players (${data.players.length}):`);
    data.players.forEach((p: any) => {
        console.log(`     - ${p.user ? p.user.username : p.walletAddress} (Ready: ${p.isReady})`);
    });
});

socket.on("error", (msg) => {
    console.error(`❌ Error from server: ${msg}`);
});

socket.on("disconnect", () => {
    console.log("🔌 Disconnected");
});
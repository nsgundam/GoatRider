// test-auth.ts
import { ethers } from 'ethers';

// ต้องตรงกับใน authController.ts เป๊ะๆ ห้ามผิดแม้แต่ตัวเดียว!
const SIGN_MESSAGE = "Welcome to GoatRider! Please sign this message to login.";
const BASE_URL = "http://localhost:3001/api/auth";

async function main() {
    console.log("🤖 Starting Auth Test Script...\n");

    // 1. จำลองสร้างกระเป๋า Wallet ใหม่ (Simulate User)
    const wallet = ethers.Wallet.createRandom();
    console.log(`👤 Simulated Wallet Address: ${wallet.address}`);

    // 2. เซ็นข้อความ (Sign Message)
    const signature = await wallet.signMessage(SIGN_MESSAGE);
    console.log(`✍️  Signature created: ${signature.substring(0, 20)}...\n`);

    // ==========================================
    // TEST 1: ลอง Login (คาดหวัง: REGISTER_REQUIRED)
    // ==========================================
    console.log("👉 Test 1: Attempting Login (New User)...");
    const loginRes1 = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            walletAddress: wallet.address,
            signature: signature
        })
    });
    const loginData1 = await loginRes1.json();
    console.log("   Result:", loginData1);
    
    if (loginData1.status === "REGISTER_REQUIRED") {
        console.log("   ✅ PASSED: Server told us to register first.\n");
    } else {
        console.log("   ❌ FAILED: Unexpected response.\n");
    }

    // ==========================================
    // TEST 2: ลอง Register (คาดหวัง: REGISTER_SUCCESS + Token)
    // ==========================================
    console.log("👉 Test 2: Attempting Register...");
    const username = `Tester_${Math.floor(Math.random() * 1000)}`;
    const regRes = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            walletAddress: wallet.address,
            signature: signature,
            username: username
        })
    });
    const regData = await regRes.json();
    console.log("   Result:", regData);

    if (regData.status === "REGISTER_SUCCESS" && regData.token) {
        console.log("   ✅ PASSED: Registered and got Token!\n");
    } else {
        console.log("   ❌ FAILED: Register failed.\n");
    }

    // ==========================================
    // TEST 3: ลอง Login ใหม่ (คาดหวัง: LOGIN_SUCCESS + Token)
    // ==========================================
    console.log("👉 Test 3: Attempting Login Again (Registered User)...");
    const loginRes2 = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            walletAddress: wallet.address,
            signature: signature
        })
    });
    const loginData2 = await loginRes2.json();
    console.log("   Result:", loginData2);

    if (loginData2.status === "LOGIN_SUCCESS" && loginData2.token) {
        console.log("   ✅ PASSED: Login success! System remembers us.\n");
    } else {
        console.log("   ❌ FAILED: Login failed.\n");
    }

    console.log("🎉 Test Completed!");
}

main().catch(console.error);
// frontend/src/utils/auth.ts (หรือใส่ใน Component หน้า Login)
import { ethers } from 'ethers';
import { useRouter } from 'next/router'; // หรือ next/navigation สำหรับ App Router

// ⚠️ ต้องตรงกับ Backend เป๊ะๆ ห้ามผิดแม้แต่ตัวอักษรเดียว
const SIGN_MESSAGE = "Welcome to GoatRider! Please sign this message to login.";
const BACKEND_URL = "http://localhost:3001/api/auth";

export const handleLogin = async () => {
  try {
    // 1. ตรวจสอบว่ามี Metamask ไหม
    if (!window.ethereum) {
      alert("กรุณาติดตั้ง Metamask!");
      return;
    }

    // 2. Connect Wallet (ขอเลขกระเป๋า)
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const walletAddress = await signer.getAddress();
    
    console.log("Connected:", walletAddress);

    // 3. Sign Message (เด้ง Popup ให้เซ็น)
    const signature = await signer.signMessage(SIGN_MESSAGE);
    
    console.log("Signature:", signature);

    // 4. ส่งไป Backend: Login
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, signature }),
    });

    const data = await res.json();

    // 5. ตรวจสอบผลลัพธ์จาก Backend
    if (data.status === "LOGIN_SUCCESS") {
      // ✅ ล็อกอินผ่าน -> เก็บ Token -> ไปหน้าเมนู
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert(`ยินดีต้อนรับกลับ ${data.user.username}!`);
      
      // router.push('/menu'); // สั่งเปลี่ยนหน้าตรงนี้
      window.location.href = '/menu'; 

    } else if (data.status === "REGISTER_REQUIRED") {
      // ⚠️ ต้องลงทะเบียนก่อน -> เปิด Modal ให้กรอกชื่อ
      // ตรงนี้ให้ Frontend เขียน Logic เปิด Modal รับค่า 'username'
      const username = prompt("คุณยังไม่ได้ลงทะเบียน กรุณาตั้งชื่อเล่น:");
      
      if (username) {
        // เรียกฟังก์ชันลงทะเบียนต่อ
        await handleRegister(walletAddress, signature, username);
      }
    }

  } catch (error) {
    console.error("Login Failed:", error);
    alert("เกิดข้อผิดพลาดในการล็อกอิน");
  }
};

// ฟังก์ชันสำหรับลงทะเบียน (เรียกต่อเมื่อ User กรอกชื่อเสร็จ)
const handleRegister = async (walletAddress: string, signature: string, username: string) => {
  try {
    const res = await fetch(`${BACKEND_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, signature, username }),
    });

    const data = await res.json();

    if (data.status === "REGISTER_SUCCESS") {
      // ✅ สมัครเสร็จ -> เก็บ Token -> ไปหน้าเมนู
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("ลงทะเบียนสำเร็จ!");
      
      window.location.href = '/menu';
    } else {
      alert("ลงทะเบียนไม่สำเร็จ: " + data.error);
    }
  } catch (error) {
    console.error("Register Failed:", error);
  }
};
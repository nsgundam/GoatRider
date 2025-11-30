"use client";
import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";

//ค่านี้ต้องตรงกับ Backend
const SIGN_MESSAGE = "Welcome to GoatRider! Please sign this message to login.";
const BACKEND_URL = "http://localhost:3001/api/auth";

export default function Welcomepage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // State สำหรับเก็บข้อมูลชั่วคราว
  const [wallet, setWallet] = useState("");
  const [signature, setSignature] = useState(""); // ต้องเก็บลายเซ็นไว้ใช้ตอนสมัคร
  const [showPopup, setShowPopup] = useState(false);
  const [name, setName] = useState("");

  // -----------------------------------------------------------
  // 1. ฟังก์ชันเชื่อมต่อ + Sign Message + Login
  // -----------------------------------------------------------
  async function handleConnectAndLogin() {
    setError("");

    // เช็คว่า Metamask มีไหม
    if (!window.ethereum) {
      alert("Please install Metamask!");
      return;
    }

    try {
      setLoading(true);

      // A. เชื่อมต่อ Wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // ขอสิทธิ์เชื่อมบัญชี
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // B. ขอ Sign Message — จับเฉพาะ error ถ้าผู้ใช้ปฏิเสธ
      let sig;
      try {
        sig = await signer.signMessage(SIGN_MESSAGE);
      } catch (signErr) {
        console.log("User rejected signature or sign failed:", signErr);
        setError("You rejected the signature request. Please confirm the signature in MetaMask to login.");
        setLoading(false);
        return; // หยุด flow — ไม่เรียก backend
      }

      // เก็บ Address + Signature ไว้ใช้ตอนสมัคร
      setWallet(address);
      setSignature(sig);

      // C. ส่งไป login ที่ backend
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, signature: sig }),
      });

      // ถ้า HTTP error ให้อ่านข้อความก่อน
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || "Login request failed");
      }

      const data = await res.json();

      if (data.status === "LOGIN_SUCCESS") {
        // ผู้เล่นเคยสมัครแล้ว
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert(`Welcome back, ${data.user.username}!`);
        router.push("/menu"); // ไปหน้าเมนู
      } else if (data.status === "REGISTER_REQUIRED") {
        // ผู้เล่นใหม่ ต้องสมัคร
        setShowPopup(true);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("handleConnectAndLogin error:", err);
      setError((err && err.message) || "Connection failed or User rejected request");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------------------------
  // 2. ฟังก์ชันสมัครสมาชิก (เมื่อกรอกชื่อใน Popup)
  // -----------------------------------------------------------
  async function handleSubmitName(e) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your name");
      return;
    }

    if (!wallet || !signature) {
      setError("Signature missing. Please reconnect wallet and sign again.");
      return;
    }

    try {
      setLoading(true);

      // ส่งข้อมูลไปสมัครที่ Backend (/register)
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: wallet,
          signature: signature, // ต้องแนบลายเซ็นเดิมไปด้วย
          username: trimmedName,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || "Registration request failed");
      }

      const data = await res.json();

      if (data.status === "REGISTER_SUCCESS") {
        // สมัครสำเร็จ
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Registration Successful!");
        setShowPopup(false);
        router.push("/menu");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("handleSubmitName error:", err);
      setError((err && err.message) || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------------------------
  // UI ส่วนแสดงผล (ปรับให้เหมือนหน้า Menu)
  // -----------------------------------------------------------
  return (
    <div className="relative w-full min-h-screen overflow-hidden">

      {/* ชั้นภาพพื้นหลัง + เบลอ */}
      <div className="absolute inset-0 blur-[3px] opacity-25">
        <CldImage
          src="qnkwna404xq2bvmzpddl"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          alt="background"
        />
      </div>

{/* LOGO (อยู่ซ้าย) */}
<div className="absolute top-[15%] left-[8%] z-20 pointer-events-none">
  <CldImage
    src="glndvl5nezxptcnvqpwq"
    width={1980}
    height={1020}
    className="object-contain w-[900px] select-none"
    alt="game logo"
  />
</div>

{/* ปุ่ม Connect Wallet เยื้องซ้าย (ไม่อยู่ตรงกลางอีกแล้ว) */}
<button
  onClick={handleConnectAndLogin}
  disabled={loading}
  className="
    absolute
    left-[25%]
    top-[70%]
    z-30
    px-10 py-4
    
    text-xl font-bold
    rounded-full
    shadow-[0_6px_0_#a52424]
    bg-white text-black
    hover:bg-[#FBAF22] hover:text-white
    transition
  "
>
  {loading ? "Processing..." : "Connect Wallet"}
</button>
      {/* top-right capsule */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex items-center gap-3 
          bg-[#FBAF22] hover:bg-[#eedebf] px-4 py-2 rounded-full max-w-[320px]
          shadow-[0_10px_0_#a52424] transition-all">
          {/* (optional content: avatar / token) */}
        </div>
      </div>

      {/* Error Message (inline with retry button) */}
      {error && (
        <div className="absolute bottom-8 left-8 z-20 bg-red-500 text-white px-4 py-2 rounded flex items-center gap-3">
          <span>⚠️ {error}</span>
          <button
            onClick={handleConnectAndLogin}
            className="ml-4 bg-white text-black px-3 py-1 rounded"
          >
            Try again
          </button>
        </div>
      )}

      {/* POPUP MODAL (สำหรับตั้งชื่อ) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-md text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Create Account
            </h2>
            <p className="mb-6 text-gray-600">
              Welcome new rider! <br /> Please enter your display name.
            </p>

            <form
              onSubmit={handleSubmitName}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="border-2 border-gray-300 rounded-lg p-3 text-lg
                focus:outline-none focus:border-blue-500 text-black"
                maxLength={15}
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-[#FBAF22] text-black py-3 rounded-lg text-xl font-bold hover:bg-[a52424] transition"
              >
                {loading ? "Creating..." : "Start Game "}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

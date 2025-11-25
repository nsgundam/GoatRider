"use client";
import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { ethers } from "ethers";
import { useRouter } from "next/navigation"; // ใช้สำหรับเปลี่ยนหน้า

// ⚠️ ค่านี้ต้องตรงกับ Backend เป๊ะๆ ห้ามผิด!
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
        
        // เช็คว่ามี Metamask ไหม
        if (!window.ethereum) {
            alert("Please install Metamask! (ไปติดตั้งก่อนเด้ออ้าย)");
            return;
        }

        try {
            setLoading(true);

            // A. เชื่อมต่อ Wallet
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            // B. ขอ Sign Message (เด้ง Popup Metamask)
            const sig = await signer.signMessage(SIGN_MESSAGE);

            // เก็บค่าไว้ใน State เผื่อต้องใช้ตอนสมัคร
            setWallet(address);
            setSignature(sig);

            // C. ส่งไปเช็ค Login ที่ Backend
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: address, signature: sig })
            });

            const data = await res.json();

            if (data.status === "LOGIN_SUCCESS") {
                // ✅ กรณีมีชื่อแล้ว: บันทึก Token แล้วไปหน้า Menu เลย
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                alert(`Welcome back, ${data.user.username}!`);
                router.push("/menu"); // ไปหน้าเมนู (คุณต้องสร้าง page นี้)
            } else if (data.status === "REGISTER_REQUIRED") {
                // 🟡 กรณีไม่มีชื่อ: เปิด Popup ให้กรอกชื่อ
                setShowPopup(true);
            } else {
                setError("Login failed: " + data.error);
            }

        } catch (err: any) {
            console.error(err);
            setError("Connection failed or User rejected request");
        } finally {
            setLoading(false);
        }
    }

    // -----------------------------------------------------------
    // 2. ฟังก์ชันสมัครสมาชิก (เมื่อกรอกชื่อใน Popup)
    // -----------------------------------------------------------
    async function handleSubmitName(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Please enter your name");
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
                    username: trimmedName 
                })
            });

            const data = await res.json();

            if (data.status === "REGISTER_SUCCESS") {
                // ✅ สมัครสำเร็จ: บันทึก Token แล้วไปหน้า Menu
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                alert("Registration Successful!");
                setShowPopup(false);
                router.push("/menu");
            } else {
                setError(data.error || "Registration failed");
            }

        } catch (err) {
            console.error(err);
            setError("Failed to register");
        } finally {
            setLoading(false);
        }
    }

    // -----------------------------------------------------------
    // UI ส่วนแสดงผล
    // -----------------------------------------------------------
    return (
        <div className="w-full h-screen relative overflow-hidden">
            {/* Background Image */}
            <CldImage
                src="qy3vo3jhmpocodpavgrf" // อย่าลืมเช็คชื่อรูปใน Cloudinary
                width={1920}
                height={1080}
                className="w-full h-full object-cover absolute z-0"
                alt="goat rider homepage"
            />

            {/* Title Text */}
            <div className="absolute top-[20%] left-[10%] z-10">
                <h1 className="text-[100px] md:text-[150px] font-bold text-white drop-shadow-lg leading-tight">
                    Goat <br /> Ridder
                </h1>
            </div>

            {/* Connect Button */}
            {!showPopup && (
                <button
                    onClick={handleConnectAndLogin}
                    disabled={loading}
                    className="absolute top-[60%] left-[10%] z-10 px-10 py-4 
                             bg-white text-black text-2xl font-bold rounded-full 
                             hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-xl"
                >
                    {loading ? "Processing..." : "Connect Wallet"}
                </button>
            )}

            {/* Error Message */}
            {error && (
                <div className="absolute bottom-10 left-10 z-20 bg-red-500 text-white px-4 py-2 rounded">
                    ⚠️ {error}
                </div>
            )}

            {/* ------------------------------------------- */}
            {/* POPUP MODAL (สำหรับกรอกชื่อ) */}
            {/* ------------------------------------------- */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-md text-center">
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Create Account</h2>
                        <p className="mb-6 text-gray-600">
                            Welcome new rider! <br/> Please enter your display name.
                        </p>
                        
                        <form onSubmit={handleSubmitName} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your username..."
                                className="border-2 border-gray-300 rounded-lg p-3 text-lg focus:outline-none focus:border-blue-500 text-black"
                                maxLength={15}
                            />
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-blue-600 text-white py-3 rounded-lg text-xl font-bold hover:bg-blue-700 transition"
                            >
                                {loading ? "Creating..." : "Start Game 🚀"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
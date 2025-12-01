"use client";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { CldImage } from "next-cloudinary";
import { Button } from "@/app/components/button";
import { useRouter } from "next/navigation";
import { CONTRACTS } from "@/src/config/contracts";


// ประกาศ Type เพื่อเลี่ยง Error: Window.ethereum
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

// Interface ข้อมูล User จาก Backend
interface UserProfile {
  username: string;
  walletAddress: string;
  tokenBalance: string | number;
}

// Interface Response สร้างห้อง
interface CreateRoomResponse {
  message: string;
  room?: {
    roomId: string;
    requiredStake: number;
    maxPlayers: number;
  };
  error?: string;
}

const API_BASE_URL = "http://localhost:3001/api";

export default function MenuPage() {
  const router = useRouter();

  // --- States ---
  const [username, setUsername] = useState<string>("");
  const [wallet, setWallet] = useState<string>(""); // เก็บไว้โชว์หรือใช้ logic อื่น
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [loadingBuy, setLoadingBuy] = useState<boolean>(false);

  // Create Room States
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
  const [showRoomCreated, setShowRoomCreated] = useState<boolean>(false);
  const [requiredStake, setRequiredStake] = useState<number>(20);
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const [roomUUID, setRoomUUID] = useState<string>("");

  // Join Room States
  const [showJoinPopup, setShowJoinPopup] = useState<boolean>(false);
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string>("");

  //-------------------------------------------------------------------------------//
  // 1. โหลดข้อมูลผู้ใช้ (API: GET /api/user/me)
  //-------------------------------------------------------------------------------//
  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/user/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ส่ง JWT
        },
      });

      if (!res.ok) {
        console.warn("Session expired or unauthorized");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
        return;
      }

      const data: UserProfile = await res.json();
      setUsername(data.username);
      setWallet(data.walletAddress);
      // Backend แปลงหน่วย Ether มาให้แล้ว
      setTokenBalance(Number(data.tokenBalance));

    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  }, [router]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  //-------------------------------------------------------------------------------//
  // 2. ซื้อ Token (เรียก Smart Contract: buyToken)
  //-------------------------------------------------------------------------------//
  async function handleBuyToken() {
    if (!window.ethereum) return;
    setLoadingBuy(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // ✅ ใช้ Address และ ABI จาก contracts.js
      // ใช้ as any เพื่อเลี่ยง Type check ชั่วคราว
      const contract = new ethers.Contract(
        CONTRACTS.TOKEN.ADDRESS!, 
        CONTRACTS.TOKEN.ABI,
        signer
      ) as any; 

      // 🔴 แก้ไข: เรียก buyToken โดยตรง (ตาม Smart Contract ใหม่)
      // ส่ง ETH ไป 0.001 (ปรับค่านี้ตามต้องการ)
      const ethAmount = "0.001";
      console.log(`Buying tokens with ${ethAmount} ETH...`);

      const tx = await contract.buyToken({ 
        value: ethers.parseEther(ethAmount) 
      });

      console.log("Transaction sent:", tx.hash);
      
      if (tx && typeof tx.wait === "function") {
        await tx.wait(); // รอ Transaction ยืนยัน
      }

      alert("Buy token success!");
      
      // โหลดข้อมูลใหม่เพื่ออัปเดตยอดเงินบนหน้าจอ
      await loadUserData();

    } catch (e: any) {
      console.error(e);
      if (e.code === 'ACTION_REJECTED') {
        alert("Transaction rejected.");
      } else {
        alert("Failed to buy token. Ensure you have Sepolia ETH.");
      }
    } finally {
      setLoadingBuy(false);
    }
  }

  //-------------------------------------------------------------------------------//
  // 3. สร้างห้อง (API: POST /api/rooms)
  //-------------------------------------------------------------------------------//
  async function handleConfirmCreateRoom() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          requiredStake, 
          maxPlayers,    
        }),
      });

      const data: CreateRoomResponse = await res.json();

      if (!res.ok || !data.room?.roomId) {
        alert(`Error: ${data.error || "Failed to create room"}`);
        return;
      }

      setRoomUUID(data.room.roomId);
      setShowCreatePopup(false);
      setShowRoomCreated(true);

    } catch (err) {
      console.error(err);
      alert("Network error: Failed to create room");
    }
  }

  //-------------------------------------------------------------------------------//
  // 4. เข้าร่วมห้อง (Redirect ไป Lobby)
  //-------------------------------------------------------------------------------//
  function handleJoinConfirm() {
    setJoinError("");
    if (!joinRoomId.trim()) {
      setJoinError("Please enter a room ID");
      return;
    }

    setJoinLoading(true);

    // พาไปหน้า Lobby เพื่อต่อ Socket
    setTimeout(() => {
        setShowJoinPopup(false);
        router.push(`/lobby/${encodeURIComponent(joinRoomId.trim())}`);
        setJoinLoading(false);
    }, 500);
  }

  //-------------------------------------------------------------------------------//
  // Logout
  //-------------------------------------------------------------------------------//
  function handleExitGame() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  //-------------------------------------------------------------------------------//
  // UI RENDER
  //-------------------------------------------------------------------------------//
  return (
    <div className="relative w-full min-h-screen">
      {/* Background + Blur */}
      <div className="absolute inset-0 blur-[3px] opacity-25">
        <CldImage
          src="lpa26uhctlhihia0mkmf"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          alt="background"
        />
      </div>
      
      {/* Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <CldImage
          src="glndvl5nezxptcnvqpwq"
          width={1920}
          height={1080}
          className="object-contain object-contain w-[900px]
           md:scale-90 
           absolute
          left-[30%]
          top-[6%]"
          alt="game logo"
        />
      </div>

      {/* Top Right Info Capsule */}
      <div className="absolute top-6 right-6 flex items-center gap-3
        bg-[#FBAF22] hover:bg-[#eedebf] px-4 py-2 rounded-full max-w-[320px] 
        shadow-[0_10px_0_#a52424] transition-all z-20"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          <CldImage
            src="k302t89vjayzaffzm3ci"
            width={50}
            height={50}
            className="w-full h-full object-cover"
            alt="User Avatar"
          />
        </div>

        {/* Username & Balance */}
        <div className="flex items-center gap-3">
          <span className="text-lg md:text-xl font-semibold text-white truncate max-w-[100px]">
            {username || "Loading..."}
          </span>
          <span className="text-lg md:text-xl font-semibold text-white bg-black/10 px-4 py-2 rounded-full min-w-[60px] text-center">
            {tokenBalance}
          </span>
        </div>

        {/* Buy Button */}
        <div className="ml-2">
          <Button
            onClick={handleBuyToken}
            disabled={loadingBuy}
            className="px-4 py-1 text-lg font-bold rounded-full shadow-[0_3px_0_#000]"
          >
            {loadingBuy ? "..." : "Buy"}
          </Button>
        </div>
      </div>

      {/* Center Menu Buttons */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-5 px-4 z-10 pt-[300px]">
        <div className="flex flex-col gap-6 md:gap-10">
          <Button
            onClick={() => setShowCreatePopup(true)}
            className="w-60 md:w-64 lg:w-80 py-3 md:py-4 
            text-lg md:text-xl font-bold active:scale-95 
            text-black rounded-full shadow-[0_6px_0_#a52424] bg-white
            hover:bg-[#FBAF22] hover:text-white transition"
          >
            Create Room
          </Button>

          <Button
            onClick={() => {
              setJoinRoomId("");
              setJoinError("");
              setShowJoinPopup(true);
            }}
            className="w-60 md:w-64 lg:w-80 py-3 md:py-4 
            text-lg md:text-xl font-bold active:scale-95 
            text-black rounded-full shadow-[0_10px_0_#a52424] bg-white hover:bg-[#FBAF22] hover:text-white transition-all"
          >
            Join Room
          </Button>

          <Button
            onClick={handleExitGame}
            className="w-60 md:w-64 lg:w-80 py-3 md:py-4 
            text-lg md:text-xl font-bold active:scale-95 
            text-black rounded-full shadow-[0_10px_0_#a52424] transition-all"
          >
            Exit Game
          </Button>
        </div>
      </div>


      {/* --- POPUPS --- */}

      {/* 1. Create Room Popup */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center border-4 border-[#FBAF22]">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Room</h2>

            <div className="mb-6">
              <p className="text-xl font-semibold mb-3 text-gray-600">Required Stake</p>
              <div className="grid grid-cols-4 gap-3">
                {[20, 40, 60, 80].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRequiredStake(value)}
                    className={`px-2 py-2 rounded-lg font-bold transition-all border-2
                      ${requiredStake === value
                        ? "bg-[#FBAF22] text-white border-[#e49c20]"
                        : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                      }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xl font-semibold mb-3 text-gray-600">Max Players</p>
              <div className="grid grid-cols-4 gap-3">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setMaxPlayers(num)}
                    className={`px-2 py-2 rounded-lg font-bold transition-all border-2
                      ${maxPlayers === num
                        ? "bg-[#FBAF22] text-white border-[#e49c20]"
                        : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
                <button
                onClick={handleConfirmCreateRoom}
                className="w-full bg-[#FBAF22] py-3 rounded-xl text-xl font-bold text-white shadow-md hover:bg-[#e49c20] active:scale-95 transition"
                >
                Confirm
                </button>

                <button
                onClick={() => setShowCreatePopup(false)}
                className="w-full bg-gray-200 py-3 rounded-xl text-xl font-bold text-gray-600 hover:bg-gray-300 active:scale-95 transition"
                >
                Cancel
                </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Room Created Popup */}
      {showRoomCreated && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center border-4 border-green-500">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Room Created!</h2>
            <p className="text-lg font-semibold text-gray-500">Room ID:</p>
            <div className="bg-gray-100 p-4 rounded-xl mt-2 mb-6 border-2 border-dashed border-gray-300">
                <p className="text-xl font-mono font-bold text-gray-700 break-all select-all">
                {roomUUID}
                </p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(roomUUID)}
              className="mb-3 w-full bg-blue-100 text-blue-600 py-3 rounded-xl text-lg font-bold hover:bg-blue-200 transition"
            >
              📋 Copy ID
            </button>
            <button
              onClick={() => router.push(`/lobby/${roomUUID}`)}
              className="w-full bg-[#FBAF22] py-3 rounded-xl text-xl font-bold text-white shadow-md hover:bg-[#e49c20] transition"
            >
              Go to Lobby 🚀
            </button>
            <button
              onClick={() => setShowRoomCreated(false)}
              className="mt-3 w-full text-gray-400 font-bold hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 3. Join Room Popup */}
      {showJoinPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm text-center border-4 border-[#FBAF22]">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Join Room</h3>
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Paste Room ID here..."
              className="w-full border-2 border-gray-300 rounded-xl p-3 mb-2 text-lg focus:outline-none focus:border-[#FBAF22] text-center font-mono"
            />
            {joinError && (
              <p className="text-sm text-red-500 mb-4 font-bold bg-red-50 p-2 rounded">{joinError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleJoinConfirm}
                disabled={joinLoading}
                className="flex-1 bg-[#FBAF22] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#e49c20] transition"
              >
                {joinLoading ? "Joining..." : "Join"}
              </button>
              <button
                onClick={() => setShowJoinPopup(false)}
                className="flex-1 bg-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
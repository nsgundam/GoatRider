"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { Button } from "@/app/components/button";
import { io, Socket } from "socket.io-client";
import { ethers } from "ethers";
import { CONTRACTS } from "@/src/config/contracts";

interface Player {
  walletAddress: string;
  user: {
    username: string;
  };
  isReady: boolean;
}

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id as string;

  // --- States ---
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    walletAddress: string;
  } | null>(null);

  // 💰 1. เพิ่ม State เก็บเงิน
  const [myTokenBalance, setMyTokenBalance] = useState<number>(0);

  const [requiredStake, setRequiredStake] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canStart, setCanStart] = useState(false);

  // --- 1. Init Data & Socket Connection ---
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token"); // ต้องใช้ Token

    if (!userStr || !token) {
      router.push("/");
      return;
    }
    const userObj = JSON.parse(userStr);
    setCurrentUser(userObj);

    // 💰 2. เพิ่มการดึงยอดเงินล่าสุดจาก Backend
    fetch("http://localhost:3001/api/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.tokenBalance) setMyTokenBalance(Number(data.tokenBalance));
      })
      .catch((err) => console.error("Failed to load balance:", err));

    // 🏠 3. ดึงข้อมูลห้องเบื้องต้น (Backup)
    fetch(`http://localhost:3001/api/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.requiredStake) setRequiredStake(data.requiredStake);
      })
      .catch(() => console.log("Room check skipped"));

    // --- Socket Connection ---
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🔌 Connected to Socket");
      newSocket.emit("join_room", {
        roomId: roomId,
        walletAddress: userObj.walletAddress,
      });
    });

    newSocket.on(
      "room_update",
      (data: { players: Player[]; requiredStake?: number }) => {
        console.log("📢 Room Update:", data);
        setPlayers(data.players);

        if (data.requiredStake) setRequiredStake(data.requiredStake);
      }
    );

    newSocket.on("can_start_game", (status: boolean) => {
      setCanStart(status);
    });

    newSocket.on("game_started", () => {
      console.log("🚀 Game Started! Redirecting...");
      router.push(`/maingame?room=${roomId}`);
    });

    newSocket.on("error", (msg) => {
      alert(`Error: ${msg}`);
      if (msg === "Room not found") router.push("/menu");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, router]);

  // --- Logic: จ่ายเงิน (Ready) ---
  async function handlePayAndReady() {
    if (!window.ethereum || !currentUser) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      alert("Please switch your wallet to Sepolia Network!");
      return;
    }

    if (myTokenBalance < requiredStake) {
      alert("Not enough tokens!");
      return;
    }

    setIsProcessing(true);

    try {
      const signer = await provider.getSigner();

      console.log("Token Address:", CONTRACTS.TOKEN.ADDRESS);
      console.log("GamePool Address:", CONTRACTS.GAME_POOL.ADDRESS);

      // Check if address is valid before calling
      if (!CONTRACTS.TOKEN.ADDRESS || !CONTRACTS.GAME_POOL.ADDRESS) {
        alert("Contract addresses are missing in config!");
        setIsProcessing(false);
        return;
      }

      const tokenContract = new ethers.Contract(
        CONTRACTS.TOKEN.ADDRESS!,
        CONTRACTS.TOKEN.ABI,
        signer
      );

      const poolContract = new ethers.Contract(
        CONTRACTS.GAME_POOL.ADDRESS!,
        CONTRACTS.GAME_POOL.ABI,
        signer
      );

      const stakeAmount = ethers.parseUnits(requiredStake.toString(), 18);

      // Check Allowance
      const allowance = await tokenContract.allowance(
        currentUser.walletAddress,
        CONTRACTS.GAME_POOL.ADDRESS
      );
      if (allowance < stakeAmount) {
        console.log("📝 Approving...");
        const txApprove = await tokenContract.approve(
          CONTRACTS.GAME_POOL.ADDRESS,
          stakeAmount
        );
        await txApprove.wait();
      }

      // JoinAndBet
      console.log("💸 Paying...");
      const txJoin = await poolContract.joinAndBet(roomId, stakeAmount);
      await txJoin.wait();

      console.log("✅ Payment Confirmed");

      // 1. เปลี่ยนสถานะตัวเองในลิสต์ให้เป็น Ready = true
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.walletAddress.toLowerCase() ===
          currentUser.walletAddress.toLowerCase()
            ? { ...p, isReady: true }
            : p
        )
      );

      // 2. หักเงินในหน้าจอทันที (เพื่อความสมจริง)
      setMyTokenBalance((prev) => prev - requiredStake);
    } catch (error: any) {
      console.error("Payment Error:", error);
      alert("Transaction Failed: " + (error.reason || error.message));
    } finally {
      setIsProcessing(false);
    }
  }

  // --- Logic: เริ่มเกม ---
  function handleStartGame() {
    if (!socket) return;
    socket.emit("start_game", { roomId });
  }

  // Helpers
  const amIHost =
    players.length > 0 &&
    currentUser?.walletAddress === players[0].walletAddress;
  const myPlayerStatus = players.find(
    (p) => p.walletAddress === currentUser?.walletAddress
  );
  const isMyReady = myPlayerStatus?.isReady || false;

  // UI helpers
  const cardBase =
    "bg-white/95 rounded-2xl transition-all duration-200 border-2 border-black";
  const cardShadow = "shadow-[0_6px_0_#a52424] hover:shadow-[0_8px_0_#7d1c1c]";

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden font-sans">
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <CldImage
          src="hugl4hmvs5foaw8fdizk"
          width={1920}
          height={1080}
          className="absolute inset-0 w-screen h-screen object-cover"
          alt="bg"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 🔴 4. เพิ่ม UI แสดงยอดเงินที่มุมขวาบน */}
      <div
        className="absolute top-6 right-6 flex items-center gap-3 
        bg-[#FBAF22] hover:bg-[#eedebf] px-4 py-2 rounded-full max-w-[320px] 
        shadow-[0_10px_0_#a52424] transition-all z-20"
      >
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          <CldImage
            src="k302t89vjayzaffzm3ci"
            width={50}
            height={50}
            className="w-full h-full object-cover"
            alt="User Avatar"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white truncate max-w-[100px]">
            {currentUser?.username || "Guest"}
          </span>
          <span className="text-lg font-bold text-white bg-black/20 px-3 py-1 rounded-full">
            {myTokenBalance} GRD
          </span>
        </div>
      </div>

      {/* CONTENT area */}
      <div className="relative z-10 w-full h-full overflow-auto flex items-center justify-center">
        <div className="max-w-[1200px] px-6">
          <div className="grid grid-cols-12 gap-6 items-start w-full">
            {/* LEFT PANEL */}
            <div className="col-span-12 lg:col-span-6 p-8 bg-white/55 backdrop-blur-sm rounded-3xl border-l-4 border-black/80 shadow-2xl">
              <div className="mb-6 text-center">
                <h1 className="text-5xl font-extrabold text-[#FBAF22] drop-shadow-[2px_2px_0_#000] tracking-wide">
                  HAVE FUN!
                </h1>
                <p className="text-gray-500 font-bold mt-2">
                  ROOM ID: {roomId}
                </p>
              </div>

              {/* Room id row */}
              <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl border-2 border-gray-300 mb-6">
                <span className="font-bold text-gray-600">Entry Fee:</span>
                <span className="text-2xl font-bold text-[#a52424]">
                  {requiredStake > 0 ? `${requiredStake} GRD` : "Loading..."}
                </span>
              </div>

              {/* Players list */}
              <div className="space-y-3 mb-6">
                {players.map((p, index) => (
                  <div
                    key={p.walletAddress}
                    className={`${cardBase} ${cardShadow} flex items-center justify-between p-4`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center text-xl">
                        {index === 0 ? "👑" : "👤"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg text-black font-bold truncate max-w-[150px]">
                          {p.user.username}{" "}
                          {p.walletAddress === currentUser?.walletAddress &&
                            "(You)"}
                        </div>
                        <div className="text-xs text-gray-500 truncate w-32">
                          {p.walletAddress}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {p.isReady ? (
                        <span className="px-4 py-1 text-sm rounded-full bg-green-500 text-white font-bold border-2 border-green-700 shadow-[0_2px_0_#14532d]">
                          READY
                        </span>
                      ) : (
                        <span className="px-4 py-1 text-sm rounded-full bg-gray-300 text-gray-500 font-bold border-2 border-gray-400">
                          WAITING...
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* empty slots */}
                {Array.from({ length: Math.max(0, 5 - players.length) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-black/5 rounded-2xl border-2 border-dashed border-gray-400 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-transparent border-2 border-gray-400 border-dashed" />
                        <div className="text-gray-500 font-bold">
                          Waiting for player...
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* bottom row: players count + start */}
              <div className="flex items-center justify-between mt-8 pt-6">
                <div className="text-sm text-black">
                  Players:{" "}
                  <span className="font-bold">
                    {players.length} / {5}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push("/menu")}
                    className="p-2 rounded-md bg-white/80 border-2 border-black hover:bg-[#FBAF22] transition"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 18l-6-6 6-6"
                        stroke="#000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {!isMyReady && (
                    <Button
                      onClick={handlePayAndReady}
                      disabled={isProcessing || requiredStake === 0}
                      className={`px-8 py-3 font-bold rounded-full text-xl shadow-[0_4px_0_#000]
                      ${
                        isProcessing
                          ? "bg-gray-400"
                          : "bg-[#FBAF22] hover:bg-[#e49c20] text-white"
                      }`}
                    >
                      {isProcessing
                        ? "Processing..."
                        : `PAY ${requiredStake} GRD`}
                    </Button>
                  )}

                  {amIHost && isMyReady && (
                    <Button
                      onClick={handleStartGame}
                      disabled={!canStart}
                      className={`px-8 py-3 font-bold rounded-full text-xl shadow-[0_4px_0_#000]
                      ${
                        canStart
                          ? "bg-green-600 hover:bg-green-700 text-white animate-pulse"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    >
                      START GAME 🚀
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="col-span-12 lg:col-span-7 rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
              <div className="relative z-10 h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CldImage } from "next-cloudinary";
import { Button } from "@/app/components/button";
import { useRouter } from "next/navigation";

const TOKEN_CONTRACT = "0xCe34646845764F963Ef497bf8d4e588484da9B63";
const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function buyToken() payable"
];

export default function MenuPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [wallet, setWallet] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);

  const [loadingBuy, setLoadingBuy] = useState(false);

  //-------------------------------------------------------------------------------//
  // โหลดข้อมูลผู้ใช้ + token จริงจาก blockchain
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setUsername(user.username);
      loadBlockchainBalance();
    } catch {
      router.push("/");
    }
  }, []);

  async function loadBlockchainBalance() {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const walletAddr = await signer.getAddress();

    setWallet(walletAddr);

    const contract = new ethers.Contract(TOKEN_CONTRACT, TOKEN_ABI, provider);
    const bal = await contract.balanceOf(walletAddr);

    setTokenBalance(Number(ethers.formatEther(bal)));
  }

  //-------------------------------------------------------------------------------//
  async function handleBuyToken() {
    setLoadingBuy(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(TOKEN_CONTRACT, TOKEN_ABI, signer);

      const tx = await contract.buyToken({
        value: ethers.parseEther("0.001"), // ราคาตามที่คุณกำหนด
      });

      await tx.wait();
      await loadBlockchainBalance();

      alert("Buy token success!");
    } catch (e) {
      console.error(e);
      alert("Buy token failed");
    }
    setLoadingBuy(false);
  }

  //-------------------------------------------------------------------------------//
  function handleCreateRoom() {
    router.push("/createroom");
  }

  function handleJoinRoom() {
    const id = window.prompt("Enter Room ID:");
    if (id) router.push(`/room/${id}`);
  }

  function handleExitGame() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }
  //-------------------------------------------------------------------------------//
 return (
    <div className="relative w-full min-h-screen">
      {/* ชั้นภาพพื้นหลัง + เบลอ */}
      <div className="absolute inset-0 blur-[3px] opacity-25">
        <CldImage
          src="lpa26uhctlhihia0mkmf"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          alt="background"
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <CldImage src="namegamegoat" width={1920} height={1080} className="object-contain" alt="game logo" />
      </div>

      {/* top-right capsule (ปรับขนาดพอดี ไม่ใหญ่เกิน) */}
      <div
        className="absolute top-6 right-6 flex items-center gap-3 
      bg-[#FBAF22] hover:bg-[#eedebf] px-4 py-2 rounded-full max-w-[320px] 
      shadow-[0_10px_0_#a52424] transition-all"
      >
        {/* avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          <CldImage src="k302t89vjayzaffzm3ci" width={50} height={50} className="w-50 h-10 rounded-full" alt="User Avatar auto" />
        </div>

        {/* username + token */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold text-white truncate max-w-[100px]">{username}</span>
          <span className="text-xl font-semibold text-white bg-black/10 px-4 py-3 rounded-full">{tokenBalance}</span>
        </div>

        <div className="ml-2">
          <Button onClick={handleBuyToken} disabled={loadingBuy} className="px-2 py-2 text-xl font-bold rounded-full shadow-[0_3px_0_#000] ">
            {loadingBuy ? "Buying..." : "Buy"}
          </Button>
        </div>
      </div>

      {/* overlay center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-5 px-4">
        {/* Buttons (พอดีกับหน้าจอ: responsive width) */}
        <div className="flex flex-col gap-10 mt-[400px] items-center-">
          <Button
            onClick={handleCreateRoom}
            className="w-60 md:w-64 lg:w-80 py-3 md:py-4 
            text-lg md:text-xl font-bold active:scale-95 
            text-black rounded-full shadow-[0_6px_0_#a52424] transition-all"
          >
            Create Room
          </Button>

          <Button
            onClick={handleJoinRoom}
            className="w-60 md:w-64 lg:w-80 py-3 md:py-4 
            text-lg md:text-xl font-bold active:scale-95 
            text-black rounded-full shadow-[0_10px_0_#a52424] transition-all"
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
    </div>
  );
}
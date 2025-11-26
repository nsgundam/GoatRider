// MenuPage component (cleaned & fixed)
// ABI file: /mnt/data/abi.json (imported as TOKEN_ABI)

"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CldImage } from "next-cloudinary";
import { Button } from "@/app/components/button";
import { useRouter } from "next/navigation";
import TOKEN_ABI from "@/src/abi.json";

const TOKEN_CONTRACT = "0xa2Ba61876c71BA642ee131979806305F46f703A9";

export default function MenuPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [wallet, setWallet] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loadingBuy, setLoadingBuy] = useState(false);

  // create room states
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showRoomCreated, setShowRoomCreated] = useState(false);
  const [requiredStake, setRequiredStake] = useState(20);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [roomUUID, setRoomUUID] = useState("");

  // join room states
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  // backend rooms base
  const ROOMS_API = "http://localhost:3001/api/rooms";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBlockchainBalance() {
    if (!window.ethereum) {
      console.warn("No ethereum provider");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // ตรวจ chainId (Sepolia = 11155111 -> hex 0xaa36a7)
      try {
        const chainId = await provider.send("eth_chainId", []);
        if (chainId !== "0xaa36a7" && chainId !== "0xAA36A7") {
          console.warn("Please switch MetaMask network to Sepolia (chainId 11155111).");
        }
      } catch (e) {
        console.warn("Failed to read chainId:", e);
      }

      const signer = await provider.getSigner();
      const walletAddr = await signer.getAddress();
      setWallet(walletAddr);

      // สร้าง contract ด้วย ABI ที่นำเข้าจากไฟล์
      const contract = new ethers.Contract(TOKEN_CONTRACT, TOKEN_ABI, provider);

      // อ่าน decimals() ก่อนเพื่อแปลงจำนวนให้ถูกต้อง
      let decimals = 18;
      try {
        const d = await contract.decimals();
        decimals = Number(d);
      } catch (e) {
        console.warn("decimals() not available, default to 18", e);
      }

      // อ่านยอด token
      let bal;
      try {
        bal = await contract.balanceOf(walletAddr);
      } catch (err) {
        console.error("Failed to call balanceOf:", err);
        setTokenBalance(0);
        return;
      }

      // แปลง unit โดยใช้ decimals
      const formatted = Number(ethers.formatUnits(bal, decimals));
      setTokenBalance(formatted);
    } catch (err) {
      console.error("loadBlockchainBalance error:", err);
    }
  }

  //-------------------------------------------------------------------------------//
  async function handleBuyToken() {
    setLoadingBuy(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(TOKEN_CONTRACT, TOKEN_ABI, signer);

      const tx = await contract.faucet?.() ?? await contract.buyToken?.({ value: ethers.parseEther("0.001") });

      // If tx is not a transaction object (faucet may be non-payable), guard
      if (tx && typeof tx.wait === "function") {
        await tx.wait();
      }

      await loadBlockchainBalance();

      alert("Buy token success!");
    } catch (e) {
      console.error(e);
      alert("Buy token failed");
    }
    setLoadingBuy(false);
  }

  //-------------------------------------------------------------------------------//
  function handleExitGame() {
    router.push("/");
  }

  //-------------------------------------------------------------------------------//
  async function handleConfirmCreateRoom() {
    try {
      const res = await fetch("http://localhost:3001/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requiredStake,
          maxPlayers,
          wallet,
        }),
      });

      const data = await res.json();

      if (!data.uuid) {
        alert("Error creating room");
        return;
      }

      setRoomUUID(data.uuid);
      setShowCreatePopup(false);
      setShowRoomCreated(true);

    } catch (err) {
      console.error(err);
      alert("Failed to create room");
    }
  }
  //-------------------------------------------------------------------------------//
  async function handleJoinConfirm() {
    setJoinError("");
    if (!joinRoomId.trim()) {
      setJoinError("Please enter a room ID");
      return;
    }

    try {
      setJoinLoading(true);
      // ตรวจห้องจาก backend (GET /api/rooms/:id)
      const res = await fetch(`${ROOMS_API}/${encodeURIComponent(joinRoomId.trim())}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        if (res.status === 404) {
          setJoinError("Room not found. Check the Room ID.");
        } else {
          const text = await res.text().catch(() => null);
          setJoinError(text || "Failed to check room. Try again.");
        }
        return;
      }

      const data = await res.json();
      // optional: validate room status / vacancies based on data
      setShowJoinPopup(false);
      router.push(`/lobby/${encodeURIComponent(joinRoomId.trim())}`);
    } catch (err) {
      console.error("handleJoinConfirm error:", err);
      setJoinError("Network error. Try again.");
    } finally {
      setJoinLoading(false);
    }
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
  onClick={() => setShowCreatePopup(true)}
  className="w-60 md:w-64 lg:w-80 py-3 md:py-4 
  text-lg md:text-xl font-bold active:scale-95 
  text-black rounded-full shadow-[0_6px_0_#a52424] bg-white
  hover:bg-[#FBAF22] hover:text-white transition"
>
  Create Room
</Button>

        <Button
  onClick={() => { setJoinRoomId(""); setJoinError(""); setShowJoinPopup(true); }}
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
          {showCreatePopup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
    <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center">

      <h2 className="text-3xl font-bold mb-4 text-gray-800">Create Room</h2>

      {/* Required Stake */}
      <div className="mb-6">
        <p className="text-xl font-semibold mb-2">Required Stake</p>
        <div className="grid grid-cols-4 gap-3">
          {[20,40,60,80].map(value => (
            <button
              key={value}
              onClick={() => setRequiredStake(value)}
              className={`px-4 py-2 rounded-lg font-bold 
                ${requiredStake === value ? "bg-[#FBAF22] text-white" : "bg-gray-200"}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Max Players */}
      <div className="mb-6">
        <p className="text-xl font-semibold mb-2">Max Players</p>
        <div className="grid grid-cols-4 gap-3">
          {[2,3,4,5].map(num => (
            <button
              key={num}
              onClick={() => setMaxPlayers(num)}
              className={`px-4 py-2 rounded-lg font-bold 
                ${maxPlayers === num ? "bg-[#FBAF22] text-white" : "bg-gray-200"}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Confirm */}
      <button
        onClick={handleConfirmCreateRoom}
        className="w-full bg-[#FBAF22] py-3 rounded-lg text-xl font-bold hover:bg-[#e49c20]"
      >
        Confirm
      </button>

      {/* Cancel */}
      <button
        onClick={() => setShowCreatePopup(false)}
        className="mt-3 w-full bg-gray-300 py-3 rounded-lg text-xl font-bold hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  </div>
)}


{showRoomCreated && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
    <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center">

      <h2 className="text-3xl font-bold mb-4 text-gray-800">Room Created!</h2>

      <p className="text-lg font-semibold">Room ID:</p>
      <p className="text-2xl font-bold bg-gray-100 px-4 py-2 rounded-lg mt-2">
        {roomUUID}
      </p>

      {/* Copy */}
      <button
        onClick={() => navigator.clipboard.writeText(roomUUID)}
        className="mt-4 w-full bg-gray-300 py-3 rounded-lg text-xl font-bold hover:bg-gray-400"
      >
        Copy ID
      </button>

      {/* Go to Lobby */}
      <button
        onClick={() => router.push(`/lobby/${roomUUID}`)}
        className="mt-3 w-full bg-[#FBAF22] py-3 rounded-lg text-xl font-bold hover:bg-[#e49c20]"
      >
        Go to Lobby
      </button>

      {/* Close */}
      <button
        onClick={() => setShowRoomCreated(false)}
        className="mt-3 w-full bg-red-500 text-white py-3 rounded-lg text-xl font-bold hover:bg-red-600"
      >
        Close
      </button>
    </div>
  </div>
)}

{showJoinPopup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center">
      <h3 className="text-2xl font-bold mb-3">Join Room</h3>

      <input
        type="text"
        value={joinRoomId}
        onChange={(e) => setJoinRoomId(e.target.value)}
        placeholder="Enter Room ID"
        className="w-full border-2 border-gray-300 rounded-lg p-3 mb-3 text-lg focus:outline-none"
      />

      {joinError && <p className="text-sm text-red-500 mb-3">{joinError}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleJoinConfirm}
          disabled={joinLoading}
          className="flex-1 bg-[#FBAF22] text-black py-2 rounded-lg font-bold hover:bg-[#e0a42a] transition"
        >
          {joinLoading ? "Joining..." : "Join"}
        </button>

        <button
          onClick={() => setShowJoinPopup(false)}
          className="flex-1 bg-gray-300 text-black py-2 rounded-lg font-bold hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
}

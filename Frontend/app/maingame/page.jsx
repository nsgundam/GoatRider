"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import PlayerSeat from "../components/PlayerSeat";
import CentralPile from "../components/CentralPile";
import { CldImage } from "next-cloudinary";

// Helper function: จัดลำดับที่นั่งให้ "ตัวเรา" อยู่ index 0 เสมอ
function rotatePlayers(players, myWallet) {
  if (!players || players.length === 0) return [];
  const myIndex = players.findIndex((p) => p.walletAddress === myWallet);
  if (myIndex === -1) return players; // กรณีดูในฐานะผู้ชม

  // ตัด array แล้วเอามาต่อใหม่ให้ตัวเราอยู่หน้าสุด
  return [
    ...players.slice(myIndex),
    ...players.slice(0, myIndex)
  ];
}

export default function MainGame() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get("room");

  // --- States ---
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Game States จาก Server
  const [players, setPlayers] = useState([]); // ข้อมูลผู้เล่นทั้งหมดในห้อง (เรียงแล้ว)
  const [myHand, setMyHand] = useState([]);   // ไพ่ในมือเรา
  const [currentTurnWallet, setCurrentTurnWallet] = useState(""); // ตาใคร?
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameLogs, setGameLogs] = useState([]); // Log การกระทำ
  
  // UI States
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [lastPlayedCard, setLastPlayedCard] = useState(null); // ไพ่ใบล่าสุดกองกลาง

  // 1. Init & Connect Socket
  useEffect(() => {
    // ดึง User จาก LocalStorage
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userStr || !token || !roomId) {
      router.push("/menu");
      return;
    }
    const userObj = JSON.parse(userStr);
    setCurrentUser(userObj);

    // Connect Socket
    const newSocket = io("http://localhost:3001", {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to Game Socket");
      // Join Room เพื่อรับข้อมูล
      newSocket.emit("join_room", { 
        roomId, 
        walletAddress: userObj.walletAddress 
      });
      
      // ขอ State ล่าสุด (กรณี Refresh หน้าจอ)
      newSocket.emit("request_game_state", { 
        roomId, 
        walletAddress: userObj.walletAddress 
      });
    });

    // --- Listeners ---

    // อัปเดตรายชื่อคนในห้อง (ใช้เพื่อแสดงผลตำแหน่ง)
    newSocket.on("room_update", (data) => {
        // แปลงโครงสร้างข้อมูลให้เข้ากับ PlayerSeat Component
        const formattedPlayers = data.players.map(p => ({
            id: p.walletAddress,
            name: p.user?.username || p.walletAddress.substring(0,6),
            tokens: 0, // ในเกมจริงอาจไม่ต้องโชว์ token หรือดึงจาก DB
            isAlive: true, // TODO: ต้องเพิ่ม logic isAlive จาก Backend
            cardCount: 5   // TODO: Backend ต้องส่งจำนวนไพ่คนอื่นมาด้วย
        }));
        
        // จัดระเบียบที่นั่ง
        const seatedPlayers = rotatePlayers(formattedPlayers, userObj.walletAddress);
        setPlayers(seatedPlayers);
    });

    // อัปเดตไพ่ในมือเรา (Backend ส่งมาเฉพาะของเรา)
    newSocket.on("update_hand", (data) => {
        if (data.walletAddress === userObj.walletAddress) {
            // แปลง string array ['attack', 'skip'] เป็น object array สำหรับ Card Component
            const formattedHand = data.hand.map((cardName, index) => ({
                id: `${cardName}-${index}-${Date.now()}`, // Unique Key
                name: cardName.toUpperCase(),
                type: getCardType(cardName),
                val: cardName // ค่าจริงที่ส่งกลับ server
            }));
            setMyHand(formattedHand);
        }
    });

    // เปลี่ยนเทิร์น
    newSocket.on("turn_change", (data) => {
        setCurrentTurnWallet(data.currentTurnWallet);
        setTimeLeft(data.timeLeft);
    });

    // Log การกระทำ (เช่น "Somchai played Attack")
    newSocket.on("game_log", (msg) => {
        setGameLogs(prev => [msg, ...prev].slice(0, 5)); // เก็บแค่ 5 บรรทัดล่าสุด
    });
    
    // Action Log (เช่น Play Card) เพื่อแสดงผลกองกลาง
    newSocket.on("player_action", (data) => {
        if (data.action.includes("PLAYED")) {
            const cardName = data.action.split(" ")[1];
            setLastPlayedCard({ name: cardName, type: "ACTION" });
        }
    });

    // จบเกม
    newSocket.on("game_over", (data) => {
        alert(`🏆 Winner is: ${data.winner}`);
        router.push("/menu");
    });

    newSocket.on("error", (msg) => alert(msg));

    return () => newSocket.disconnect();
  }, [roomId, router]);


  // Helper: แยกประเภทการ์ดเพื่อความสวยงาม
  const getCardType = (name) => {
      if(name === 'defuse') return "DEFUSE";
      if(name === 'explode') return "BOMB";
      if(name.startsWith('cat')) return "CAT";
      return "ACTION";
  }

  // 2. Handle Actions

  const handleCardClick = (playerIndex, card) => {
    // ยอมให้เลือกการ์ดเฉพาะเรา (index 0) และเป็นตาเรา
    if (playerIndex !== 0) return;
    if (currentTurnWallet !== currentUser?.walletAddress) {
        alert("Not your turn!");
        return;
    }

    // Toggle Selection (เลือกได้ทีละหลายใบสำหรับการ์ดแมว แต่ตอนนี้ Backend รองรับทีละใบ)
    setSelectedCardIds(prev => {
        if (prev.includes(card.id)) return prev.filter(id => id !== card.id);
        // *หมายเหตุ: ถ้าจะทำ Combo Cat ต้องแก้ตรงนี้ให้เลือกได้หลายใบ
        return [card.id]; // ตอนนี้ให้เลือกทีละใบไปก่อน
    });
  };

  const handlePlayCard = () => {
    if (selectedCardIds.length === 0 || !socket) return;

    // หา Object การ์ดจาก ID
    const cardToPlay = myHand.find(c => c.id === selectedCardIds[0]);
    
    if (cardToPlay) {
        socket.emit("play_card", {
            roomId,
            walletAddress: currentUser.walletAddress,
            card: cardToPlay.val // ส่งชื่อการ์ด เช่น 'attack' ไปให้ Backend
        });
        setSelectedCardIds([]); // เคลียร์การเลือก
    }
  };

  const handleDrawCard = () => {
    if (currentTurnWallet !== currentUser?.walletAddress) {
        alert("Wait for your turn!");
        return;
    }
    socket.emit("draw_card", {
        roomId,
        walletAddress: currentUser.walletAddress
    });
  };

  // --- Render Helpers ---
  const isMyTurn = currentTurnWallet === currentUser?.walletAddress;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#2a2a2a] font-sans">
      {/* Background */}
      <div className="absolute inset-0 blur-[3px] opacity-25 pointer-events-none">
        <CldImage src="hpspfzupmdw8bh3crszn" width={1920} height={1080} className="w-full h-full object-cover" alt="bg" />
      </div>

      {/* --- UI Layer --- */}
      
      {/* Turn Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-6 py-2 rounded-full z-50 border-2 border-[#FBAF22]">
        {isMyTurn ? (
            <span className="text-green-400 font-bold text-xl animate-pulse">YOUR TURN ({timeLeft}s)</span>
        ) : (
            <span className="text-gray-300">Waiting for opponent...</span>
        )}
      </div>

      {/* Logs */}
      <div className="absolute top-4 left-4 w-64 bg-black/40 p-4 rounded-lg text-sm text-white pointer-events-none z-0">
        <h3 className="font-bold text-[#FBAF22] mb-2">Game Log</h3>
        {gameLogs.map((log, i) => (
            <div key={i} className="mb-1 opacity-80 border-b border-white/10 pb-1">{log}</div>
        ))}
      </div>

      {/* Central Pile */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="transform -translate-y-8 scale-110">
            <CentralPile topCard={lastPlayedCard} />
        </div>
      </div>

      {/* --- Player Seats (Dynamic Layout) --- */}
      {/* Logic: players[0] คือเราเสมอ (จากการ rotate)
         players[1] = ซ้าย
         players[2] = บนซ้าย
         players[3] = บนขวา
         players[4] = ขวา
      */}

      {/* 1. Left Opponent */}
      {players[1] && (
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
            <PlayerSeat player={players[1]} cards={new Array(players[1].cardCount || 3).fill(0)} layout="left" containerSize={400} />
        </div>
      )}

      {/* 2. Top-Left Opponent */}
      {players[2] && (
        <div className="absolute top-5 left-[20%] z-10">
            <PlayerSeat player={players[2]} cards={new Array(players[2].cardCount || 3).fill(0)} layout="top" containerSize={320} />
        </div>
      )}

      {/* 3. Top-Right Opponent (หรือคนตรงข้ามถ้ามี 3 คน) */}
      {players[3] && (
        <div className="absolute top-5 right-[20%] z-10">
            <PlayerSeat player={players[3]} cards={new Array(players[3].cardCount || 3).fill(0)} layout="top" containerSize={320} />
        </div>
      )}

      {/* 4. Right Opponent */}
      {players[4] && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
            <PlayerSeat player={players[4]} cards={new Array(players[4].cardCount || 3).fill(0)} layout="right" containerSize={400} />
        </div>
      )}

      {/* 5. ตัวเรา (Bottom) */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center">
         
         {/* ปุ่ม Play */}
         {selectedCardIds.length > 0 && isMyTurn && (
            <div className="mb-4 animate-bounce z-50">
                <button 
                    onClick={handlePlayCard}
                    className="bg-[#FBAF22] text-black text-xl font-extrabold px-8 py-3 rounded-full shadow-[0_4px_0_#a52424] hover:bg-white transition"
                >
                    PLAY CARD 💥
                </button>
            </div>
        )}

        {/* ปุ่ม Draw (จั่วเมื่อไม่เล่นการ์ด หรือเล่นเสร็จแล้วต้องจั่วเพื่อจบเทิร์น) */}
        {isMyTurn && selectedCardIds.length === 0 && (
             <div className="mb-4 z-50">
                <button 
                    onClick={handleDrawCard}
                    className="bg-green-600 text-white text-lg font-bold px-6 py-2 rounded-full shadow-lg hover:bg-green-500 transition animate-pulse"
                >
                    END TURN (DRAW CARD) 🃏
                </button>
            </div>
        )}

        {/* การ์ดในมือเรา */}
        <PlayerSeat 
            player={{ 
                name: currentUser?.username || "You", 
                tokens: players[0]?.tokens || 0 
            }} 
            cards={myHand} 
            isSelf={true} 
            layout="bottom" 
            containerSize={800}
            onCardClick={handleCardClick}
            selectedCards={selectedCardIds}
        />
      </div>

    </div>
  );
}
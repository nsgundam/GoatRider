"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import PlayerSeat from "../components/PlayerSeat";
import CentralPile from "../components/CentralPile";
import { CldImage } from "next-cloudinary";

// Helper: หมุนที่นั่ง
function rotatePlayers(players, myWallet) {
  if (!players || players.length === 0) return [];
  const myIndex = players.findIndex((p) => p.walletAddress === myWallet);
  if (myIndex === -1) return players;
  return [
    ...players.slice(myIndex),
    ...players.slice(0, myIndex)
  ];
}

export default function MainGame() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get("room");

  // --- Game States ---
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [myHand, setMyHand] = useState([]);
  const [currentTurnWallet, setCurrentTurnWallet] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameLogs, setGameLogs] = useState([]);
  
  // --- UI States ---
  const [selectedCardIds, setSelectedCardIds] = useState([]); // เก็บ ID ของไพ่ที่เลือก
  const [lastPlayedCard, setLastPlayedCard] = useState(null);
  
  // States สำหรับการเลือกเป้าหมาย (Combo)
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [comboType, setComboType] = useState(null); // '2cats' | '3cats'

  // 1. Init & Connect
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userStr || !token || !roomId) {
      router.push("/menu");
      return;
    }
    const userObj = JSON.parse(userStr);
    setCurrentUser(userObj);

    const newSocket = io("http://localhost:3001", { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected");
      newSocket.emit("join_room", { roomId, walletAddress: userObj.walletAddress });
      newSocket.emit("request_game_state", { roomId, walletAddress: userObj.walletAddress });
    });

    newSocket.on("room_update", (data) => {
        const formattedPlayers = data.players.map(p => ({
            id: p.walletAddress,
            name: p.user?.username || p.walletAddress.substring(0,6),
            tokens: 0, 
            isAlive: p.isAlive ?? true, // รองรับ field isAlive
            cardCount: p.hand?.length || 0 // Backend ต้องส่งจำนวนการ์ดมาด้วย (แก้ backend เพิ่มเติม)
        }));
        setPlayers(rotatePlayers(formattedPlayers, userObj.walletAddress));
    });

    newSocket.on("update_hand", (data) => {
        if (data.walletAddress === userObj.walletAddress) {
            const formattedHand = data.hand.map((cardName, index) => ({
                id: `${cardName}-${index}-${Date.now()}`,
                name: cardName.toUpperCase(),
                type: getCardType(cardName),
                val: cardName
            }));
            setMyHand(formattedHand);
        }
    });

    newSocket.on("turn_change", (data) => {
        setCurrentTurnWallet(data.currentTurnWallet);
        setTimeLeft(data.timeLeft);
    });

    newSocket.on("game_log", (msg) => setGameLogs(prev => [msg, ...prev].slice(0, 5)));
    
    newSocket.on("player_action", (data) => {
        if (data.action.includes("PLAYED")) {
            const parts = data.action.split(" ");
            // parts[1] อาจเป็นชื่อการ์ด หรือคำว่า COMBO
            setLastPlayedCard({ name: parts[1] || "CARD", type: "ACTION" });
        }
    });

    newSocket.on("game_over", (data) => {
        alert(`🏆 Game Over! Winner: ${data.winner}`);
        router.push("/menu");
    });

    newSocket.on("error", (msg) => alert(msg));

    return () => newSocket.disconnect();
  }, [roomId, router]);

  const getCardType = (name) => {
      if(name === 'defuse') return "DEFUSE";
      if(name === 'explode') return "BOMB";
      if(name.startsWith('cat')) return "CAT";
      return "ACTION";
  }

  // --- ACTIONS ---

  // ✅ 1. เลือกการ์ดหลายใบ (Multi-Selection)
  const handleCardClick = (playerIndex, card) => {
    if (playerIndex !== 0) return;
    if (currentTurnWallet !== currentUser?.walletAddress) return alert("Not your turn!");

    setSelectedCardIds(prev => {
      // ถ้ามีอยู่แล้วให้เอาออก (Deselect)
      if (prev.includes(card.id)) return prev.filter(id => id !== card.id);
      
      // ถ้ายังไม่มี ให้ใส่เพิ่มเข้าไป
      return [...prev, card.id];
    });
  };

  // ✅ 2. ตรวจสอบ Combo ก่อนส่ง
  const handlePrePlay = () => {
    if (selectedCardIds.length === 0) return;

    const selectedCardsObj = myHand.filter(c => selectedCardIds.includes(c.id));
    const firstCardVal = selectedCardsObj[0].val;
    const isAllSame = selectedCardsObj.every(c => c.val === firstCardVal);

    // กรณีเล่นใบเดียว (Action Cards)
    if (selectedCardIds.length === 1) {
        if (firstCardVal.startsWith('cat')) {
            alert("Cat cards must be played in pairs (2) or triples (3)!");
            return;
        }
        submitPlay(selectedCardsObj, null);
        return;
    }

    // กรณีเล่น Combo (2 หรือ 3 ใบ)
    if (selectedCardIds.length === 2 && isAllSame && firstCardVal.startsWith('cat')) {
        // 2 ใบ: ขโมยสุ่ม -> ต้องเลือกเป้าหมาย
        setComboType('2cats');
        setShowTargetModal(true);
    } 
    else if (selectedCardIds.length === 3 && isAllSame && firstCardVal.startsWith('cat')) {
        // 3 ใบ: ขอกาดที่ต้องการ -> ต้องเลือกเป้าหมาย + ชื่อการ์ด
        setComboType('3cats');
        setShowTargetModal(true);
    } else {
        alert("Invalid Combo! Cards must be the same type.");
        setSelectedCardIds([]);
    }
  };

  // ส่งคำสั่ง Play ไป Backend
  const submitPlay = (cardsObj, targetWallet, wantedCard = null) => {
    const cardValues = cardsObj.map(c => c.val); // ส่งไปเป็น array ['cat_1', 'cat_1']

    socket.emit("play_card", {
        roomId,
        walletAddress: currentUser.walletAddress,
        cards: cardValues, // เปลี่ยนจาก card เป็น cards (Array)
        targetWallet,      // ส่งเป้าหมายไปด้วย (ถ้ามี)
        wantedCard         // ส่งชื่อการ์ดที่อยากได้ (ถ้ามี)
    });

    setSelectedCardIds([]);
    setShowTargetModal(false);
    setComboType(null);
  };

  // ปุ่มเลือกเป้าหมายใน Modal
  const handleTargetSelect = (targetWallet) => {
      const selectedCardsObj = myHand.filter(c => selectedCardIds.includes(c.id));
      
      if (comboType === '3cats') {
          // ถ้า 3 ใบ ให้กรอกชื่อการ์ด (แบบง่ายใช้ prompt)
          const wanted = prompt("Enter card name to steal (e.g. defuse, attack, skip):");
          if(wanted) submitPlay(selectedCardsObj, targetWallet, wanted.toLowerCase());
      } else {
          // ถ้า 2 ใบ แค่ส่งเป้าหมาย
          submitPlay(selectedCardsObj, targetWallet);
      }
  };

  const handleDrawCard = () => {
    if (currentTurnWallet !== currentUser?.walletAddress) return alert("Wait for your turn!");
    socket.emit("draw_card", { roomId, walletAddress: currentUser.walletAddress });
  };

  const isMyTurn = currentTurnWallet === currentUser?.walletAddress;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#2a2a2a] font-sans">
      {/* Background */}
      <div className="absolute inset-0 blur-[3px] opacity-25 pointer-events-none">
        <CldImage src="hpspfzupmdw8bh3crszn" width={1920} height={1080} className="w-full h-full object-cover" alt="bg" />
      </div>

      {/* --- UI Layer --- */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-6 py-2 rounded-full z-50 border-2 border-[#FBAF22]">
        {isMyTurn ? <span className="text-green-400 font-bold text-xl animate-pulse">YOUR TURN ({timeLeft}s)</span> : <span className="text-gray-300">Waiting for opponent...</span>}
      </div>

      {/* Logs */}
      <div className="absolute top-4 left-4 w-64 bg-black/40 p-4 rounded-lg text-sm text-white pointer-events-none z-0">
        <h3 className="font-bold text-[#FBAF22] mb-2">Game Log</h3>
        {gameLogs.map((log, i) => <div key={i} className="mb-1 opacity-80 border-b border-white/10 pb-1">{log}</div>)}
      </div>

      {/* Central Pile */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="transform -translate-y-8 scale-110"><CentralPile topCard={lastPlayedCard} /></div>
      </div>

      {/* --- Players Seats --- */}
      {players[1] && <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10"><PlayerSeat player={players[1]} cards={new Array(players[1].cardCount).fill(0)} layout="left" containerSize={400} /></div>}
      {players[2] && <div className="absolute top-5 left-[20%] z-10"><PlayerSeat player={players[2]} cards={new Array(players[2].cardCount).fill(0)} layout="top" containerSize={320} /></div>}
      {players[3] && <div className="absolute top-5 right-[20%] z-10"><PlayerSeat player={players[3]} cards={new Array(players[3].cardCount).fill(0)} layout="top" containerSize={320} /></div>}
      {players[4] && <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10"><PlayerSeat player={players[4]} cards={new Array(players[4].cardCount).fill(0)} layout="right" containerSize={400} /></div>}

      {/* --- My Hand (Bottom) --- */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center">
         {selectedCardIds.length > 0 && isMyTurn && (
            <div className="mb-4 animate-bounce z-50">
                <button onClick={handlePrePlay} className="bg-[#FBAF22] text-black text-xl font-extrabold px-8 py-3 rounded-full shadow-[0_4px_0_#a52424] hover:bg-white transition">
                    PLAY {selectedCardIds.length} CARD(S) 💥
                </button>
            </div>
        )}
        {isMyTurn && selectedCardIds.length === 0 && (
             <div className="mb-4 z-50">
                <button onClick={handleDrawCard} className="bg-green-600 text-white text-lg font-bold px-6 py-2 rounded-full shadow-lg hover:bg-green-500 transition animate-pulse">
                    END TURN (DRAW CARD) 🃏
                </button>
            </div>
        )}
        <PlayerSeat 
            player={{ name: currentUser?.username || "You", tokens: 0 }} 
            cards={myHand} 
            isSelf={true} 
            layout="bottom" 
            containerSize={800}
            onCardClick={handleCardClick}
            selectedCards={selectedCardIds}
        />
      </div>

      {/* --- TARGET SELECTION MODAL --- */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
            <div className="bg-white p-6 rounded-2xl text-center max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-black">Choose a Victim! 😈</h2>
                <p className="mb-4 text-gray-600">
                    {comboType === '3cats' ? 'Select who to steal a SPECIFIC card from:' : 'Select who to steal a RANDOM card from:'}
                </p>
                <div className="grid grid-cols-1 gap-3">
                    {players.slice(1).map((p) => (
                        <button 
                            key={p.id}
                            onClick={() => handleTargetSelect(p.id)}
                            disabled={!p.isAlive}
                            className={`p-3 rounded-xl border-2 font-bold text-lg
                                ${p.isAlive 
                                    ? 'border-black hover:bg-[#FBAF22] hover:text-white text-black' 
                                    : 'border-gray-300 text-gray-300 cursor-not-allowed'}`}
                        >
                            {p.name} {p.isAlive ? '' : '(Dead 💀)'}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowTargetModal(false)} className="mt-4 text-red-500 underline">Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
}
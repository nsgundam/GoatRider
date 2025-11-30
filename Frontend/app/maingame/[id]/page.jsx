// app/maingame/[id]/page.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { makeSimpleDeck } from "../../utils/deck";
import PlayerHand from "../../components/PlayerHand";
import CentralPile from "../../components/CentralPile";
import StealModal from "../../components/StealModal"; // ถ้ามีใช้

// กำหนดผู้เล่น 5 คน
const playersData = [
  { id: "me", name: "Me (You)", position: "bottom" },
  { id: "p1", name: "Player Left", position: "left" },
  { id: "p2", name: "Player Top-L", position: "top-left" },
  { id: "p3", name: "Player Top-R", position: "top-right" },
  { id: "p4", name: "Player Right", position: "right" },
];

export default function MainGame() {
  const [deck, setDeck] = useState([]);
  const [hands, setHands] = useState([[], [], [], [], []]); // ไพ่ของ 5 คน
  const [centralTop, setCentralTop] = useState(null);
  
  // State สำหรับเก็บไพ่ที่เลือก (ไม่เกิน 3 ใบ)
  const [selectedCardIds, setSelectedCardIds] = useState([]);

  // แจกไพ่เริ่มต้น
  useEffect(() => {
    const d = makeSimpleDeck();
    const copy = [...d];
    
    // แจกไพ่คนละ 5 ใบ (ตัวอย่าง)
    const newHands = playersData.map(() => {
      return copy.splice(0, 5); 
    });

    setDeck(copy);
    setHands(newHands);
  }, []);

  // ฟังก์ชันกดเลือกไพ่
  function handleMyCardClick(playerIndex, card) {
    if (playerIndex !== 0) return; // กดได้แค่ไพ่เรา

    setSelectedCardIds(prev => {
      // ถ้ามีอยู่แล้ว ให้เอาออก (Deselect)
      if (prev.includes(card.id)) {
        return prev.filter(id => id !== card.id);
      }
      // ถ้ายังไม่ครบ 3 ให้เพิ่ม (Select)
      if (prev.length < 3) {
        return [...prev, card.id];
      }
      // ถ้าครบ 3 แล้ว ไม่ทำอะไร
      return prev;
    });
  }

  // ปุ่มเล่นไพ่ที่เลือก (ส่งให้ Backend)
  function handlePlaySelected() {
    if (selectedCardIds.length === 0) return;
    
    console.log("Playing cards:", selectedCardIds);
    
    // Logic ตัดไพ่จากมือ (จำลอง)
    setHands(prev => {
        const myHand = [...prev[0]];
        // กรองเอาเฉพาะใบที่ไม่ได้ถูกเลือกเก็บไว้
        const newMyHand = myHand.filter(c => !selectedCardIds.includes(c.id));
        const newHands = [...prev];
        newHands[0] = newMyHand;
        return newHands;
    });

    // Reset Selection
    setSelectedCardIds([]);
  }

  // ปุ่มจั่วไพ่ (จำลองว่าไพ่เยอะขึ้นเรื่อยๆ)
  function handleDrawCard() {
    if (deck.length === 0) return;
    const newCard = deck[0];
    setDeck(d => d.slice(1));
    
    // จั่วให้ทุกคนเพื่อ Test การซ้อนทับ
    setHands(prev => prev.map(hand => [...hand, { ...newCard, id: Math.random().toString() }]));
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#2a2a2a] font-sans">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
         {/* ใส่รูป Background ของคุณตรงนี้ */}
         <div className="w-full h-full bg-gradient-to-b from-[#3a6186] to-[#89253e] opacity-80" />
      </div>

      {/* --- PLAYERS LAYOUT --- */}

      {/* 1. Player Left */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col items-center">
        <PlayerBadge name="P1 Left" tokens={20} />
        <div className="mt-4">
            <PlayerHand cards={hands[1]} isSelf={false} layout="left" />
        </div>
      </div>

      {/* 2. Player Top-Left */}
      <div className="absolute top-4 left-[20%] z-10 flex flex-col items-center">
        <PlayerBadge name="P2 Top-L" tokens={50} />
        <div className="-mt-6 transform rotate-180">
             <PlayerHand cards={hands[2]} isSelf={false} layout="top" />
        </div>
      </div>

      {/* 3. Player Top-Right */}
      <div className="absolute top-4 right-[20%] z-10 flex flex-col items-center">
        <PlayerBadge name="P3 Top-R" tokens={15} />
        <div className="-mt-6 transform rotate-180">
             <PlayerHand cards={hands[3]} isSelf={false} layout="top" />
        </div>
      </div>

      {/* 4. Player Right */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col items-center">
        <PlayerBadge name="P4 Right" tokens={99} />
        <div className="mt-4">
            <PlayerHand cards={hands[4]} isSelf={false} layout="right" />
        </div>
      </div>

      {/* --- CENTRAL AREA --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="transform -translate-y-12 scale-125">
            <CentralPile topCard={centralTop} />
        </div>
      </div>

      {/* --- MY PLAYER (BOTTOM) --- */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-4">
        
        {/* Action Bar (ปุ่มกดเล่น) */}
        {selectedCardIds.length > 0 && (
            <div className="mb-4 animate-bounce">
                <button 
                    onClick={handlePlaySelected}
                    className="bg-[#FBAF22] hover:bg-[#e69b15] text-white text-xl font-bold px-8 py-3 rounded-full shadow-[0_4px_0_#a52424] transition-transform active:scale-95"
                >
                    PLAY {selectedCardIds.length} CARDS
                </button>
            </div>
        )}

        {/* My Hand */}
        <div className="w-full max-w-[1000px] px-10">
            <PlayerHand 
                cards={hands[0]} 
                isSelf={true} 
                playerIndex={0}
                onCardClick={handleMyCardClick}
                selectedCards={selectedCardIds} // ส่ง state ไป
                containerWidth={1000}
            />
        </div>

        {/* My Badge & Controls */}
        <div className="absolute bottom-6 left-8 flex gap-4">
            <PlayerBadge name="Me (Pat)" tokens={100} isSelf />
            <button onClick={handleDrawCard} className="bg-blue-500 text-white px-4 py-2 rounded shadow">
                + Draw (Test)
            </button>
        </div>
      </div>

    </div>
  );
}

// --- Component ย่อยสำหรับป้ายชื่อ ---
function PlayerBadge({ name, tokens, isSelf = false }) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border-2 border-black
      ${isSelf ? "bg-[#FBAF22] text-white scale-110" : "bg-white text-black"}
    `}>
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center border border-gray-500">
        👤
      </div>
      <div>
        <div className="font-bold text-sm leading-tight">{name}</div>
        <div className="text-xs opacity-80">{tokens} Tokens</div>
      </div>
    </div>
  );
}
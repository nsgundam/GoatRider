"use client";

import React, { useEffect, useState } from "react";
import { makeSimpleDeck } from "../utils/deck";
import PlayerSeat from "../components/PlayerSeat"; 
import CentralPile from "../components/CentralPile";
import { CldImage } from "next-cloudinary";

const playersData = [
  { id: "me", name: "Me (You)", tokens: 100 },
  { id: "p1", name: "Player Left", tokens: 20 },
  { id: "p2", name: "Player Top-L", tokens: 50 },
  { id: "p3", name: "Player Top-R", tokens: 15 },
  { id: "p4", name: "Player Right", tokens: 99 },
];

export default function MainGame() {
  const [deck, setDeck] = useState([]);
  const [hands, setHands] = useState([[], [], [], [], []]);
  const [selectedCardIds, setSelectedCardIds] = useState([]);

  useEffect(() => {
    const d = makeSimpleDeck();
    const copy = [...d];
    // แจกคนละ 5 ใบ
    const newHands = playersData.map(() => copy.splice(0, 5));
    setDeck(copy);
    setHands(newHands);
  }, []);

  function handleMyCardClick(playerIndex, card) {
    if (playerIndex !== 0) return;
    setSelectedCardIds(prev => {
      if (prev.includes(card.id)) return prev.filter(id => id !== card.id);
      if (prev.length < 3) return [...prev, card.id];
      return prev;
    });
  }
  // ✅ ฟังก์ชันใหม่: เล่นไพ่ (ลบไพ่ที่เลือกออกจากมือ)
  function handlePlayCards() {
    setHands(prev => {
      // กรองเอาเฉพาะใบที่ "ไม่ได้ถูกเลือก" เก็บไว้ (ใบที่เลือกจะหายไป) ใส่เพิ่มเติมเกี่ยวกับการกรองไพ่ อะไรเลือกแล้วต้องลบอะไรไม่ต้องลบ
      const myNewHand = prev[0].filter(card => !selectedCardIds.includes(card.id));
      
      const newAllHands = [...prev];
      newAllHands[0] = myNewHand; // อัปเดตมือเรา
      return newAllHands;
    });

    // เคลียร์สถานะการเลือก และ รีเซ็ตเวลา
    setSelectedCardIds([]);
    setTimeLeft(15);
  }

  function handleDrawCard() {
    if (deck.length === 0) return;
    const newCard = { ...deck[0], id: Math.random().toString() };
    setDeck(d => d.slice(1));
    setHands(prev => prev.map(h => [...h, newCard]));
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#2a2a2a] font-sans">
      {/* Background Image */}
      <div className="absolute inset-0 blur-[3px] opacity-25">
        <CldImage
          src="hpspfzupmdw8bh3crszn"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          alt="background"
        />
      </div>
      {/* Central Pile */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="transform -translate-y-8 scale-110">
            <CentralPile topCard={null} />
        </div>
      </div>

      {/* --- Player Seats --- */}

      {/* 1. ผู้เล่นซ้าย (LEFT) */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
        <PlayerSeat 
            player={playersData[1]} 
            cards={hands[1]} 
            layout="left" 
            containerSize={400} 
        />
      </div>

      {/* 2. ผู้เล่นบนซ้าย (TOP LEFT) */}
      <div className="absolute top-5 left-[300px] z-10">
        <PlayerSeat 
            player={playersData[2]} 
            cards={hands[2]} 
            layout="top-top" 
            containerSize={320} 
        />
      </div>

      {/* 3. ผู้เล่นบนขวา (TOP RIGHT) */}
      <div className="absolute top-5 right-[300px] z-10">
        <PlayerSeat 
            player={playersData[2]} 
            cards={hands[2]} 
            layout="top-top" 
            containerSize={320} 
        />
      </div>

      {/* 4. ผู้เล่นขวา (RIGHT) */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
        <PlayerSeat 
            player={playersData[4]} 
            cards={hands[4]} 
            layout="right" 
            containerSize={400} 
        />
      </div>

      {/* 5. ตัวเรา (BOTTOM) - ย้ายเข้ามาอยู่ใน div หลักให้ถูกต้อง */}
      <div className="absolute bottom-10 left-0.5 right-0 z-20 
      flex flex-col items-center">
         
         {/* ปุ่ม Play (จะโชว์เมื่อเลือกไพ่) */}
         {selectedCardIds.length > 0 && (
            <div className="mb-2 animate-bounce absolute -top-2 z-20">
                <button 
                    onClick={() => setSelectedCardIds([])}
                    className="bg-[#FBAF22] text-white text-lg 
                    font-bold px-6 py-2 rounded-full shadow-lg border-2
                     border-orange-300"
                >
                    PLAY {selectedCardIds.length} CARDS
                </button>
            </div>
        )}

        <PlayerSeat 
            player={playersData[0]} 
            cards={hands[0]} 
            isSelf={true} 
            layout="bottom" 
            containerSize={800}
            onCardClick={handleMyCardClick}
            selectedCards={selectedCardIds}
        />
        
        {/* ปุ่ม Test Draw */}
        <button onClick={handleDrawCard} className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded text-xs opacity-50 hover:opacity-100">
            + Draw
        </button>
      </div>

    </div>
  );
}
//-->maingame/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { makeSimpleDeck } from "../utils/deck"; // ต้องสร้าง utils/deck.js
import PlayerSeat from "../components/PlayerSeat";
import CentralPile from "../components/CentralPile";
import { CldImage } from "next-cloudinary";


const playersData = [
  { id: "p0", name: "Me (You)", tokens: 100, isSelf: true, layout: "bottom" },
  { id: "p1", name: "Top-L", tokens: 50, layout: "top" },
  { id: "p2", name: "Left", tokens: 20, layout: "left" },
  { id: "p3", name: "Top-R", tokens: 50, layout: "top" },
  { id: "p4", name: "Right", tokens: 30, layout: "right" },
];
export default function MainGame() {
  const [deck, setDeck] = useState([]);
  // hands: [มือเรา (index 0), มือ p1 (index 1), มือ p2 (index 2), มือ p3 (index 3), มือ p4 (index 4)]
  const [hands, setHands] = useState([[], [], [], [], []]);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  //อนิเมชั่นจั้ว handleDrawCard
  const [drawingCard, setDrawingCard] = useState(null);


  useEffect(() => {
    const d = makeSimpleDeck();
    const copy = [...d];
    // แจกไพ่
    const newHands = playersData.map((p, index) =>
      // เริ่มจาก 5 ใบทุกคน
      copy.splice(0, p.isSelf ? 5 : 5).map((card, i) => ({
        ...card,
        id: `${p.id}-c${i}-${Math.random().toFixed(2)}`,
      }))
    );
    setDeck(copy);
    setHands(newHands);
  }, []);

  function handleMyCardClick(playerIndex, card) {
    // playerIndex คือ index ใน Array hands
    if (playerIndex !== 0) return;
    setSelectedCardIds((prev) => {
      if (prev.includes(card.id)) return prev.filter((id) => id !== card.id);
      if (prev.length < 3) return [...prev, card.id];
      return prev;
    });
  }

  // ฟังก์ชัน: เล่นไพ่ (ลบไพ่ที่เลือกออกจากมือ)
  function handlePlayCards() {
    setHands((prev) => {
      const myNewHand = prev[0].filter(
        (card) => !selectedCardIds.includes(card.id)
      );
      const newAllHands = [...prev];
      newAllHands[0] = myNewHand;
      return newAllHands;
    });

    setSelectedCardIds([]);
    setTimeLeft(15);
  }

  // ฟังก์ชัน Draw Card
  function handleDrawCard() {
    if (deck.length === 0) return;
    const newCard = { ...deck[0], id: `draw-c-${Math.random().toString()}` };
    setDeck((d) => d.slice(1));

    setHands((prev) => {
      const newAllHands = [...prev];
      newAllHands[0] = [...newAllHands[0], newCard];
      return newAllHands;
    });
  }

  
  // Helper function เพื่อรวมข้อมูลผู้เล่นและมือไพ่เข้าด้วยกัน
  const getPlayerProps = (index) => ({
    ...playersData[index],
    cards: hands[index] || [],
    playerIndex: index,
    // Props เหล่านี้จะถูกใช้แค่กับตัวเอง (index 0)
    onCardClick: playersData[index].isSelf ? handleMyCardClick : undefined,
    selectedCards: playersData[index].isSelf ? selectedCardIds : [],
  });
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
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <CentralPile
          topCard={null}
          onDrawClick={handleDrawCard}
          deckCount={deck.length}
        />
      </div>

      {/* //----------------------------------------------------ห๋าาาาาาา-----------------------------------------------------------// */}

      {/* --- Player Seats --- */}
      {/* 1. ผู้เล่นบนซ้าย (TOP LEFT) - p1 */}
      <div className="absolute top-5 left-[20%] z-10">
        <PlayerSeat
          {...getPlayerProps(1)}
          layout="top" // ใช้ layout="top" แทน "top-top"
          containerSize={320}
        />
      </div>

      {/* 2. ผู้เล่นซ้าย (LEFT) - p2 */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
        <PlayerSeat {...getPlayerProps(2)} layout="left" containerSize={400} />
      </div>

      {/* 3. ผู้เล่นบนขวา (TOP RIGHT) - p3 */}
      <div className="absolute top-5 right-[20%] z-10">
        <PlayerSeat
          {...getPlayerProps(3)}
          layout="top" // ใช้ layout="top" แทน "top-top"
          containerSize={320}
        />
      </div>

      {/* 4. ผู้เล่นขวา (RIGHT) - p4 */}
      <div className="absolute right-[300] top-1/2 transform -translate-y-[100] z-10">
        <PlayerSeat {...getPlayerProps(4)} layout="right" containerSize={300} />
      </div>

      {/* 5. ตัวเรา (BOTTOM) - p0 */}
      <div
        className="absolute bottom-10 left-0 right-200 z-20 
         flex flex-col items-center **w-full**"
      >
        {/* ปุ่ม Play (จะโชว์เมื่อเลือกไพ่) */}
        {selectedCardIds.length > 0 && (
          <div className="mb-2 animate-bounce absolute -top-50 right-44 z-20 pointer-events-auto">
            <button
              onClick={handlePlayCards} // 💡 แก้ไขให้เรียก handlePlayCards ที่ลบไพ่จริง
              className="bg-[#FBAF22] text-white text-lg 
                            font-bold px-6 py-2 rounded-full shadow-lg border-2
                             border-orange-300"
            >
              PLAY {selectedCardIds.length} CARDS
            </button>
          </div>
        )}

        <PlayerSeat
          {...getPlayerProps(0)} // Pass all props for self
          containerSize={800}
        />
      </div>
    </div>
  );
}

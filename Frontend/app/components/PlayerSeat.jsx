// app/components/PlayerSeat.jsx
"use client";
import React from "react";
import PlayerHand from "./PlayerHand";

export default function PlayerSeat({
  player,       // { id, name, tokens }
  cards = [],   // array of cards
  isSelf = false,
  layout = "bottom", // 'bottom', 'top', 'left', 'right', 'top-left', 'top-right'
  containerSize = 600,
  onCardClick,
  selectedCards = [],
}) {
  const cardCount = cards.length;

  // --- จัด Layout ของ Seat (Info vs Hand) ---
  // เราจะใช้ Flexbox เพื่อเรียง Info กับ Hand ให้สัมพันธ์กันตามตำแหน่ง
  let flexDirection = "flex-col"; // default (Top/Bottom)
  let infoOrder = "order-last";   // default: Hand ก่อน, Info ทีหลัง (สำหรับ Top)
  let alignment = "items-center";

  if (layout === "bottom") {
    flexDirection = "flex-col";
    infoOrder = "order-last"; // Hand บน, Info ล่าง
  } else if (layout === "top" || layout === "top-left" || layout === "top-right") {
    flexDirection = "flex-col";
    infoOrder = "order-first"; // Info บน, Hand ล่าง (หมุนมือ)
  } else if (layout === "left") {
    flexDirection = "flex-row";
    infoOrder = "order-first"; // Info ซ้าย, Hand ขวา
  } else if (layout === "right") {
    flexDirection = "flex-row";
    infoOrder = "order-last"; // Hand ซ้าย, Info ขวา
  }

  return (
    <div className={`flex ${flexDirection} ${alignment} gap-2 relative`}>
      
      {/* --- ส่วนข้อมูลผู้เล่น (Profile + Card Count) --- */}
      {/* นี่คือ "ก้อนเดียว" ที่คุณต้องการ รวมชื่อ+เหรียญ+จำนวนไพ่ */}
      <div className={`
        ${infoOrder} z-20 transition-transform duration-300
        ${isSelf ? "scale-110" : "scale-100"}
      `}>
        <div className={`
          relative flex flex-col items-center justify-center
          bg-white/90 backdrop-blur-sm border-2 border-black rounded-2xl shadow-lg
          px-4 py-2 min-w-[100px] select-none
          ${isSelf ? "bg-[#FBAF22]/90 border-[#8B4513]" : ""}
        `}>
          {/* Avatar (ใส่รูปได้) */}
          <div className="absolute -top-6 w-10 h-10 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center text-lg shadow-sm">
            {isSelf ? "😎" : "👤"}
          </div>

          {/* Name & Tokens */}
          <div className="mt-3 text-center">
            <div className="font-bold text-sm text-black leading-tight">{player.name}</div>
            <div className="text-[10px] font-semibold text-gray-600 bg-gray-200/50 px-2 py-0.5 rounded-full mt-1">
              🪙 {player.tokens}
            </div>
          </div>

          {/* Card Count Badge (รวมอยู่ในก้อน Profile แล้ว) */}
          {!isSelf && (
            <div className="absolute -right-2 -top-2 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border border-white shadow-md animate-pulse">
              {cardCount}
            </div>
          )}
        </div>
      </div>

      {/* --- ส่วนกองไพ่ (Hand) --- */}
      <div className={layout.includes("top") ? "transform rotate-180" : ""}>
        <PlayerHand 
          cards={cards}
          isSelf={isSelf}
          layout={layout.includes("left") || layout.includes("right") ? (layout.includes("left") ? "left" : "right") : "bottom"}
          containerSize={containerSize}
          onCardClick={onCardClick}
          selectedCards={selectedCards}
        />
      </div>

    </div>
  );
}
"use client";
import React from "react";
import PlayerHand from "./PlayerHand";

export default function PlayerSeat({
  player,       // { id, name, tokens }
  cards = [],   // array of cards
  isSelf = false,
  layout = "bottom", // 'bottom', 'top', 'left', 'right'
  containerSize = 600,
  onCardClick,
  selectedCards = [],
}) {
  const cardCount = cards.length;

  // --- จัด Layout ของ Seat (Badge vs Hand) ---
  let flexDirection = "flex-col"; 
  let infoOrder = "order-last";   
  let alignment = "items-center";

  // กำหนดทิศทาง Flexbox ตามตำแหน่งที่นั่ง
  if (layout === "bottom") {
    flexDirection = "flex-col";
    infoOrder = "order-last"; // Hand บน, Badge ล่าง
  } else if (layout === "top") {
    flexDirection = "flex-col";
    infoOrder = "order-first"; // Badge บน, Hand ล่าง
  } else if (layout === "left") {
    flexDirection = "flex-row";
    infoOrder = "order-first"; // Badge ซ้าย, Hand ขวา
  } else if (layout === "right") {
    flexDirection = "flex-row";
    infoOrder = "order-last"; // Hand ซ้าย, Badge ขวา
  }

  return (
    <div className={`flex ${flexDirection} ${alignment} gap-3 relative`}>
      
      {/* --- ส่วนป้ายชื่อ (Badge) : เป็นแนวนอนทั้งหมด --- */}
      <div className={`
        ${infoOrder} z-20 transition-transform duration-300
        ${isSelf ? "scale-110" : "scale-100"}
      `}>
        <div className={`
          rounded-full px-4 py-2 shadow-[0_4px_0_#000] border-2 border-black 
          flex items-center gap-3 min-w-[140px]
          ${isSelf ? "bg-white" : "bg-[#ffb449] shadow-[0_4px_0_#b45309]"}
        `}>
          {/* Avatar / Card Count */}
          <div className="w-10 h-10 rounded-full bg-gray-100 border-2
           border-gray-300 flex items-center justify-center text-black font-bold 
           text-sm shadow-inner shrink-0">
            {isSelf ? "😎" : cardCount}
          </div>
          
          {/* Info Text */}
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="text-sm font-bold text-black truncate max-w-[100px]">{player.name}</span>
            <span className="text-[10px] font-semibold text-black/60 bg-black/5 px-2 py-0.5 rounded-full w-fit mt-0.5">
              Tokens: {player.tokens}
            </span>
          </div>
        </div>
      </div>

      {/* --- ส่วนกองไพ่ (Hand) --- */}
      <div className={layout === "top" ? "transform rotate-180" : ""}>
        <PlayerHand 
          cards={cards}
          isSelf={isSelf}
          layout={layout}
          containerSize={containerSize}
          onCardClick={onCardClick}
          selectedCards={selectedCards}
        />
      </div>

    </div>
  );
}
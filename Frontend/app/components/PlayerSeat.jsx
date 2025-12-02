"use client";
import React from "react";
import PlayerHand from "./PlayerHand"; 

export default function PlayerSeat({
  player,       // { id, name, tokens, playerIndex }
  cards = [],   // array of cards
  isSelf = false,
  layout = "bottom", // 'bottom', 'top', 'left', 'right'
  containerSize = 600,
  onCardClick,
  selectedCards = [],
}) {
  const cardCount = Array.isArray(cards) ? cards.length : 0;

  // --- จัด Layout ตามความต้องการ ---
  // 1. ผู้เล่นอื่น (Top, Left, Right) : Badge บน Hand, ชิดขวา
  let flexDirection = "flex-col"; 
  let infoOrder = "order-first"; // Badge อยู่บน Hand เสมอ
  let alignment = "items-end";   // จัดวางองค์ประกอบทั้งหมดชิดขวา

  // 2. ผู้เล่นเรา (isSelf) : Badge ล่าง Hand, จัดกึ่งกลาง (UX มาตรฐาน)
  if (isSelf) {
    alignment = "items-center"; // จัดตรงกลาง
    infoOrder = "order-last";   // Badge อยู่ล่าง Hand
  } 

  return (
    // ใช้ alignment และ flexDirection ใหม่ที่กำหนด
    <div className={`flex ${flexDirection} ${alignment} gap-3 relative`}>
      
      {/* --- ส่วนป้ายชื่อ (Badge) --- */}
      <div className={`
        ${infoOrder} z-20 transition-transform duration-300
        ${isSelf ? "scale-110" : "scale-100"}
      `}>
        <div className={`
          rounded-full px-4 py-3 shadow-[0_4px_0_#000] border-2 border-black 
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
            <span className="text-sm font-bold text-black truncate max-w-[100px]">{player?.name}</span>
            <span className="text-[10px] font-semibold text-black/60 bg-black/5 px-2 py-0.5 rounded-full w-fit mt-0.5">
              Tokens: {player?.tokens}
            </span>
          </div>
        </div>
      </div>

      {/* --- ส่วนกองไพ่ (Hand) --- */}
      {/* 💡 ลบคลาสการหมุนออกอย่างถาวร: `className={layout === "top" || layout === "top-top" ? "transform rotate-180" : ""}` */}
      <div className=""> 
        <PlayerHand 
          cards={cards}
          isSelf={isSelf}
          layout={layout}
          containerSize={containerSize}
          onCardClick={onCardClick}
          selectedCards={selectedCards}
          playerIndex={player?.playerIndex || 0}
        />
      </div>

    </div>
  );
}
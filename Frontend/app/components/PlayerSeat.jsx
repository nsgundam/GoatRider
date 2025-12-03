"use client";
import React from "react";
import PlayerHand from "./PlayerHand"; 

function PlayerSeatInternal({
  player,       // { id, name, tokens, playerIndex }
  cards = [],   // array of cards
  isSelf = false,
  layout = "bottom", // 'bottom', 'top', 'left', 'right'
  containerSize = 600,
  onCardClick,
  selectedCards = [],
}) {
  const cardCount = Array.isArray(cards) ? cards.length : 0;

  // --- จัด Layout: Badge บน Hand, ชิดขวา/กลาง ---
let flexDirection = "flex-col"; 
let infoOrder = "order-first"; 
let alignment = "items-center"; 

if (isSelf) {
  alignment = "items-center"; // ผู้เล่นเราต้องอยู่ตรงกลาง
  infoOrder = "order-last";   // Badge อยู่ล่าง Hand
} else {
  // 💡 โค้ดที่เพิ่ม/แก้ไข: สำหรับผู้เล่นคนอื่นรอบโต๊ะ
  switch (layout) {
    case 'left':
      flexDirection = "flex-row-reverse"; // Badge อยู่ขวาของ Hand
      infoOrder = "order-last"; // Badge อยู่ขวา
      alignment = "items-center";
      break;
    case 'right':
      flexDirection = "flex-row-reverse"; // Badge อยู่ซ้ายของ Hand
      infoOrder = "order-last"; // Badge อยู่ซ้าย
      alignment = "items-center";
      break;
    case 'top':
      flexDirection = "flex-col-reverse"; // Badge อยู่ล่างของ Hand
      infoOrder = "order-last";
      alignment = "items-center";
      break;
    case 'bottom': // ผู้เล่นคนอื่น (ด้านล่าง) หรือค่าเริ่มต้น
    default:
      // ค่าเริ่มต้น: flex-col, order-first (Badge อยู่บน Hand)
      break;
  }
} 
// สำหรับผู้เล่นคนอื่น: alignment จะเป็น items-center (เพื่อให้ badge อยู่เหนือ hand)
return (
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
export default React.memo(PlayerSeatInternal);
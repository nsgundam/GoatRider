//--> components/PlayerSeat.jsx
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

  // --- จัด Layout ---
  let flexDirection = "flex-col";
  let infoOrder = "order-first";
  let alignment = "items-center-top";

  if (isSelf) {
    alignment = "md:left-1 transform -translate-x-1/2";
    infoOrder = "order-last";
  }

  return (
    <div className={`flex ${flexDirection} ${alignment} gap-1 relative`}>
      {/* --- ส่วนป้ายชื่อ (Badge) แยก div สำหรับตัวเองกับคนอื่น --- */}
    {isSelf ? (
  // Badge ของตัวเรา (😎)
  <div
    className={`
      ${infoOrder}
      z-20
      absolute
      left-[400px] 
      -translate-x-[100px]
      top-[-150px]
      scale-110


    `}
  >
    <div
      className={`
        rounded-full px-4 py-3 shadow-[0_4px_0_#000] border-2 border-black 
        flex items-center gap-3 min-w-[140px]
        bg-white
      `}
    >
      {/* Avatar 😎 */}
      <div
        className="w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-300 
        flex items-center justify-center text-black font-bold text-sm shadow-inner shrink-0"
      >
        😎
      </div>

      {/* Info Text */}
      <div className="flex flex-col leading-tight overflow-hidden">
        <span className="text-sm font-bold text-black truncate max-w-[100px]">
          {player?.name}
        </span>
        <span className="text-[10px] font-semibold text-black/60 bg-black/5 px-2 py-0.5 rounded-full w-fit mt-0.5">
          Tokens: {player?.tokens}
        </span>
      </div>
    </div>
  </div>
) : (

        // Badge ของผู้เล่นคนอื่น
        <div
          className={`
            ${infoOrder} z-20 transition-transform duration-300 
            scale-100
            
          `}
        >
          <div
            className={`
              rounded-full px-4 py-2 shadow-[0_4px_0_#000] border-2 border-black 
              flex items-center gap-3 min-w-[140px]
              bg-[#ffb449] shadow-[0_4px_0_#b45309]
            `}
          >
            {/* Avatar = จำนวนไพ่ */}
            <div
              className="w-10 h-10 rounded-full bg-gray-100 border-2
                border-gray-300 flex items-center justify-center text-black font-bold 
                text-sm shadow-inner shrink-0"
            >
              {cardCount}
            </div>

            {/* Info Text */}
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="text-sm font-bold text-black truncate max-w-[100px]">
                {player?.name}
              </span>
              <span className="text-[10px] font-semibold text-black/60 bg-black/5 px-2 py-0.5 rounded-full w-fit mt-0.5">
                Tokens: {player?.tokens}
              </span>
            </div>
          </div>
        </div>
      )}

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

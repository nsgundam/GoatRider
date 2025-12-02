"use client";
import React, { useMemo, useState } from "react";
import Card from "./Card";

export default function PlayerHand({
  cards = [],
  isSelf = false,
  onCardClick,
  playerIndex = 0,
  layout = "bottom",
  containerSize = 600,
  selectedCards = [],
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const cardCount = cards.length;

  const isVertical = false; 

  const { cardSize, offset, startPos } = useMemo(() => {
    const baseWidth = isSelf ? 120 : 100;
    const itemSize = baseWidth;

    const availableSpace = containerSize - 40; 
    const defaultOffset = isSelf ? 50 : 35; 
    const maxTotalSize = (cardCount - 1) * defaultOffset + itemSize;
    
    let finalOffset = defaultOffset;
    if (maxTotalSize > availableSpace) {
      finalOffset = (availableSpace - itemSize) / Math.max(1, cardCount - 1);
    }

    const actualTotalSize = (cardCount - 1) * finalOffset + itemSize;
    const start = (containerSize - actualTotalSize) / 2;

    return { cardSize: baseWidth, offset: finalOffset, startPos: start };
  }, [cardCount, containerSize, isSelf]);

  return (
    <div 
      className="relative pointer-events-none"
      style={{
        width: "100%", 
        height: isSelf ? "180px" : "140px", 
        overflow: "visible", 
      }}
    >
      {cards.map((card, i) => {
        const posValue = startPos + i * offset;
        const isHovered = hoveredIndex === i;
        const isSelected = selectedCards.includes(card.id); 
        
        let z = 100 + i;
        if (isSelf && (isHovered || isSelected)) z = 500;

        // 💡 แก้ไข: ใช้ transform: translateX แทน left
        // เปลี่ยนการใช้ left เป็น transform: translateX()
        const transformValue = `translateX(${posValue}px)`;

        const style = { 
            position: "absolute", 
            // ❌ ลบ left: `${posValue}px`, 
            transform: transformValue, // 💡 ใช้ transform แทน left
            zIndex: z 
        };

        // Animation Classes: เปลี่ยนให้ transition แค่ transform
        let animClass = "transition-[transform,filter] duration-300 ease-out origin-bottom"; // 💡 จำกัด transition ให้เหลือแค่ transform
        
        // เพิ่ม transform สำหรับการยกไพ่ (Hover/Selected)
        let translateY = 0;
        let scale = 100;
        
        if (isSelf) {
          animClass += " cursor-pointer pointer-events-auto";
          if (isSelected) {
            translateY = -48; // -translate-y-12 * 4px = -48px
            scale = 110;
          } else if (isHovered) {
            translateY = -32; // -translate-y-8 * 4px = -32px
            scale = 110;
          }
        } 
        
        // 💡 รวม transform และ scale เข้ากับ style
        style.transform = `${transformValue} translateY(${translateY}px) scale(${scale / 100})`;
        
        // ❌ ลบการใช้ animClass สำหรับ translate-y และ scale ออกจากโค้ด
        // เนื่องจากเราใส่ค่าเหล่านี้เข้าไปใน style.transform แล้ว

        return (
          <div
            key={card.id ?? i}
            // 💡 นำ transform logic ที่คำนวณแล้วมาใช้
            style={style} 
            className={animClass} // ใช้แค่เพื่อกำหนด transition
            onMouseEnter={() => isSelf && setHoveredIndex(i)}
            onMouseLeave={() => isSelf && setHoveredIndex(null)}
            onClick={() => isSelf && onCardClick && onCardClick(playerIndex, card)}
          >
            {/* White Frame Wrapper */}
            <div className={`
              bg-white p-1.5 rounded-xl shadow-lg border border-gray-200
              ${isSelf && isSelected ? "ring-4 ring-[#FBAF22] ring-offset-2" : ""}
            `}
            style={{
                width: `${cardSize}px`,
                height: `${Math.round((cardSize - 12) * 1.4) + 12}px` 
            }}
            >
              <Card 
                card={card} 
                isFaceUp={isSelf} 
                width={cardSize - 12}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
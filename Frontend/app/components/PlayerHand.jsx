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

  // --- ปรับให้เป็นแนวนอนทั้งหมด (Horizontal Only) ---
  // บังคับไม่ให้เป็นแนวตั้งเลย ไม่ว่าจะ layout ไหน
  const isVertical = false; 

  // --- คำนวณขนาดและการซ้อนทับ ---
  const { cardSize, offset, startPos } = useMemo(() => {
    // ขนาดการ์ด: เราใหญ่ (120), คนอื่นเล็ก (100)
    const baseWidth = isSelf ? 120 : 100;
    
    // เนื่องจากเป็นแนวนอนหมด itemSize จึงเท่ากับความกว้าง (baseWidth) เสมอ
    const itemSize = baseWidth;

    const availableSpace = containerSize - 40; 
    const defaultOffset = isSelf ? 50 : 35; // ระยะห่างปกติ
    const maxTotalSize = (cardCount - 1) * defaultOffset + itemSize;
    
    let finalOffset = defaultOffset;
    if (maxTotalSize > availableSpace) {
      // สูตรบีบไพ่ (Squeeze) ถ้าพื้นที่ไม่พอ
      finalOffset = (availableSpace - itemSize) / Math.max(1, cardCount - 1);
    }

    const actualTotalSize = (cardCount - 1) * finalOffset + itemSize;
    const start = (containerSize - actualTotalSize) / 2;

    return { cardSize: baseWidth, offset: finalOffset, startPos: start };
  }, [cardCount, containerSize, isSelf]); // ตัด layout ออกจาก dependency เพราะไม่ได้ใช้คำนวณขนาดแล้ว

  return (
    <div 
      className="relative pointer-events-none"
      style={{
        // ปรับขนาด Container ให้รองรับแนวนอนทั้งหมด
        width: "100%", 
        height: isSelf ? "180px" : "140px", // ความสูงเผื่อการ์ดเด้งนิดหน่อย
        overflow: "visible", 
      }}
    >
      {cards.map((card, i) => {
        const posValue = startPos + i * offset;
        const isHovered = hoveredIndex === i;
        const isSelected = selectedCards.includes(card.id);
        
        let z = 100 + i;
        if (isSelf && (isHovered || isSelected)) z = 500;

        // บังคับ Style เป็นแนวนอน (ใช้ left)
        const style = { 
            position: "absolute", 
            left: `${posValue}px`, 
            zIndex: z 
        };

        // Animation Classes
        let animClass = "transition-all duration-300 ease-out origin-bottom";
        if (isSelf) {
          animClass += " cursor-pointer pointer-events-auto";
          if (isSelected) animClass += " -translate-y-12 scale-110 z-[600]";
          else if (isHovered) animClass += " -translate-y-8 scale-110";
          else animClass += " translate-y-0 scale-100";
        } else {
          animClass += " translate-y-0 scale-100";
        }

        return (
          <div
            key={card.id ?? i}
            style={style}
            className={animClass}
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
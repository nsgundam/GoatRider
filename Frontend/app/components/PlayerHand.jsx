// app/components/PlayerHand.jsx
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

  // --- คำนวณขนาด (เหมือนเดิม แต่ปรับจูนนิดหน่อย) ---
  const { cardSize, offset, startPos } = useMemo(() => {
    // ขนาดการ์ด (รวมขอบขาว): เราใหญ่ (120), คนอื่นเล็ก (90)
    const baseWidth = isSelf ? 120 : 90;
    const itemSize = (layout === "left" || layout === "right") 
      ? Math.round(baseWidth * 1.4) // แนวตั้งอิงความสูง
      : baseWidth;                  // แนวนอนอิงความกว้าง

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
  }, [cardCount, containerSize, isSelf, layout]);

  const isVertical = layout === "left" || layout === "right";

  return (
    <div 
      className="relative pointer-events-none"
      style={{
        width: isVertical ? "160px" : "100%",
        height: isVertical ? "100%" : "180px",
        // ให้แน่ใจว่า Container ใหญ่พอจะโชว์เงา
        overflow: "visible", 
      }}
    >
      {cards.map((card, i) => {
        const posValue = startPos + i * offset;
        const isHovered = hoveredIndex === i;
        const isSelected = selectedCards.includes(card.id);
        
        // Z-Index: 
        // ปกติ: เรียงตามลำดับ (100+i)
        // ถ้า Hover/Select (เฉพาะเรา): เด้งมาหน้าสุด (500)
        let z = 100 + i;
        if (isSelf && (isHovered || isSelected)) z = 500;

        // Position Style
        const style = isVertical
          ? { position: "absolute", top: `${posValue}px`, left: "50%", transform: "translateX(-50%)", zIndex: z }
          : { position: "absolute", left: `${posValue}px`, zIndex: z };

        // Animation Classes
        let animClass = "transition-all duration-300 ease-out origin-bottom";
        if (isSelf) {
          animClass += " cursor-pointer pointer-events-auto"; // เปิดให้กดได้เฉพาะเรา
          if (isSelected) animClass += " -translate-y-12 scale-110 z-[600]";
          else if (isHovered) animClass += " -translate-y-8 scale-110";
          else animClass += " translate-y-0 scale-100";
        } else {
          // คนอื่น: นิ่งๆ ไม่ต้องเด้ง
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
            {/* --- ส่วนที่ทำให้สวย "White Frame Wrapper" --- 
               ใช้กับทุกคน (ทั้งเราและเขา) 
            */}
            <div className={`
              bg-white p-1.5 rounded-xl shadow-lg border border-gray-200
              ${isSelf && isSelected ? "ring-4 ring-[#FBAF22] ring-offset-2" : ""}
            `}
            style={{
                width: `${cardSize}px`,
                // คำนวณความสูงให้สัมพันธ์กับ Card ratio (1.4) + padding
                height: `${Math.round((cardSize - 12) * 1.4) + 12}px` 
            }}
            >
              {/* ตัวการ์ดจริงอยู่ข้างใน */}
              <Card 
                card={card} 
                isFaceUp={isSelf} // เราหงาย คนอื่นคว่ำ
                width={cardSize - 12} // ลบ padding ออกเพื่อให้ลงล็อค
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
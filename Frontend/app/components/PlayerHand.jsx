// app/components/PlayerHand.jsx
"use client";
import React, { useMemo, useState } from "react";
import Card from "./Card";

export default function PlayerHand({
  cards = [],
  isSelf = false,
  onCardClick,
  playerIndex = 0,
  layout = "bottom", // bottom, top, left, right
  containerSize = 600, // ความกว้าง (แนวนอน) หรือ ความสูง (แนวตั้ง) ที่ยอมให้แสดงผล
  selectedCards = [],
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const cardCount = cards.length;

  // --- คำนวณขนาดและการซ้อนทับ (Dynamic Stacking) ---
  const { cardSize, offset, startPos } = useMemo(() => {
    // กำหนดขนาดการ์ดตาม Layout
    // ถ้าเป็นเรา (bottom) ให้ใหญ่หน่อย, คนอื่น (top/left/right) ให้เล็กกว่านิดนึง
    const baseWidth = isSelf ? 120 : 70; 
    
    // สำหรับ Card component: ถ้าแนวตั้ง เราจะอิงความสูงของ card เป็นหลักในการคำนวณ offset
    // แต่ Card component วาดตัวเองเป็น width x height (ratio ~1.35)
    // ดังนั้น:
    // แนวนอน (Top/Bottom): กินพื้นที่แกน X = width
    // แนวตั้ง (Left/Right): กินพื้นที่แกน Y = height = width * 1.35
    
    const itemSize = (layout === "left" || layout === "right") 
      ? Math.round(baseWidth * 1.35) // ความสูงการ์ด
      : baseWidth; // ความกว้างการ์ด

    // พื้นที่ที่ใช้ได้จริง (เผื่อขอบนิดหน่อย)
    const availableSpace = containerSize - 40; 

    // สูตรคำนวณ Offset (ระยะห่างระหว่างใบ)
    // ถ้าไพ่น้อย -> ใช้ระยะห่างปกติ (เช่น 40px)
    // ถ้าไพ่เยอะ -> บีบให้ลงใน availableSpace
    const defaultOffset = isSelf ? 50 : 30;
    const maxTotalSize = (cardCount - 1) * defaultOffset + itemSize;
    
    let finalOffset = defaultOffset;
    if (maxTotalSize > availableSpace) {
      finalOffset = (availableSpace - itemSize) / Math.max(1, cardCount - 1);
    }

    // คำนวณจุดเริ่มต้น (เพื่อให้ไพ่อยู่ตรงกลาง Container)
    const actualTotalSize = (cardCount - 1) * finalOffset + itemSize;
    const start = (containerSize - actualTotalSize) / 2;

    return { cardSize: baseWidth, offset: finalOffset, startPos: start };
  }, [cardCount, containerSize, isSelf, layout]);


  // --- Render ---
  const isVertical = layout === "left" || layout === "right";

  return (
    <div 
      className="relative pointer-events-none" // ป้องกันการกดที่ว่าง (ให้กดได้เฉพาะที่ตัว Card)
      style={{
        width: isVertical ? "140px" : "100%",
        height: isVertical ? "100%" : "160px",
        maxWidth: isVertical ? undefined : `${containerSize}px`,
        maxHeight: isVertical ? `${containerSize}px` : undefined,
        // debug border (เอาออกได้)
        // border: "1px dashed rgba(255,0,0,0.3)" 
      }}
    >
      {cards.map((card, i) => {
        // ตำแหน่ง
        const posValue = startPos + i * offset;
        
        // Z-Index & Interactive Logic
        const isHovered = hoveredIndex === i;
        const isSelected = selectedCards.includes(card.id);
        
        // ถ้าเป็นเรา: Hover/Select แล้วเด้งมาหน้าสุด (500)
        // ถ้าเป็นคนอื่น: เรียงตามลำดับปกติ (100+i) เพราะไม่ต้อง Interactive
        let z = 100 + i;
        if (isSelf && (isHovered || isSelected)) {
          z = 500;
        }

        // Style
        const style = isVertical
          ? { position: "absolute", top: `${posValue}px`, left: "50%", transform: "translateX(-50%)", zIndex: z }
          : { position: "absolute", left: `${posValue}px`, zIndex: z };

        // Animation Class (เฉพาะของตัวเอง)
        let animClass = "transition-all duration-200 ease-out";
        if (isSelf) {
          animClass += " cursor-pointer pointer-events-auto origin-bottom"; // เปิดให้กดได้เฉพาะการ์ดเรา
          if (isSelected) {
            animClass += " -translate-y-12 scale-110 z-[600]";
          } else if (isHovered) {
            animClass += " -translate-y-8 scale-110";
          } else {
            animClass += " translate-y-0 scale-100";
          }
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
            <div className={`
                rounded-xl shadow-lg transition-all duration-200
                ${isSelf && isSelected ? "ring-4 ring-[#FBAF22] shadow-[0_0_15px_rgba(251,175,34,0.6)]" : ""}
            `}>
              <Card 
                card={card} 
                isFaceUp={isSelf} // ของเราหงาย คนอื่นคว่ำ
                width={cardSize}
              />
            </div>
          </div>
        );
      })}
      
      {/* Badge บอกจำนวนไพ่ (สำหรับคนอื่น) */}
      {!isSelf && (
        <div className={`
          absolute z-[200] bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md
          ${isVertical ? "-top-2 right-0" : "-top-2 right-0"}
        `}>
          {cardCount}
        </div>
      )}
    </div>
  );
}
//--> components/PlayerHand.jsx
"use client";
import React, { useMemo, useState } from "react";
import Card from "./Card";

export default function PlayerHand({
  cards = [],
  drawingCard = null,  // 👈 รับไพ่ที่กำลังจั่วเข้ามา
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

        const transformValue = `translateX(${posValue}px)`;

        const style = {
          position: "absolute",
          transform: transformValue,
          zIndex: z,
        };

        let animClass =
          "transition-[transform,filter] duration-300 ease-out origin-bottom";

        let translateY = 0;
        let scale = 100;

        if (isSelf) {
          animClass += " cursor-pointer pointer-events-auto";
          if (isSelected) {
            translateY = -48;
            scale = 110;
          } else if (isHovered) {
            translateY = -32;
            scale = 110;
          }
        }

        style.transform = `${transformValue} translateY(${translateY}px) scale(${scale / 100})`;

        return (
          <div
            key={card.id ?? i}
            style={style}
            className={animClass}
            onMouseEnter={() => isSelf && setHoveredIndex(i)}
            onMouseLeave={() => isSelf && setHoveredIndex(null)}
            onClick={() =>
              isSelf && onCardClick && onCardClick(playerIndex, card)
            }
          >
            {/* White Frame Wrapper */}
            <div
              className={`
              bg-white p-1.5 rounded-xl shadow-lg border border-gray-200
              ${isSelf && isSelected ? "ring-4 ring-[#FBAF22] ring-offset-2" : ""}
            `}
              style={{
                width: `${cardSize}px`,
                height: `${Math.round((cardSize - 12) * 1.4) + 12}px`,
              }}
            >
              <Card card={card} isFaceUp={isSelf} width={cardSize - 12} />
            </div>
          </div>
        );
      })}

      {/* 🎴 ไพ่กำลังบินตอนจั่ว (เฉพาะผู้เล่นเรา) */}
      {isSelf && drawingCard && (
        <div
          style={{
            position: "absolute",
            left: "50%",          // ให้ออกมาจากกลางแนวนอน
            top: "-140px",        // ตำแหน่งกองจั่ว (ปรับเลขได้ตาม UI จริง)
            width: `${cardSize}px`,
            height: `${Math.round((cardSize - 12) * 1.4) + 12}px`,
            zIndex: 9999,
            animation: "fly-to-hand 0.3s ease-out forwards",
            pointerEvents: "none",
          }}
        >
          <div className="bg-white p-1.5 rounded-xl shadow-lg border border-gray-200">
            <Card card={drawingCard} isFaceUp={true} width={cardSize - 12} />
          </div>
        </div>
      )}

      {/* ใส่ keyframes สำหรับอนิเมชัน */}
      <style jsx>{`
        @keyframes fly-to-hand {
          0% {
            transform: translate(-50%, -120px) scale(0.7);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, 40px) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

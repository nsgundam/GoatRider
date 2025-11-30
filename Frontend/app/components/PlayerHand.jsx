// app/components/PlayerHand.jsx
import React, { useMemo } from "react";
import Card from "./Card";

/**
 Props:
  - cards: array
  - isSelf: boolean
  - onCardClick(playerIndex, card)
  - playerIndex: integer
  - layout: 'top'|'left'|'right'|'bottom' (affects stacking direction)
  - containerWidth: number (px)
*/
export default function PlayerHand({
  cards = [],
  isSelf = false,
  onCardClick,
  playerIndex = 0,
  layout = "bottom",
  containerWidth = 800,
}) {
  const cardCount = cards.length;

  const cardWidth = useMemo(() => {
    const max = 140;
    const min = 64;
    const reservedVisible = 24;
    const maxVisible = Math.max(160, containerWidth);
    const w = Math.floor((maxVisible + (cardCount - 1) * reservedVisible) / Math.max(1, cardCount));
    return Math.max(min, Math.min(max, w));
  }, [cardCount, containerWidth]);

  const overlap = Math.round(cardWidth * 0.6);
  const visibleOffset = cardWidth - overlap;

  // render for other players: stacked back cards (horizontal for top / right, vertical for left)
  if (!isSelf) {
    if (layout === "left" || layout === "right") {
      // vertical stack
      return (
        <div className="relative w-full h-[160px] flex items-center">
          <div className="relative w-full h-full overflow-visible">
            {cards.map((c, i) => {
              const top = i * 14;
              const z = 100 + i;
              return (
                <div key={c.id ?? i} style={{ position: "absolute", top: `${top}px`, right: layout === "right" ? 0 : undefined, left: layout === "left" ? 0 : undefined, zIndex: z }}>
                  <div className="transform transition-transform duration-150 hover:-translate-y-2">
                    <Card card={c} isFaceUp={false} width={80} onClick={() => onCardClick && onCardClick(playerIndex, c)} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`absolute ${layout === "right" ? "-right-8" : "-left-8"} -top-5`}>
            <div className="bg-yellow-400 text-xs px-2 py-1 rounded-full shadow-sm">
              {cardCount}
            </div>
          </div>
        </div>
      );
    } else {
      // top / top-center / right-top: horizontal stacked
      return (
        <div className="relative w-full h-[110px]">
          <div className="relative h-full overflow-hidden">
            {cards.map((c, i) => {
              const left = i * (cardWidth * 0.35);
              const z = 100 + i;
              return (
                <div key={c.id ?? i} style={{ position: "absolute", left: `${left}px`, zIndex: z }}>
                  <div className="transform transition-transform duration-150 hover:-translate-y-2">
                    <Card card={c} isFaceUp={false} width={cardWidth} onClick={() => onCardClick && onCardClick(playerIndex, c)} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute -top-6 right-0">
            <div className="bg-yellow-400 text-xs px-2 py-1 rounded shadow-sm">
              {cardCount} cards
            </div>
          </div>
        </div>
      );
    }
  }

  // isSelf: render bottom hand as white rounded slots (face-up)
  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden" style={{ width: "100%" }}>
        <div style={{ height: `${Math.round(cardWidth * 1.35)}px` }} className="relative">
          {cards.map((card, i) => {
            const left = i * Math.max(24, cardWidth * 0.46);
            const z = 200 + i;
            return (
              <div key={card.id ?? `${playerIndex}-${i}`} style={{ position: "absolute", left: `${left}px`, zIndex: z }}>
                <div
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-16px)";
                    e.currentTarget.style.zIndex = 9999;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.zIndex = z;
                  }}
                  className="transition-transform duration-120"
                >
                  <div style={{ width: `${cardWidth}px` }}>
                    {/* white rounded slot style */}
                    <div className="bg-white rounded-2xl shadow-lg p-0 overflow-hidden" style={{ height: `${Math.round(cardWidth * 1.35)}px` }}>
                      <Card card={card} isFaceUp={true} width={cardWidth - 10} onClick={() => onCardClick && onCardClick(playerIndex, card)} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute -top-6 right-4 bg-yellow-400 text-xs px-2 py-1 rounded shadow-sm">
        {cardCount} cards
      </div>
    </div>
  );
}

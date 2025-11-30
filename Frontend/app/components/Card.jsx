"use client";
// app/components/Card.jsx
import React from "react";

/**
 Props:
  - card: object
  - isFaceUp: bool
  - width: number (px)
  - onClick
*/
export default function Card({ card, isFaceUp = true, width = 200, onClick }) {
  const h = Math.round(width * 1.35);
  return (
    <button
      onClick={onClick}
      className="rounded-xl shadow-lg overflow-hidden flex items-center justify-center select-none"
      style={{
        width: `${width}px`,
        height: `${h}px`,
        cursor: onClick ? "pointer" : "default",
        background: isFaceUp ? "linear-gradient(180deg,#eaffd1,#d9f3b8)" : "linear-gradient(180deg,#f0f1f3,#e6e7e9)",
      }}
      aria-label={isFaceUp ? card?.name ?? "card" : "card-back"}
    >
      {isFaceUp ? (
        <div className="text-center px-2">
          <div className="text-sm font-extrabold">{card?.name}</div>
          <div className="text-xs text-gray-600 mt-1">{card?.type}</div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
          Card
        </div>
      )}
    </button>
  );
}

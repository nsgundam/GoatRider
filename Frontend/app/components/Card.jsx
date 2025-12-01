// app/components/Card.jsx
"use client";
import React from "react";

export default function Card({ card, isFaceUp = true, width = 110, onClick }) {
  // คำนวณความสูงตามสัดส่วน (Ratio ~ 1.4)
  const h = Math.round(width * 1.4);

  return (
    <div
      onClick={onClick}
      className="rounded-lg overflow-hidden select-none relative"
      style={{
        width: `${width}px`,
        height: `${h}px`,
        // ถ้าหงาย: สีเขียวอ่อน, ถ้าคว่ำ: สีแดงไล่เฉด (Theme Goat Rider)
        background: isFaceUp 
          ? "linear-gradient(180deg, #eaffd1 0%, #d9f3b8 100%)" 
          : "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)", // สีแดงสวยๆ
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)", // เงาด้านในนิดหน่อย
      }}
    >
      {/* Border เล็กๆ รอบใบไพ่ */}
      <div className="absolute inset-0 border-2 border-black/10 rounded-lg pointer-events-none" />

      {isFaceUp ? (
        <div className="flex flex-col items-center justify-between h-full p-2 text-center">
          {/* Top Corner Rank */}
          <div className="self-start text-xs font-bold opacity-50">{card?.id?.substring(0,2)}</div>
          
          <div>
            <div className="font-extrabold text-gray-800 leading-tight text-sm">
              {card?.name || "Card"}
            </div>
            <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">
              {card?.type}
            </div>
          </div>

          {/* Bottom Corner Rank */}
          <div className="self-end text-xs font-bold opacity-50 transform rotate-180">{card?.id?.substring(0,2)}</div>
        </div>
      ) : (
        // หลังไพ่ (Logo หรือ ลวดลาย)
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center">
             {/* ใส่ Logo ย่อ หรือ Icon แพะ ตรงนี้ได้ */}
             <span className="text-white/40 font-bold text-xs">GR</span>
          </div>
        </div>
      )}
    </div>
  );
}
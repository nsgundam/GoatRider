"use client";
import React from "react";

// 💡 รับ onDrawClick และ deckCount เข้ามา
export default function CentralPile({ topCard, onDrawClick, deckCount = 0 }) { 
  
  // ตรวจสอบว่าคลิกได้หรือไม่ (ถ้า deck เหลือ 0 จะคลิกไม่ได้)
  const isDrawClickable = deckCount > 0 && typeof onDrawClick === 'function';

  return (
    // จัดเรียงกองไพ่ในแนวนอน
    <div className="flex flex-row items-center gap-4"> 
      
      {/* 1. กองไพ่ DRAW (สีขาว) - ตอนนี้สามารถคลิกได้แล้ว */}
      <div 
        className={`w-44 h-56 rounded-2xl shadow-md flex items-center justify-center transition-all duration-150
            ${isDrawClickable 
                ? 'bg-white/90 cursor-pointer hover:bg-white ring-4 ring-transparent hover:ring-yellow-400' 
                : 'bg-gray-300/80 cursor-not-allowed'
            }
        `}
        // 💡 ผูก onClick Event
        onClick={isDrawClickable ? onDrawClick : undefined}
      >
        <div className="text-center">
             {/* แสดงสถานะ Draw */}
            <div className="text-xl font-bold text-gray-700">Draw</div>
            <div className="text-sm text-gray-500 mt-1">({deckCount} left)</div>
        </div>
      </div>

      {/* 2. กองไพ่ DROP / DISCARD (สีแดง) */}
      <div className="relative w-44 h-56">
        {/* Layer 1: เงา/ไพ่ล่าง */}
        <div className="absolute inset-0 bg-red-800 rounded-2xl shadow-lg transform translate-x-1 translate-y-1" />
        {/* Layer 2: ไพ่บนสุด */}
        <div className="absolute inset-0 w-44 h-56 rounded-2xl bg-red-700 shadow-lg flex items-center justify-center">
            {/* แสดงป้าย "Drop" (สำหรับทิ้งไพ่) */}
            <span className="text-white/80 font-bold text-xl">DROP</span> 
        </div>
      </div>
    </div>
  );
}
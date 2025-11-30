// "use client";
// import React from "react";
// // components/PlayerBadge.jsx
// import React from "react";

// /**
//  * Props:
//  *  - name: ชื่อผู้เล่น
//  *  - tokens: จำนวนโทเคน
//  *  - cardCount: จำนวนไพ่ในมือ
//  *  - vertical: true ถ้าเป็นป้ายแนวตั้งข้างจอ
//  */
// export default function PlayerBadge({
//   name = "Pat",
//   tokens = 100,
//   cardCount = 0,
//   vertical = false,
// }) {
//   // แนวนอน (บน/ล่าง) vs แนวตั้ง (ซ้าย/ขวา)
//   if (vertical) {
//     return (
//       <div className="flex flex-col items-center gap-2">
//         <div className="bg-[#ffb449] rounded-[24px] px-3 py-2 shadow-md flex flex-col items-center justify-center">
//           <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black font-bold text-sm">
//             {cardCount}
//           </div>
//           <div className="mt-1 text-[11px] font-semibold text-black rotate-90 origin-center">
//             {name}
//           </div>
//           <div className="mt-1 text-[10px] text-black rotate-90 origin-center">
//             Tokens:{tokens}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // แนวนอน (เหมือนบนหัวกับด้านล่างในภาพ)
//   return (
//     <div className="bg-[#ffb449] rounded-[24px] px-3 py-2 shadow-md flex items-center gap-2">
//       <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black font-bold text-sm">
//         {cardCount}
//       </div>
//       <div className="flex flex-col leading-none">
//         <span className="text-xs font-semibold text-black">{name}</span>
//         <span className="text-[10px] text-black">Tokens:{tokens}</span>
//       </div>
//     </div>
//   );
// }

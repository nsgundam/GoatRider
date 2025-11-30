// "use client";
// import React from "react";
// // components/StealModal.jsx fro cat card steal action
// import React from "react";

// export default function StealModal({ visible, onClose, candidates = [], onPick }) {
//   if (!visible) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
//       <div className="relative bg-white rounded-lg p-4 w-80 shadow-lg">
//         <h3 className="font-semibold mb-2">Choose player to steal from</h3>
//         <div className="flex flex-col gap-2">
//           {candidates.length === 0 && <div className="text-sm text-gray-500">No valid targets</div>}
//           {candidates.map(p => (
//             <button key={p.index} className="p-2 bg-gray-100 rounded" onClick={() => onPick(p.index)}>
//               {p.name} — {p.cardCount} cards
//             </button>
//           ))}
//         </div>
//         <div className="mt-3 text-right">
//           <button className="px-3 py-1 bg-red-500 text-black rounded" onClick={onClose}>Cancel</button>
//         </div>
//       </div>
//     </div>
//   );
// }

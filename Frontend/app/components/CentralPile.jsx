// app/components/CentralPile.jsx
import React from "react";

export default function CentralPile({ topCard }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-44 h-56 rounded-2xl bg-white/90 shadow-md flex items-center justify-center">
        {topCard ? (
          <div className="text-center">
            <div className="font-bold">{topCard.name}</div>
            <div className="text-xs text-gray-600">{topCard.type}</div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Deck</div>
        )}
      </div>

      <div className="w-44 h-56 rounded-2xl bg-red-700 shadow-lg" />
    </div>
  );
}

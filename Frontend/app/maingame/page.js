"use client";

import React, { useEffect, useMemo, useState } from "react";
import { makeSimpleDeck } from "../utils/deck";
import PlayerHand from "../components/PlayerHand";
import CentralPile from "../components/CentralPile";
import StealModal from "../components/StealModal";

const samplePlayers = [
  { id: "p0", name: "You" },
  { id: "p1", name: "Left" },
  { id: "p2", name: "Top" },
  { id: "p3", name: "Right" },
  { id: "p4", name: "TopRight" },
];

export default function MainGame() {
  const [playerCount, setPlayerCount] = useState(4);
  const players = useMemo(() => samplePlayers.slice(0, playerCount), [playerCount]);

  const [deck, setDeck] = useState([]);
  const [hands, setHands] = useState([]);
  const [centralTop, setCentralTop] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [stealModal, setStealModal] = useState(false);

  useEffect(() => {
    const d = makeSimpleDeck();
    const copy = [...d];
    const h = players.map(() => {
      const arr = [];
      for (let i = 0; i < 5; i++) {
        const c = copy.shift();
        if (c) arr.push(c);
      }
      return arr;
    });
    setDeck(copy);
    setHands(h);
    setCentralTop(null);
    setSelectedCard(null);
  }, [playerCount, players]);

  function handleCardClick(playerIndex, card) {
    if (playerIndex !== 0) return;
    setSelectedCard(card);
    if (card.type === "cat") {
      setStealModal(true);
      return;
    }
    setHands(prev => {
      const next = prev.map(a => [...a]);
      const idx = next[0].findIndex(c => c.id === card.id);
      if (idx !== -1) {
        const [played] = next[0].splice(idx, 1);
        setCentralTop(played);
      }
      return next;
    });
  }

  function performSteal(targetIndex) {
    setStealModal(false);
    setHands(prev => {
      const next = prev.map(a => [...a]);
      const target = next[targetIndex];
      if (!target || target.length === 0) return prev;
      const rand = Math.floor(Math.random() * target.length);
      const [stolen] = target.splice(rand, 1);
      const myIdx = next[0].findIndex(c => c.type === "cat");
      if (myIdx !== -1) next[0].splice(myIdx, 1);
      next[0].push(stolen);
      setCentralTop({ id: `played-cat-${Date.now()}`, name: "Cat (played)", type: "cat" });
      return next;
    });
  }

  const stealCandidates = useMemo(() => {
    return players
      .map((p, i) => ({ ...p, index: i, cardCount: hands[i]?.length ?? 0 }))
      .filter(p => p.index !== 0 && p.cardCount > 0);
  }, [players, hands]);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black">
      {/* Background image from /public/bg-demo.jpg */}
      <img
        src="hpspfzupmdw8bh3crszn"
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* dim overlay */}
      <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }} />

      {/* Top players row */}
      <div className="absolute top-6 left-0 right-0 flex justify-between px-12 z-10 pointer-events-none">
        <PlayerBadge position="top-left" name="Pat" number={5} />
        <div className="flex gap-8">
          <PlayerBadge position="top" name="Pat" number={20} />
          <PlayerBadge position="top" name="Pat" number={20} />
        </div>
        <div className="w-36" />
      </div>

      {/* Left vertical player stack */}
      <div className="absolute left-6 top-1/3 transform -translate-y-1/3 flex flex-col gap-6 z-10 pointer-events-none">
        <VerticalBadge number={20} name="Pat" />
      </div>

      {/* Right vertical player stack */}
      <div className="absolute right-6 top-1/3 transform -translate-y-1/3 flex flex-col gap-6 z-10 pointer-events-none">
        <VerticalBadge number={55} name="Pat" />
      </div>

      {/* Center: piles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-20">
        <div className="w-[360px] h-[420px] relative flex items-center gap-8">
          {/* face-up card */}
          <div className="w-40 h-52 rounded-2xl shadow-2xl bg-green-300 flex items-center justify-center transform -translate-x-2 -translate-y-1 z-30">
            <div className="text-center p-3">
              <div className="font-bold text-2xl">Goat</div>
              <div className="text-sm">Rider</div>
            </div>
          </div>

          {/* face-down card */}
          <div className="w-40 h-52 rounded-2xl shadow-lg bg-red-700 z-20" />
        </div>
      </div>

      {/* Center status text (white so visible) */}
      <div className="absolute left-0 right-0 bottom-36 text-center pointer-events-none z-30">
        <div className="text-white font-bold text-xl">Your turn</div>
        <div className="text-white/80">Time left 15 sec</div>
      </div>

      {/* Bottom player hand (4 slots + badge) */}
      <div className="absolute left-0 right-0 bottom-6 px-10 flex items-end justify-between z-30">
        <div className="flex items-center gap-6">
          <PlayerBadge position="bottom-left" name="Pat" number={15} />
        </div>

        <div className="flex gap-6 items-end">
          {/* 4 card slots */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-44 h-28 rounded-2xl bg-white shadow-inner border border-black/5"
            />
          ))}
        </div>

        {/* How to play button */}
        <div className="flex items-center gap-4">
          <button className="bg-red-700 text-black px-6 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-transform">
            how to play
          </button>
        </div>
      </div>

      <StealModal visible={stealModal} onClose={() => setStealModal(false)} candidates={stealCandidates} onPick={performSteal} />
    </div>
  );
}

/* --- small presentational components --- */

function PlayerBadge({ position = "top", name = "Player", number = 20 }) {
  return (
    <div className="flex items-center gap-4 select-none">
      <div className="w-28 h-14 rounded-full bg-orange-300 flex items-center justify-between px-3 shadow-md">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold">
          {number}
        </div>
        <div className="text-sm text-black/80">
          <div className="font-semibold">{name}</div>
          <div className="text-[10px]">Tokens:100</div>
        </div>
      </div>
    </div>
  );
}

function VerticalBadge({ number = 20, name = "Pat" }) {
  return (
    <div className="w-20 h-48 bg-amber-200 rounded-xl shadow-md flex items-center justify-center">
      <div className="transform -rotate-90 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold">
          {number}
        </div>
        <div className="text-xs">{name}</div>
      </div>
    </div>
  );
}

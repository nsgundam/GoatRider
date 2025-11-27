"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { Button } from "@/app/components/button";

export default function LobbyPage() {
  const router = useRouter();
  const search = useSearchParams();

  // read values that come from Menu (via query params)
  const qRoomId = search?.get("roomId") ?? "";
  const qUserName = search?.get("userName") ?? "";
  const qAvatar = search?.get("avatar") ?? ""; // cloudinary id
  const qToken = Number(search?.get("token") ?? search?.get("tokens") ?? 0);
  const qCost = Number(search?.get("cost") ?? 10);
  const qPlayers = search?.get("players") ?? ""; // optional comma list of names or "Name|avatar|token"

  // frontend-only / UI state
  const [roomId, setRoomId] = useState(qRoomId || "");
  // costPerPlayer now a mutable state initialized from qCost (host should send this)
  const [costPerPlayer, setCostPerPlayer] = useState(qCost);
  const [currentUserId] = useState(() => {
    // simple id generation if no user provided
    return qUserName ? qUserName.toLowerCase().replace(/\s+/g, "_") : "you";
  });

  // players state: build from query params (menu must pass initial players if multiplayer)
  const buildInitialPlayers = () => {
    // if menu passed a players csv, use it
    // CSV format supported: "Name" or "Name|avatarId" or "Name|avatarId|token"
    if (qPlayers) {
      const raw = qPlayers.split(",").map(s => s.trim()).filter(Boolean).slice(0, 5);
      return raw.map((entry, i) => {
        const parts = entry.split("|").map(s => s.trim());
        const name = parts[0] || `Player${i + 1}`;
        const avatar = parts[1] || null;
        const token = parts[2] ? Number(parts[2]) : 100;
        return {
          id: name.toLowerCase().replace(/\s+/g, "_") || `p${i + 1}`,
          name,
          ready: false,
          token,
          isHost: i === 0, // first one is host by convention
          avatar,
        };
      });
    }

    // If no qPlayers provided, only include current user (no mock placeholders)
    const me = {
      id: currentUserId,
      name: qUserName || "You",
      ready: false,
      token: qToken || 100,
      isHost: true,
      avatar: qAvatar || null
    };
    return [me];
  };

  const [players, setPlayers] = useState(buildInitialPlayers);
  const maxPlayers = 5;

  useEffect(() => {
    // sync roomId if menu changed it via query param
    if (qRoomId) setRoomId(qRoomId);
    // if host changed cost in menu and navigated to lobby, reflect it
    if (typeof qCost === "number" && !isNaN(qCost)) setCostPerPlayer(qCost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qRoomId, qCost]);

  const everyoneReady = players.length >= 2 && players.every(p => p.ready);
  const isHost = players.some(p => p.id === currentUserId && p.isHost);

  function toggleReady(playerId) {
    // frontend local toggle only
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ready: !p.ready } : p));
  }

  function startGame() {
    if (!everyoneReady) return;

    const insufficient = players.find(p => p.token < costPerPlayer);
    if (insufficient) {
      console.warn(`Player ${insufficient.name} does not have enough tokens (${insufficient.token}) to pay ${costPerPlayer}.`);
      return;
    }

    const updated = players.map(p => ({ ...p, token: Math.max(0, p.token - costPerPlayer) }));
    setPlayers(updated);

    router.push(`/maingame?room=${encodeURIComponent(roomId)}`);
  }

  // UI helpers
  const cardBase = "bg-white/95 rounded-2xl transition-all duration-200 border-2 border-black";
  const cardShadow = "shadow-[0_6px_0_#a52424] hover:shadow-[0_8px_0_#7d1c1c]";
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      {/* BACKGROUND: ครอบเต็ม viewport แน่นอน */}
      <div className="absolute inset-0">
        <CldImage
          src="hugl4hmvs5foaw8fdizk"
          width={1920}
          height={1080}
          className="absolute inset-0 w-screen h-screen object-cover"
          alt="bg"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* CONTENT area (scrollable ifสูงเกิน) */}
      <div className="relative z-10 w-full h-full overflow-auto">
        <div className="max-w-[1700px] mx-auto h-full flex items-center pt-10 pb-10">
          <div className="grid grid-cols-12 gap-6 items-start w-full">

            {/* LEFT PANEL */}
            <div className="col-span-12 lg:col-span-5 p-8 bg-white/40 backdrop-blur-sm rounded-3xl border-l-4 border-black/80 mx-6">
              <div className="mb-8 flex justify-center">
                <text className="text-[90px] font-bold text-white drop-shadow-[0_6px_0_#a52424]">HAVE FUN!</text>
              </div>

              {/* Room id row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-xl text-gray-800 font-semibold">ROOM ID</div>
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-full border-2 border-black bg-white/90 text-black text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-400"
                />

                <div className="text-xl text-gray-700 text-right">
                  <div className="text-[13px]">Cost / player</div>
                  <div className="text-xl font-semibold">{costPerPlayer} tokens</div>
                </div>
              </div>

              {/* Players list */}
              <div className="space-y-3 mb-4">
                {players.map(p => (
                  <div key={p.id} className={`${cardBase} ${cardShadow} flex items-center justify-between p-3`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gray-800/80 flex items-center justify-center text-black font-bold shrink-0 border-2 border-black" />
                      <div className="min-w-0">
                        <div className="text-sm  text-gray-500 font-semibold">{p.name}{p.isHost ? " 👑" : ""}</div>
                        <div className="text-xs text-gray-500">Tokens:{p.token}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {p.ready ? (
                        <div className="px-3 py-2 text-sm rounded-full bg-green-500 text-white font-bold">✓ Ready</div>
                      ) : (
                        <div className="text-sm text-gray-500">Not ready</div>
                      )}

                      {/* ready button for current user */}
                      {p.id === currentUserId && (
                        <button
                          onClick={() => toggleReady(p.id)}
                          className={`px-4 py-2 rounded-full font-bold text-white ${p.ready ? 
                            "bg-red-400 hover:bg-red-500 text-black" : "bg-red-600 hover:bg-red-700"}`}
                        >
                          {p.ready ? "UNREADY" : "READY"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* empty slots */}
                {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, i) => (
                  <div key={i} className={`${cardBase} ${cardShadow} flex items-center justify-between p-3
                   bg-white/30 border-dashed border-2 border-black/30 text-gray-400`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-black/20" />
                      <div>
                        <div className="text-sm">Waiting for player</div>
                        <div className="text-xs text-gray-400">Slot available</div>
                      </div>
                    </div>
                    <div className="text-sm">-</div>
                  </div>
                ))}
              </div>

              {/* bottom row: players count + start */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-black">
                  Players: <span className="font-bold">{players.length} / {maxPlayers}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push("/menu")}
                    className="p-2 rounded-md bg-white/80 border-2 border-black hover:bg-[#FBAF22] transition"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18l-6-6 6-6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" h/>
                    </svg>
                  </button>


                  {isHost ? (
                    <Button
                      onClick={startGame}
                      disabled={!everyoneReady}
                      className={`px-4 py-2 font-bold rounded-full ${everyoneReady ? "bg-red-600 hover:bg-red-700 text-white shadow-[0_6px_0_#7d1c1c]" : "bg-gray-400 text-black cursor-not-allowed"}`}
                    >
                      start Game
                    </Button>
                  ) : (
                    <div className="text-sm text-white italic">Waiting for host</div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: keep it simple (no extra full-screen image to avoid seams) */}
            <div className="col-span-12 lg:col-span-7 rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
              <div className="relative z-10 h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { Button } from "@/app/components/button";

export default function LobbyPage() {
  const router = useRouter();

  const [roomId] = useState("AB123");
  const [costPerPlayer] = useState(10);
  const [currentUserId] = useState("host1");
  const [players, setPlayers] = useState([
    { id: "host1", name: "PAT", ready: false, token: 100, isHost: true },
    { id: "p2", name: "NANYA", ready: false, token: 55, isHost: false },
    { id: "p3", name: "NS", ready: false, token: 20, isHost: false },
  ]);

  const maxPlayers = 5;
  const everyoneReady = players.length >= 2 && players.every(p => p.ready);
  const isHost = players.some(p => p.id === currentUserId && p.isHost);

  function toggleReady(playerId) {
    setPlayers(prev =>
      prev.map(p =>
        p.id === playerId ? { ...p, ready: !p.ready } : p
      )
    );
  }

  function startGame() {
    if (!everyoneReady) return;
    router.push(`/maingame?room=${roomId}`);
  }
  //--------------------------------------------------------------------------------------
  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0 opacity-25">
        <CldImage
          src="hugl4hmvs5foaw8fdizk"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          alt="background"
        />
      </div>
      {/*-------------------------------------------------------------------------------------- */}
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/45"></div>
      {/* centered game name/logo */}
      <div className="absolute inset-x-3 top-1 flex  px-45  z-10 pointer-events-none">
        <div className="w-[1200px] max-w-[90%]">
          <CldImage
            src="namegamegoat"
            width={900}
            height={300}
            className="w-full h-auto object-contain"
            alt="game logo"
          />
        </div>
      </div>
      {/*-------------------------------------------------------------------------------------- */}

      {/* content: push down so logo has space */}
      <div className="relative z-20 pt-80 p-6 max-w-5xl mx-auto text-gray-500 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left side: Player list */}
        <div className="lg:col-span-2">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-gray-300">ROOM ID</div>
              <div className="text-2xl font-extrabold text-white">{roomId}</div>
              <div className="text-sm text-gray-300 mt-1">Players: <span className="font-semibold text-white">{players.length} / {maxPlayers}</span></div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-300">Cost / player</div>
              <div className="text-lg font-semibold text-white">{costPerPlayer} tokens</div>
            </div>
          </div>
          {/*-------------------------------------------------------------------------------------- */}
          {/* Player table */}
          <div className="space-y-3">
            {players.map(player => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 
                 bg-white/95 rounded-2xl 
                 shadow-[0_6px_0_#a52424] 
                 hover:shadow-[0_8px_0_#efb100] 
                transition-all duration-200"
              >

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-yellow-300 flex items-center justify-center font-bold">
                    {player.name[0]}
                  </div>

                  <div>
                    <p className="font-semibold">{player.name}{player.isHost ? " 👑" : ""}</p>
                    <p className="text-xs text-gray-500">Tokens: {player.token}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {player.ready ? (
                    <span className="text-green-600 font-bold">✓ Ready</span>
                  ) : (
                    <span className="text-gray-500">Not ready</span>
                  )}

                  {player.id === currentUserId && (
                    <Button
                      onClick={() => toggleReady(player.id)}
                      className={`px-3 py-2 text-sm rounded-full ${player.ready
                          ? "bg-green-500 hover:bg-green-600 text-black"
                          : "bg-yellow-500 hover:bg-yellow-600 text-black"
                        }`}
                    >
                      {player.ready ? "Unready" : "Ready"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {/*-------------------------------------------------------------------------------------- */}
            {/* empty slots */}
            {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 p-3 bg-white/40 rounded-lg border border-dashed border-white/20 text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10" />
                  <div>
                    <div className="text-sm">Waiting for player</div>
                    <div className="text-xs text-gray-400">Slot available</div>
                  </div>
                </div>
                <div className="text-sm">—</div>
              </div>
            ))}
          </div>
          {/*-------------------------------------------------------------------------------------- */}
          {/* Start game button */}
          <div className="mt-6 flex justify-end">
            {isHost ? (
              <Button
                onClick={startGame}
                disabled={!everyoneReady}
                className={`px-4 py-2 font-bold ${everyoneReady
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-400 text-black cursor-not-allowed"
                  }`}
              >
                Start Game
              </Button>
            ) : (
              <p className="text-gray-200 italic">Waiting for host…</p>
            )}
          </div>

        </div>
        {/*-------------------------------------------------------------------------------------- */}
        {/* Right column: How to play */}
        <div className="space-y-4">
          <div className="bg-white/95 p-4 rounded-xl shadow-md">
            <h2 className="text-sm font-semibold text-gray-700">HOW TO PLAY</h2>
            <ol className="mt-2 text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>กด Ready เมื่อพร้อม</li>
              <li>เมื่อทุกคน Ready → Host กด Start</li>
              <li>ระบบจะหัก {costPerPlayer} Tokens / คน</li>
              <li>ทุกคนเข้าสู่หน้าเกมพร้อมกัน</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}

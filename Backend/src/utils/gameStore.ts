// src/utils/gameStore.ts

// 1. ประเภทของการ์ดทั้งหมดในเกม
export type CardType = 
  | "attack" 
  | "skip" 
  | "shuffle" 
  | "see_future" 
  | "defuse" 
  | "explode" 
  | "cat_1" 
  | "cat_2" 
  | "cat_3" 
  | "cat_4" 
  | "cat_5";

// 2. โครงสร้างข้อมูลของผู้เล่นในเกม
export interface GamePlayer {
    walletAddress: string;
    username: string; // เก็บชื่อไว้โชว์ด้วย จะได้ไม่ต้อง query บ่อย
    hand: CardType[]; // การ์ดในมือ
    isAlive: boolean; // ยังรอดอยู่ไหม
    socketId?: string; // เก็บ Socket ID เพื่อส่งข้อมูลส่วนตัว
}

// 3. โครงสร้างข้อมูลของ "1 ห้องเกม"
export interface GameState {
    roomId: string;
    players: GamePlayer[];
    deck: CardType[];        // กองจั่ว (Array ของการ์ด)
    discardPile: CardType[]; // กองทิ้ง
    turnIndex: number;       // ตอนนี้ตาใคร (Index ของ array players)
    turnDirection: 1 | -1;   // 1 = ตามเข็ม, -1 = ทวนเข็ม (เผื่อมีการ์ด Reverse)
    attackTurns: number;     // จำนวนเทิร์นที่ต้องเล่น (ปกติ 1, โดน Attack จะเพิ่ม)
    gameStatus: "WAITING" | "PLAYING" | "ENDED";
    winner?: string;         // Wallet ของผู้ชนะ
}

// 4. ตัวแปร Global เก็บทุกห้องไว้ใน Memory
// Key = roomId, Value = GameState
export const games: Record<string, GameState> = {};

// --- Helper Functions ---

export const getGame = (roomId: string) => games[roomId];

export const setGame = (roomId: string, state: GameState) => {
    games[roomId] = state;
};

export const deleteGame = (roomId: string) => {
    delete games[roomId];
};
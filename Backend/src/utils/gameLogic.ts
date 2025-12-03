// src/utils/gameLogic.ts
import { CardType, GamePlayer } from './gameStore';

// การ์ดพื้นฐาน (ไม่รวม Defuse และ Explode)
const BASE_DECK_TEMPLATE: CardType[] = [
    "attack", "attack", "attack", "attack",
    "skip", "skip", "skip", "skip",
    "shuffle", "shuffle", "shuffle", "shuffle",
    "see_future", "see_future", "see_future", "see_future",
    "see_future",
    "cat_1", "cat_1", "cat_1", "cat_1",
    "cat_2", "cat_2", "cat_2", "cat_2",
    "cat_3", "cat_3", "cat_3", "cat_3",
    "cat_4", "cat_4", "cat_4", "cat_4",
    "cat_5", "cat_5", "cat_5", "cat_5",
];

// ฟังก์ชันสับไพ่ (Fisher-Yates Shuffle Algorithm)
// เป็นอัลกอริทึมมาตรฐานโลกสำหรับการสุ่มที่ยุติธรรม
export const shuffleDeck = (deck: CardType[]): CardType[] => {
    return deck.sort(() => Math.random() - 0.5);
};

// ฟังก์ชันเริ่มเกม (แจกไพ่ + สร้างกองจั่ว)
export const initializeGame = (playersData: { wallet: string, username: string, socketId: string }[]) => {
    // 1. เตรียมกองกลางเริ่มต้น
    let deck = [...BASE_DECK_TEMPLATE];
    deck = shuffleDeck(deck);

    // 2. สร้าง Object ผู้เล่น และแจก Defuse คนละ 1 ใบ + การ์ดสุ่ม 4 ใบ
    const players: GamePlayer[] = playersData.map(p => ({
        walletAddress: p.wallet,
        username: p.username,
        socketId: p.socketId,
        isAlive: true,
        hand: ["defuse"] // ได้ Defuse การันตี 1 ใบ
    }));

    // แจกการ์ดเพิ่มคนละ 4 ใบ
    players.forEach(player => {
        for (let i = 0; i < 4; i++) {
            const card = deck.pop();
            if (card) player.hand.push(card);
        }
    });

    // 3. ใส่ระเบิด (Explode) และ Defuse ที่เหลือกลับเข้ากอง
    // กฎ: จำนวนระเบิด = จำนวนผู้เล่น - 1 (เพื่อให้เหลือผู้ชนะ 1 คนเสมอ)
    const bombCount = players.length - 1;
    for (let i = 0; i < bombCount; i++) {
        deck.push("explode");
    }
    
    // (Optional) ใส่ Defuse เพิ่มเข้าไปอีก 1-2 ใบในกองเผื่อคนดวงดีจั่วได้
    deck.push("defuse");

    // 4. สับกองครั้งสุดท้าย (ที่มีระเบิดแล้ว)
    deck = shuffleDeck(deck);

    return { deck, players };
};
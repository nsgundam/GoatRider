// src/sockets/gameHandler.ts
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { setGame } from '../utils/gameStore';
import { initializeGame } from '../utils/gameLogic';

const prisma = new PrismaClient();

export const gameHandler = (io: Server, socket: Socket) => {

    // ✅ รับคำสั่ง Start Game ตรงนี้
    socket.on('start_game', async ({ roomId }) => {
        try {
            console.log(`🎮 Start Game Requested: ${roomId}`);

            // 1. ดึงข้อมูลผู้เล่น
            const playersDB = await prisma.playerRoomState.findMany({
                where: { roomId },
                include: { user: true },
                orderBy: { walletAddress: 'asc' }
            });

            // (Optional) เช็คจำนวนคน
            if (playersDB.length < 1) return; // แก้เป็น 2 ถ้าต้องการบังคับ

            // 2. เตรียมข้อมูลเกม
            const playersData = playersDB.map(p => ({
                wallet: p.walletAddress,
                username: p.user.username,
                socketId: "" 
            }));

        
            // 3. สับไพ่
            const { deck, players } = initializeGame(playersData);

            // 4. เก็บสถานะเกมเข้า Memory
            setGame(roomId, {
                roomId,
                players,
                deck,
                discardPile: [],
                turnIndex: 0,
                turnDirection: 1,
                attackTurns: 1,
                gameStatus: 'PLAYING'
            });

            // 5. อัปเดต DB
            await prisma.room.update({
                where: { roomId },
                data: { status: 'IN_GAME' }
            });

            // 6. 🚀 ส่งสัญญาณ Game Started (Frontend จะ Redirect ตอนนี้)
            io.to(roomId).emit('game_started', { timestamp: Date.now() });

            // 7. แจกไพ่เข้ามือ
            players.forEach(p => {
                io.to(roomId).emit('update_hand', {
                    walletAddress: p.walletAddress,
                    hand: p.hand
                });
            });

            // 8. บอกตาเริ่ม
            io.to(roomId).emit('turn_change', {
                currentTurnWallet: players[0]?.walletAddress,
                timeLeft: 30
            });

        } catch (error) {
            console.error("Start Game Error:", error);
        }
    });

    // ==========================================
    // 🃏 DRAW CARD Logic
    // ==========================================
    socket.on('draw_card', ({ roomId, walletAddress }) => { // รับ walletAddress มาด้วย
        const game = getGame(roomId);
        if (!game || game.gameStatus !== 'PLAYING') return;

        const currentPlayer = game.players[game.turnIndex];

        // 1. Validation: ใช่ตาของคนนี้ไหม?
        if (currentPlayer.walletAddress !== walletAddress) {
            socket.emit('error', 'Not your turn!');
            return;
        }

        // 2. จั่วไพ่ใบแรกจากกอง (Pop)
        const drawnCard = game.deck.pop();

        if (!drawnCard) {
            // กองหมด (ไม่น่าเกิดขึ้นในแมวระเบิด ถ้า Logic ถูก)
            return;
        }

        console.log(`🃏 ${currentPlayer.username} drew: ${drawnCard}`);

        // แจ้งทุกคนว่ามีการจั่ว (Animation ไพ่บิน)
        io.to(roomId).emit('player_action', {
            username: currentPlayer.username,
            action: 'DRAW_CARD',
            card: null // ไม่บอกคนอื่นว่าได้ไพ่อะไร (ความลับ)
        });

        // ==========================================
        // 💣 กรณี: จั่วได้ระเบิด (EXPLODE)
        // ==========================================
        if (drawnCard === 'explode') {
            const hasDefuse = currentPlayer.hand.includes('defuse');

            if (hasDefuse) {
                // ✅ รอด: มี Defuse
                console.log(`😅 ${currentPlayer.username} defused the bomb!`);
                
                // หัก Defuse ออกจากมือ
                const defuseIndex = currentPlayer.hand.indexOf('defuse');
                currentPlayer.hand.splice(defuseIndex, 1);

                // ส่งไพ่คืนกอง (Logic แบบง่าย: ใส่กลับไปสุ่มๆ หรือบนสุด)
                // ของจริงต้องให้ User เลือกตำแหน่ง แต่ตอนนี้เอาแบบ Random Index ไปก่อน
                const randomIndex = Math.floor(Math.random() * (game.deck.length + 1));
                game.deck.splice(randomIndex, 0, 'explode');

                io.to(roomId).emit('game_log', `${currentPlayer.username} defused a Bomb! 💣🔧`);
                
                // อัปเดตมือเจ้าตัว (Defuse หายไป)
                io.to(roomId).emit('update_hand', {
                    walletAddress: currentPlayer.walletAddress,
                    hand: currentPlayer.hand
                });

            } else {
                // 💥 ตาย: ไม่มี Defuse
                console.log(`💀 ${currentPlayer.username} exploded!`);
                currentPlayer.isAlive = false;
                
                io.to(roomId).emit('game_log', `${currentPlayer.username} EXPLODED! 💥💀`);
                io.to(roomId).emit('player_exploded', { walletAddress: currentPlayer.walletAddress });

                // เช็คว่าจบเกมหรือยัง (เหลือผู้รอดชีวิตคนเดียว)
                const survivors = game.players.filter(p => p.isAlive);
                if (survivors.length === 1) {
                    const winner = survivors[0];
                    endGame(io, roomId, winner.walletAddress);
                    return;
                }
            }
        } 
        // ==========================================
        // 🛡️ กรณี: ได้ไพ่ปลอดภัย (Safe Card)
        // ==========================================
        else {
            // เก็บเข้ามือ
            currentPlayer.hand.push(drawnCard);
            
            // อัปเดตมือเจ้าตัว
            io.to(roomId).emit('update_hand', {
                walletAddress: currentPlayer.walletAddress,
                hand: currentPlayer.hand
            });
        }

        // ==========================================
        // 🔄 จบเทิร์น (Next Turn Logic)
        // ==========================================
        // ถ้าตาย หรือ จั่วไพ่ปลอดภัย -> เปลี่ยนตา
        // (ถ้า Defuse ได้ ปกติก็เปลี่ยนตา หรือตามกฎคือต้องจั่วให้ครบ Attack turn)
        
        // ลดจำนวนตาที่ต้องเล่น (กรณีโดน Attack)
        game.attackTurns--;

        if (game.attackTurns <= 0) {
            // เปลี่ยนคนเล่นถัดไป
            game.attackTurns = 1; // รีเซ็ต
            advanceTurn(game);
        }

        // อัปเดตสถานะล่าสุดให้ทุกคน
        const nextPlayer = game.players[game.turnIndex];
        io.to(roomId).emit('turn_change', {
            currentTurnWallet: nextPlayer.walletAddress,
            timeLeft: 30
        });
    });
};

// --- Helper Functions ---

function advanceTurn(game: GameState) {
    let nextIndex = game.turnIndex;
    
    // วนหาคนถัดไปที่ยังรอดชีวิต (isAlive = true)
    do {
        nextIndex = (nextIndex + game.turnDirection + game.players.length) % game.players.length;
    } while (!game.players[nextIndex].isAlive && nextIndex !== game.turnIndex);

    game.turnIndex = nextIndex;
}

function endGame(io: Server, roomId: string, winnerAddress: string) {
    console.log(`🏆 GAME OVER! Winner: ${winnerAddress}`);
    
    io.to(roomId).emit('game_over', { winner: winnerAddress });
    
    // TODO: เรียก Blockchain Service เพื่อจ่ายเงินรางวัลที่นี่
    // import { payoutWinner } from '../services/blockchainService';
    // payoutWinner(roomId, winnerAddress);

    deleteGame(roomId); // ลบเกมออกจาก Memory


};
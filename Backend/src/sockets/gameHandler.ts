import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { setGame, getGame, deleteGame, GameState } from '../utils/gameStore';
import { initializeGame } from '../utils/gameLogic';
import { payoutWinner } from '../services/blockchainService';

const prisma = new PrismaClient();

export const gameHandler = (io: Server, socket: Socket) => {

    // ==========================================
    // 🎮 START GAME
    // ==========================================
    socket.on('start_game', async ({ roomId }) => {
        try {
            console.log(`🎮 Start Game Requested: ${roomId}`);

            const playersDB = await prisma.playerRoomState.findMany({
                where: { roomId },
                include: { user: true },
                orderBy: { walletAddress: 'asc' }
            });

            if (playersDB.length < 1) {
                 console.warn("⚠️ Warning: Starting with < 2 players.");
                 // return; // Uncomment ถ้าจะบังคับ 2 คน
            }

            const playersData = playersDB.map(p => ({
                wallet: p.walletAddress,
                username: p.user.username,
                socketId: "" 
            }));

            const { deck, players } = initializeGame(playersData);

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

            await prisma.room.update({
                where: { roomId },
                data: { status: 'IN_GAME' }
            });

            io.to(roomId).emit('game_started', { timestamp: Date.now() });

            players.forEach(p => {
                io.to(roomId).emit('update_hand', {
                    walletAddress: p.walletAddress,
                    hand: p.hand
                });
            });

            // ✅ FIX: เช็คว่า players[0] มีจริงไหมก่อนส่ง
            const firstPlayer = players[0];
            if (firstPlayer) {
                io.to(roomId).emit('turn_change', {
                    currentTurnWallet: firstPlayer.walletAddress,
                    timeLeft: 30
                });
            }

        } catch (error) {
            console.error("Start Game Error:", error);
        }
    });

    // ==========================================
    // 🔄 SYNC STATE
    // ==========================================
    socket.on('request_game_state', ({ roomId, walletAddress }) => {
        const game = getGame(roomId);
        if (!game) return;

        const player = game.players.find(p => p.walletAddress === walletAddress);
        if (!player) return;

        socket.emit('update_hand', {
            walletAddress: player.walletAddress,
            hand: player.hand
        });

        // ✅ FIX: เช็ค currentPlayer ก่อนใช้
        const currentPlayer = game.players[game.turnIndex];
        if (currentPlayer) {
            socket.emit('turn_change', {
                currentTurnWallet: currentPlayer.walletAddress,
                timeLeft: 30
            });
        }
    });

    // ==========================================
    // 💥 PLAY CARD
    // ==========================================
    // ==========================================
    // 💥 PLAY CARD (รองรับ Multi-Card + Cat Logic)
    // ==========================================
    socket.on('play_card', ({ roomId, walletAddress, cards, targetWallet, wantedCard }) => {
        // ** cards รับมาเป็น Array: ['cat_1', 'cat_1']
        const game = getGame(roomId);
        if (!game || game.gameStatus !== 'PLAYING') return;

        const currentPlayer = game.players[game.turnIndex];
        if (!currentPlayer) return;

        if (currentPlayer.walletAddress !== walletAddress) {
            socket.emit('error', 'Not your turn!');
            return;
        }

        // 1. ตรวจสอบไพ่ในมือ
        const cardToPlay = cards[0]; // ใช้ใบแรกเป็นตัวกำหนดประเภท (เพราะต้องเหมือนกัน)
        // Check ว่ามีไพ่ครบจริงไหม
        const hasCards = cards.every((c: any) => currentPlayer.hand.includes(c));
        if (!hasCards) return;

        console.log(`💥 ${currentPlayer.username} played: ${cards.join(', ')}`);

        // 2. ลบไพ่ออก (Remove played cards)
        cards.forEach((c: any) => {
            const idx = currentPlayer.hand.indexOf(c);
            if (idx > -1) currentPlayer.hand.splice(idx, 1);
            game.discardPile.push(c);
        });

        // Broadcast การเล่น
        io.to(roomId).emit('update_hand', { walletAddress: currentPlayer.walletAddress, hand: currentPlayer.hand });
        io.to(roomId).emit('player_action', { username: currentPlayer.username, action: `PLAYED ${cards.length > 1 ? 'COMBO' : cardToPlay}` });

        // 3. Process Effects
        if (cards.length === 1) {
            // --- Single Card Action ---
            switch (cardToPlay) {
                case 'skip':
                    game.attackTurns--;
                    if (game.attackTurns <= 0) {
                        game.attackTurns = 1;
                        advanceTurn(game);
                    }
                    io.to(roomId).emit('game_log', `${currentPlayer.username} used SKIP! ⏭️`);
                    break;
                case 'attack':
                    io.to(roomId).emit('game_log', `${currentPlayer.username} ATTACKED next player! ⚔️`);
                    advanceTurn(game);
                    game.attackTurns = 2; // Next person takes 2 turns
                    break;
                case 'shuffle':
                    game.deck.sort(() => Math.random() - 0.5);
                    io.to(roomId).emit('game_log', 'Deck Shuffled! 🔀');
                    break;
                case 'see_future':
                    const top3 = game.deck.slice(-3).reverse();
                    socket.emit('game_log', `Future: ${top3.join(', ')} 👁️`);
                    break;
                default:
                    // ถ้าเล่นไพ่แมวใบเดียว = ไม่มีผล (เสียเปล่า)
                    if (cardToPlay.startsWith('cat')) {
                        io.to(roomId).emit('game_log', `${currentPlayer.username} wasted a Cat card...`);
                    }
                    break;
            }
        } else if (cards.length === 2 && cardToPlay.startsWith('cat')) {
            // --- 2 Cats (Random Steal) ---
            if (targetWallet) {
                const targetPlayer = game.players.find(p => p.walletAddress === targetWallet);
                if (targetPlayer && targetPlayer.hand.length > 0) {
                    const randomIdx = Math.floor(Math.random() * targetPlayer.hand.length);
                    const stolenCard = targetPlayer.hand.splice(randomIdx, 1)[0];
                    currentPlayer.hand.push(stolenCard);

                    io.to(roomId).emit('game_log', `${currentPlayer.username} stole a card from ${targetPlayer.username}! 🦝`);
                    // Update hands
                    io.to(roomId).emit('update_hand', { walletAddress: currentPlayer.walletAddress, hand: currentPlayer.hand });
                    io.to(roomId).emit('update_hand', { walletAddress: targetPlayer.walletAddress, hand: targetPlayer.hand });
                } else {
                    io.to(roomId).emit('game_log', `Target has no cards to steal!`);
                }
            }
        } else if (cards.length === 3 && cardToPlay.startsWith('cat')) {
            // --- 3 Cats (Named Steal) ---
            if (targetWallet && wantedCard) {
                const targetPlayer = game.players.find(p => p.walletAddress === targetWallet);
                if (targetPlayer) {
                    const idx = targetPlayer.hand.findIndex(c => c === wantedCard);
                    if (idx > -1) {
                        // เจอ! ขโมยมาเลย
                        const stolenCard = targetPlayer.hand.splice(idx, 1)[0];
                        currentPlayer.hand.push(stolenCard);
                        io.to(roomId).emit('game_log', `${currentPlayer.username} stole ${wantedCard} from ${targetPlayer.username}! 🎯`);
                    } else {
                        // ไม่เจอ! หน้าแหก
                        io.to(roomId).emit('game_log', `${currentPlayer.username} tried to find ${wantedCard} but failed! ❌`);
                    }
                    // Update hands
                    io.to(roomId).emit('update_hand', { walletAddress: currentPlayer.walletAddress, hand: currentPlayer.hand });
                    io.to(roomId).emit('update_hand', { walletAddress: targetPlayer.walletAddress, hand: targetPlayer.hand });
                }
            }
        }

        // Update Turn (ยกเว้นเล่น Attack/Skip ที่จัดการ Turn ไปแล้ว)
        if (cardToPlay !== 'skip' && cardToPlay !== 'attack') {
        } else {
             const nextPlayer = game.players[game.turnIndex];
             if(nextPlayer) {
                io.to(roomId).emit('turn_change', { currentTurnWallet: nextPlayer.walletAddress, timeLeft: 30 });
             }
        }
        
    });


    // ==========================================
    // 🃏 DRAW CARD
    // ==========================================
    socket.on('draw_card', ({ roomId, walletAddress }) => {
        const game = getGame(roomId);
        if (!game || game.gameStatus !== 'PLAYING') return;

        // ✅ FIX: เช็ค currentPlayer
        const currentPlayer = game.players[game.turnIndex];
        if (!currentPlayer) return;

        if (currentPlayer.walletAddress !== walletAddress) return;

        const drawnCard = game.deck.pop();
        if (!drawnCard) return;

        console.log(`🃏 ${currentPlayer.username} drew a card`);
        
        io.to(roomId).emit('player_action', {
            username: currentPlayer.username,
            action: 'DRAW_CARD'
        });

        if (drawnCard === 'explode') {
            const hasDefuse = currentPlayer.hand.includes('defuse');

            if (hasDefuse) {
                // รอด
                console.log(`😅 ${currentPlayer.username} defused!`);
                const defuseIndex = currentPlayer.hand.indexOf('defuse');
                if (defuseIndex > -1) currentPlayer.hand.splice(defuseIndex, 1);

                const randomIndex = Math.floor(Math.random() * (game.deck.length + 1));
                game.deck.splice(randomIndex, 0, 'explode');

                io.to(roomId).emit('game_log', `${currentPlayer.username} defused a Bomb! 💣🔧`);
                
                io.to(roomId).emit('update_hand', {
                    walletAddress: currentPlayer.walletAddress,
                    hand: currentPlayer.hand
                });

                game.attackTurns--;

            } else {
                // ตาย
                console.log(`💀 ${currentPlayer.username} exploded!`);
                currentPlayer.isAlive = false;
                
                io.to(roomId).emit('game_log', `${currentPlayer.username} EXPLODED! 💥💀`);
                io.to(roomId).emit('player_exploded', { walletAddress: currentPlayer.walletAddress });

                const survivors = game.players.filter(p => p.isAlive);
                if (survivors.length === 1) {
                    // ✅ FIX: เช็ค survivors[0] ก่อนใช้
                    const winner = survivors[0];
                    if (winner) endGame(io, roomId, winner.walletAddress);
                    return;
                }
                
                game.attackTurns = 0; 
            }
        } else {
            // ไพ่ปกติ
            currentPlayer.hand.push(drawnCard);
            io.to(roomId).emit('update_hand', {
                walletAddress: currentPlayer.walletAddress,
                hand: currentPlayer.hand
            });
            game.attackTurns--;
        }

        if (game.attackTurns <= 0) {
            game.attackTurns = 1;
            advanceTurn(game);
        }

        // ✅ FIX: เช็ค nextPlayer
        const nextPlayer = game.players[game.turnIndex];
        if (nextPlayer) {
            io.to(roomId).emit('turn_change', {
                currentTurnWallet: nextPlayer.walletAddress,
                timeLeft: 30
            });
        }
    });
};

// --- Helper Functions ---

function advanceTurn(game: GameState) {
    let nextIndex = game.turnIndex;
    let attempts = 0;
    
    do {
        // ขยับ Index ไปคนถัดไป
        nextIndex = (nextIndex + game.turnDirection + game.players.length) % game.players.length;
        attempts++;

        // ดึงตัวผู้เล่นออกมาเช็คก่อน
        const nextPlayer = game.players[nextIndex];

        // ถ้าเจอผู้เล่น และผู้เล่น "ยังรอดชีวิต" (isAlive = true) -> ให้หยุดวนลูป (เจอคนเล่นแล้ว)
        if (nextPlayer && nextPlayer.isAlive) {
            break;
        }

    // วนลูปต่อไปถ้ายังหาคนเป็นไม่เจอ และยังวนไม่ครบทุกคน
    } while (attempts < game.players.length);

    // อัปเดต Turn
    game.turnIndex = nextIndex;
}

async function endGame(io: Server, roomId: string, winnerAddress: string) {
    console.log(`🏆 GAME OVER! Winner: ${winnerAddress}`);
    
    // แจ้ง Frontend ก่อน
    io.to(roomId).emit('game_over', { winner: winnerAddress });

    // สั่งโอนเงินรางวัล 80% ผ่าน Blockchain
    try {
        await payoutWinner(roomId, winnerAddress);
        console.log(`💰 Reward distributed for Room ${roomId}`);
    } catch (err) {
        console.error(`❌ Failed to distribute reward:`, err);
        // อาจจะต้องมีระบบ log ลง DB ว่าจ่ายไม่สำเร็จเพื่อมา retry ทีหลัง
    }

    // อัปเดต DB ว่าจบเกม
    try {
        await prisma.room.update({
            where: { roomId },
            data: { status: 'FINISHED' }
        });
    } catch(e) { console.error(e); }

    deleteGame(roomId); 
}
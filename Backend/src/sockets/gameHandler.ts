import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { setGame, getGame, deleteGame, GameState } from '../utils/gameStore';
import { initializeGame } from '../utils/gameLogic';

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
    socket.on('play_card', ({ roomId, walletAddress, card }) => {
        const game = getGame(roomId);
        if (!game || game.gameStatus !== 'PLAYING') return;

        // ✅ FIX: เช็ค currentPlayer
        const currentPlayer = game.players[game.turnIndex];
        if (!currentPlayer) return;

        // 1. Validation
        if (currentPlayer.walletAddress !== walletAddress) {
            socket.emit('error', 'Not your turn!');
            return;
        }

        const cardIndex = currentPlayer.hand.indexOf(card);
        if (cardIndex === -1) return; 

        console.log(`💥 ${currentPlayer.username} played: ${card}`);

        // 2. ลบไพ่ออก
        currentPlayer.hand.splice(cardIndex, 1);
        game.discardPile.push(card);

        io.to(roomId).emit('update_hand', {
            walletAddress: currentPlayer.walletAddress,
            hand: currentPlayer.hand
        });

        io.to(roomId).emit('player_action', {
            username: currentPlayer.username,
            action: `PLAYED ${card}`
        });

        // 3. Process Effect
        switch (card) {
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
                game.attackTurns = 2; 
                break;

            case 'shuffle':
                game.deck = game.deck.sort(() => Math.random() - 0.5);
                io.to(roomId).emit('game_log', 'Deck Shuffled! 🔀');
                break;

            case 'see_future':
                const top3 = game.deck.slice(-3).reverse();
                socket.emit('game_log', `Future: ${top3.join(', ')} 👁️`);
                break;
            
            default: 
                if (card.startsWith('cat')) {
                     io.to(roomId).emit('game_log', `${currentPlayer.username} played a Cat card (need pair to steal!)`);
                }
                break;
        }

        // ✅ FIX: เช็ค nextPlayer ก่อนส่ง turn_change
        const nextPlayer = game.players[game.turnIndex];
        if (nextPlayer) {
            io.to(roomId).emit('turn_change', {
                currentTurnWallet: nextPlayer.walletAddress,
                timeLeft: 30
            });
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

function endGame(io: Server, roomId: string, winnerAddress: string) {
    console.log(`🏆 GAME OVER! Winner: ${winnerAddress}`);
    io.to(roomId).emit('game_over', { winner: winnerAddress });
    deleteGame(roomId); 
}
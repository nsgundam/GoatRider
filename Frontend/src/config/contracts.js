import TokenABI from './TokenABI.json';
import GamePoolABI from './GamePoolABI.json';

export const CONTRACTS = {
  TOKEN: {
    ADDRESS: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS, 
    ABI: TokenABI,
  },
  GAME_POOL: {
    ADDRESS: process.env.NEXT_PUBLIC_GAME_POOL_ADDRESS,
    ABI: GamePoolABI,
  },
};
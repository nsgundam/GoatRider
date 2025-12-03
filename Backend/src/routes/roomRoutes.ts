import { Router } from 'express';
import { createRoom, getRoom } from '../controllers/roomController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/room
router.get('/:roomId', getRoom); 

// POST /api/rooms 
router.post('/', authenticateToken, createRoom);

export default router;
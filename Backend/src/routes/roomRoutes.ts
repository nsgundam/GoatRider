// src/routes/roomRoutes.ts
import { Router } from 'express';
import { createRoom, getRooms } from '../controllers/roomController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/rooms 
router.get('/', getRooms);

// POST /api/rooms 
router.post('/', authenticateToken, createRoom);

export default router;
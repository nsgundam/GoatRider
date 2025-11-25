// src/routes/roomRoutes.ts
import { Router } from 'express';
import { createRoom, getRooms, mockPayment } from '../controllers/roomController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/rooms 
router.get('/', getRooms);

// POST /api/rooms 
router.post('/', authenticateToken, createRoom);

router.post('/test-pay', mockPayment); // เอาไว้เทส

export default router;
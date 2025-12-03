import { Router } from 'express';
import { getUserProfile } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/user/me
router.get('/me', authenticateToken, getUserProfile);

export default router;
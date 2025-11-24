// src/routes/authRoutes.ts
import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

// POST http://localhost:3001/api/auth/login
router.post('/login', login);

export default router;
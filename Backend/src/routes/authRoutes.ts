import { Router } from 'express';
import { login, register } from '../controllers/authController'; // import register เพิ่ม

const router = Router();

// POST http://localhost:3001/api/auth/login
router.post('/login', login);

// POST http://localhost:3001/api/auth/register
router.post('/register', register);

export default router;
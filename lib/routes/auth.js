import express from 'express';
import { login, register, me } from '../controllers/auth_controller.js';
import { requireAuth } from '../middleware/auth.js';
import { withErrorHandling } from './utils.js';

const router = express.Router();

router.post('/register', withErrorHandling(register));
router.post('/login', withErrorHandling(login));
router.get('/me', requireAuth, withErrorHandling(me));

export default router;

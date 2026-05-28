import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getProfile, updateProfile, getOrderHistory } from '../controllers/user.controller.js';

const router = Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/history', verifyToken, getOrderHistory);

export default router;

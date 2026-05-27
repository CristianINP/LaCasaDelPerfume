import { Router } from 'express';
import { getProductos } from '../controllers/productos.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/productos', verifyToken, getProductos);

export default router;

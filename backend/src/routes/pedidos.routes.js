import { Router } from 'express';
import { getHistorialUsuario, getPedidoById } from '../controllers/pedidos.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/pedidos/historial', verifyToken, getHistorialUsuario);
router.get('/pedidos/:id', verifyToken, getPedidoById);

export default router;

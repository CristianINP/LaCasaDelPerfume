import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import {
  getInventario,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  activarProducto,
} from '../controllers/inventario.controller.js';

const router = Router();

router.get('/', verifyToken, verifyAdmin, getInventario);
router.post('/', verifyToken, verifyAdmin, crearProducto);
router.put('/:id', verifyToken, verifyAdmin, actualizarProducto);
router.patch('/:id/desactivar', verifyToken, verifyAdmin, desactivarProducto);
router.patch('/:id/activar', verifyToken, verifyAdmin, activarProducto);

export default router;

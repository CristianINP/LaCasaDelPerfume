import { Router } from 'express';
import { getPedidos, getPedidoById, getPedidoDetalles, guardarPedido } from '../controllers/pedidos.controller.js';

const router = Router();

router.get('/pedidos/todos', getPedidos);
router.get('/pedidos/:id', getPedidoById);
router.get('/pedidos/:id/detalles', getPedidoDetalles);
router.post('/pedidos/guardar-compra', guardarPedido);

export default router;

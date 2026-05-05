import express from 'express';
import cors from 'cors';
import ProductosRoutes from './routes/productos.routes.js';
import PedidosRoutes from './routes/pedidos.routes.js';
import PaypalRoutes from './routes/paypal.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', ProductosRoutes);
app.use('/api', PedidosRoutes);
app.use('/api/paypal', PaypalRoutes);

export default app;

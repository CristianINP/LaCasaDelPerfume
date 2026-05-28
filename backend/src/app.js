import express from 'express';
import cors from 'cors';
import ProductosRoutes from './routes/productos.routes.js';
import PedidosRoutes from './routes/pedidos.routes.js';
import PaypalRoutes from './routes/paypal.routes.js';
import TicketsRoutes from './routes/tickets.routes.js';
import AuthRoutes from './routes/auth.routes.js';
import UserRoutes from './routes/user.routes.js';
import InventarioRoutes from './routes/inventario.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', ProductosRoutes);
app.use('/api', PedidosRoutes);
app.use('/api/paypal', PaypalRoutes);
app.use('/api/tickets', TicketsRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/inventario', InventarioRoutes);

export default app;

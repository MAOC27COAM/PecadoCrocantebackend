import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/error.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import deliveryRouter from './routes/delivery.js';
import kdsRouter from './routes/kds.js';
import webhooksRouter from './routes/webhooks.js';
import { orderEvents, OrderEvent } from './events/orderEvents.js';
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
app.use(cors());
app.use(express.json());
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/kds', kdsRouter);
app.use('/webhooks', webhooksRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use(errorHandler);
io.on('connection', (socket) => {
    console.log('KDS conectado:', socket.id);
    socket.on('disconnect', () => console.log('KDS desconectado:', socket.id));
});
orderEvents.on(OrderEvent.CREATED, (data) => io.emit(OrderEvent.CREATED, data));
orderEvents.on(OrderEvent.STATUS_CHANGED, (data) => io.emit(OrderEvent.STATUS_CHANGED, data));
const PORT = parseInt(process.env.PORT || '3000');
server.listen(PORT, () => {
    console.log(`Backend Pecado Crocante corriendo en puerto ${PORT}`);
});
export default app;

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendMessage } from '../services/whatsapp.js';
import { orderEvents, OrderEvent } from '../events/orderEvents.js';
const router = Router();
router.get('/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const expected = process.env.WHATSAPP_VERIFY_TOKEN || 'pecado123';
    if (mode === 'subscribe' && token === expected) {
        res.status(200).send(challenge);
    }
    else {
        res.sendStatus(403);
    }
});
router.post('/whatsapp', async (req, res) => {
    try {
        const entry = req.body?.entry?.[0];
        const change = entry?.changes?.[0];
        const msg = change?.value?.messages?.[0];
        if (msg?.type === 'text') {
            const celular = msg.from;
            const texto = msg.text.body.toLowerCase();
            const usuario = await prisma.usuario.findUnique({ where: { celular } });
            if (!usuario) {
                res.sendStatus(200);
                return;
            }
            const pedidoPendiente = await prisma.pedido.findFirst({
                where: { usuarioId: usuario.id, estado: 'PENDIENTE' },
                orderBy: { createdAt: 'desc' },
            });
            if (pedidoPendiente && (texto.includes('confirmar') || texto.includes('si') || texto.includes('pedido'))) {
                const updated = await prisma.pedido.update({
                    where: { id: pedidoPendiente.id },
                    data: { estado: 'CONFIRMADO' },
                    include: { usuario: true },
                });
                orderEvents.emit(OrderEvent.STATUS_CHANGED, updated);
                await sendMessage(celular, `✅ Pedido *${pedidoPendiente.id.slice(0, 8)}* confirmado! Tiempo estimado: ${pedidoPendiente.tiempoEstimado} min 🍗`);
            }
        }
        res.sendStatus(200);
    }
    catch {
        res.sendStatus(200);
    }
});
export default router;

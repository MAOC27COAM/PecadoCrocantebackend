import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { createOrder, DeliveryZoneError } from '../services/order.js';
import { orderEvents, OrderEvent } from '../events/orderEvents.js';
import { sendMessage } from '../services/whatsapp.js';

const router = Router();

const createSchema = z.object({
  nombre: z.string().min(2),
  celular: z.string().min(9),
  latitud: z.number().min(-90).max(90),
  longitud: z.number().min(-180).max(180),
  productos: z.array(z.object({
    productoId: z.string().uuid(),
    cantidad: z.number().int().min(1),
  })).min(1),
});

const statusSchema = z.object({
  estado: z.enum(['PENDIENTE', 'CONFIRMADO', 'EN_COCINA', 'EN_RUTA', 'ENTREGADO', 'CANCELADO']),
});

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const result = await createOrder(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    if (e instanceof DeliveryZoneError) {
      res.status(403).json({
        error: e.message,
        distanciaKm: e.distanceKm,
        radioKm: e.radiusKm,
      });
      return;
    }
    if (e.message === 'Fuera del radio de entrega') {
      res.status(403).json({ error: e.message });
      return;
    }
    next(e);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: { detalle: { include: { producto: true } }, usuario: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(pedidos);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: req.params.id },
      include: { detalle: { include: { producto: true } }, usuario: true },
    });
    if (!pedido) { res.status(404).json({ error: 'Pedido no encontrado' }); return; }
    res.json(pedido);
  } catch (e) { next(e); }
});

router.patch('/:id/status', validate(statusSchema), async (req, res, next) => {
  try {
    const pedido = await prisma.pedido.update({
      where: { id: req.params.id },
      data: { estado: req.body.estado },
      include: { detalle: { include: { producto: true } }, usuario: true },
    });

    orderEvents.emit(OrderEvent.STATUS_CHANGED, pedido);

    const mensajes: Record<string, string> = {
      CONFIRMADO: `¡Pedido *${pedido.id.slice(0, 8)}* confirmado! Tiempo estimado: ${pedido.tiempoEstimado} min.`,
      EN_COCINA: `¡Tu pedido *${pedido.id.slice(0, 8)}* ya esta EN COCINA!`,
      EN_RUTA: `🔥 ¡Tu pedido *${pedido.id.slice(0, 8)}* esta EN RUTA!`,
      ENTREGADO: `✅ Pedido *${pedido.id.slice(0, 8)}* entregado. ¡Gracias por preferir Pecado Crocante!`,
    };

    if (mensajes[pedido.estado]) {
      sendMessage(pedido.usuario.celular, mensajes[pedido.estado]);
    }

    res.json(pedido);
  } catch (e) { next(e); }
});

export default router;

import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { orderEvents, OrderEvent } from '../events/orderEvents.js';
import { getSaturation } from '../services/saturation.js';

const router = Router();

function getJornadaStart(date: Date): Date {
  const start = new Date(date);
  if (start.getHours() < 12) {
    start.setDate(start.getDate() - 1);
  }
  start.setHours(12, 0, 0, 0);
  return start;
}

function formatJornadaLabel(inicio: Date): string {
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
  const ini = inicio.toLocaleDateString('es', opts);
  const finStr = fin.toLocaleDateString('es', opts);
  return `${ini} 12pm → ${finStr} 12pm`;
}

router.get('/orders', async (_req, res, next) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { estado: { not: 'ENTREGADO' } },
      include: { detalle: { include: { producto: true } }, usuario: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(pedidos);
  } catch (e) { next(e); }
});

router.get('/history', async (req, res, next) => {
  try {
    const days = Math.max(1, parseInt(req.query.days as string) || 7);
    const now = new Date();
    const currentJornadaStart = getJornadaStart(now);
    const earliestStart = new Date(currentJornadaStart);
    earliestStart.setDate(earliestStart.getDate() - (days - 1));

    const pedidos = await prisma.pedido.findMany({
      where: {
        estado: 'ENTREGADO',
        updatedAt: { gte: earliestStart },
      },
      include: { detalle: { include: { producto: true } }, usuario: true },
      orderBy: { updatedAt: 'desc' },
    });

    const jornadaMap = new Map<string, typeof pedidos>();
    for (const pedido of pedidos) {
      const key = getJornadaStart(pedido.updatedAt).toISOString();
      if (!jornadaMap.has(key)) {
        jornadaMap.set(key, []);
      }
      jornadaMap.get(key)!.push(pedido);
    }

    const jornadas = Array.from(jornadaMap.entries())
      .map(([key, items]) => {
        const inicio = new Date(key);
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 1);
        fin.setHours(11, 59, 59, 999);
        return {
          inicio: inicio.toISOString(),
          fin: fin.toISOString(),
          etiqueta: formatJornadaLabel(inicio),
          totalPedidos: items.length,
          totalGanancia: Number(items.reduce((sum, p) => sum + Number(p.total), 0).toFixed(2)),
          pedidos: items.map(p => ({
            id: p.id,
            usuario: p.usuario,
            total: Number(p.total),
            updatedAt: p.updatedAt.toISOString(),
            createdAt: p.createdAt.toISOString(),
            detalle: p.detalle,
          })),
        };
      })
      .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());

    const resumenGeneral = {
      totalPedidos: jornadas.reduce((sum, j) => sum + j.totalPedidos, 0),
      totalGanancia: Number(jornadas.reduce((sum, j) => sum + j.totalGanancia, 0).toFixed(2)),
    };

    res.json({ jornadas, resumenGeneral });
  } catch (e) { next(e); }
});

router.get('/saturation', async (_req, res, next) => {
  try {
    const sat = await getSaturation();
    res.json(sat);
  } catch (e) { next(e); }
});

router.get('/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const onCreated = (data: any) => {
    res.write(`event: ${OrderEvent.CREATED}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  const onStatus = (data: any) => {
    res.write(`event: ${OrderEvent.STATUS_CHANGED}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  orderEvents.on(OrderEvent.CREATED, onCreated);
  orderEvents.on(OrderEvent.STATUS_CHANGED, onStatus);

  req.on('close', () => {
    orderEvents.off(OrderEvent.CREATED, onCreated);
    orderEvents.off(OrderEvent.STATUS_CHANGED, onStatus);
  });
});

export default router;

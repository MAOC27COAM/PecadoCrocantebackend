import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(productos);
  } catch (e) { next(e); }
});

export default router;

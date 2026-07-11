import { prisma } from '../lib/prisma.js';
import type { SaturationResult } from '../types/index.js';

export async function getSaturation(): Promise<SaturationResult> {
  const pedidosEnCocina = await prisma.pedido.count({
    where: { estado: { in: ['CONFIRMADO', 'EN_COCINA'] } },
  });

  let nivel: SaturationResult['nivel'] = 'bajo';
  let tiempoExtraMin = 0;

  if (pedidosEnCocina >= 8) {
    nivel = 'alto';
    tiempoExtraMin = 12;
  } else if (pedidosEnCocina >= 4) {
    nivel = 'medio';
    tiempoExtraMin = 5;
  }

  return { nivel, pedidosEnCocina, tiempoExtraMin };
}

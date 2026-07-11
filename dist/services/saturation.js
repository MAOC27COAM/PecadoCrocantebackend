import { prisma } from '../lib/prisma.js';
export async function getSaturation() {
    const pedidosEnCocina = await prisma.pedido.count({
        where: { estado: { in: ['CONFIRMADO', 'EN_COCINA'] } },
    });
    let nivel = 'bajo';
    let tiempoExtraMin = 0;
    if (pedidosEnCocina >= 8) {
        nivel = 'alto';
        tiempoExtraMin = 12;
    }
    else if (pedidosEnCocina >= 4) {
        nivel = 'medio';
        tiempoExtraMin = 5;
    }
    return { nivel, pedidosEnCocina, tiempoExtraMin };
}

import { prisma } from '../lib/prisma.js';
import { isWithinDeliveryZone, calculateDelivery, getDistanceToStore, getDeliveryZoneConfig } from './distance.js';
import { getSaturation } from './saturation.js';
import { orderEvents, OrderEvent } from '../events/orderEvents.js';
export class DeliveryZoneError extends Error {
    distanceKm;
    radiusKm;
    constructor(distanceKm, radiusKm) {
        super('Fuera del radio de entrega');
        this.name = 'DeliveryZoneError';
        this.distanceKm = distanceKm;
        this.radiusKm = radiusKm;
    }
}
export async function createOrder(input) {
    if (!isWithinDeliveryZone(input.latitud, input.longitud)) {
        const distanceKm = Math.round(getDistanceToStore(input.latitud, input.longitud) * 100) / 100;
        const { radiusKm } = getDeliveryZoneConfig();
        throw new DeliveryZoneError(distanceKm, radiusKm);
    }
    const sat = await getSaturation();
    const delivery = await calculateDelivery(input.latitud, input.longitud, sat.tiempoExtraMin);
    let usuario = await prisma.usuario.findUnique({ where: { celular: input.celular } });
    if (!usuario) {
        usuario = await prisma.usuario.create({
            data: {
                nombre: input.nombre,
                celular: input.celular,
                latitud: input.latitud,
                longitud: input.longitud,
            },
        });
    }
    else {
        usuario = await prisma.usuario.update({
            where: { id: usuario.id },
            data: { latitud: input.latitud, longitud: input.longitud },
        });
    }
    const ids = input.productos.map((p) => p.productoId);
    const productos = await prisma.producto.findMany({ where: { id: { in: ids }, activo: true } });
    const productoMap = new Map(productos.map((p) => [p.id, p]));
    let total = 0;
    const detalleData = input.productos.map((p) => {
        const prod = productoMap.get(p.productoId);
        if (!prod)
            throw new Error(`Producto ${p.productoId} no encontrado o inactivo`);
        const subtotal = Number(prod.precio) * p.cantidad;
        total += subtotal;
        return {
            productoId: p.productoId,
            cantidad: p.cantidad,
            precioUnitario: prod.precio,
        };
    });
    const pedido = await prisma.pedido.create({
        data: {
            usuarioId: usuario.id,
            estado: 'CONFIRMADO',
            total,
            tiempoEstimado: delivery.tiempoMin,
            detalle: { create: detalleData },
        },
        include: { detalle: { include: { producto: true } }, usuario: true },
    });
    orderEvents.emit(OrderEvent.CREATED, pedido);
    return {
        success: true,
        pedidoId: pedido.id,
        mensaje: "Pedido recibido, en breve lo contactamos con su pecado",
        tiempoEstimado: delivery.tiempoMin,
        distancia: delivery.distanciaKm,
    };
}

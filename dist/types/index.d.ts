import type { EstadoPedido } from '@prisma/client';
export interface CreateOrderInput {
    nombre: string;
    celular: string;
    latitud: number;
    longitud: number;
    productos: {
        productoId: string;
        cantidad: number;
    }[];
}
export interface UpdateStatusInput {
    estado: EstadoPedido;
}
export interface DistanceResult {
    distanciaKm: number;
    tiempoMin: number;
}
export interface SaturationResult {
    nivel: 'bajo' | 'medio' | 'alto';
    pedidosEnCocina: number;
    tiempoExtraMin: number;
}

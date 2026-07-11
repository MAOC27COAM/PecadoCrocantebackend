import type { CreateOrderInput } from '../types/index.js';
export declare class DeliveryZoneError extends Error {
    distanceKm: number;
    radiusKm: number;
    constructor(distanceKm: number, radiusKm: number);
}
export declare function createOrder(input: CreateOrderInput): Promise<{
    success: boolean;
    pedidoId: string;
    mensaje: string;
    tiempoEstimado: number;
    distancia: number;
}>;

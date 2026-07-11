import type { DistanceResult } from '../types/index.js';
export declare function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
export declare function isWithinDeliveryZone(lat: number, lng: number): boolean;
export declare function getDeliveryZoneConfig(): {
    storeLat: number;
    storeLng: number;
    radiusKm: number;
};
export declare function getDistanceToStore(lat: number, lng: number): number;
export declare function calculateDelivery(lat: number, lng: number, satMin: number): Promise<DistanceResult>;

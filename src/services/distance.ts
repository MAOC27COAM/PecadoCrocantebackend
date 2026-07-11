import type { DistanceResult } from '../types/index.js';

const STORE_LAT = parseFloat(process.env.STORE_LAT || '-13.1631');
const STORE_LNG = parseFloat(process.env.STORE_LNG || '-72.5450');
const DELIVERY_RADIUS = parseFloat(process.env.DELIVERY_RADIUS_KM || '3');

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinDeliveryZone(lat: number, lng: number): boolean {
  const dist = haversineDistance(lat, lng, STORE_LAT, STORE_LNG);
  return dist <= DELIVERY_RADIUS;
}

export function getDeliveryZoneConfig() {
  return {
    storeLat: STORE_LAT,
    storeLng: STORE_LNG,
    radiusKm: DELIVERY_RADIUS,
  };
}

export function getDistanceToStore(lat: number, lng: number): number {
  return haversineDistance(lat, lng, STORE_LAT, STORE_LNG);
}

export async function calculateDelivery(lat: number, lng: number, satMin: number): Promise<DistanceResult> {
  const dist = getDistanceToStore(lat, lng);
  const tiempoBase = Math.ceil(dist * 5 + 8);
  const tiempoMin = tiempoBase + satMin;

  return { distanciaKm: Math.round(dist * 100) / 100, tiempoMin };
}

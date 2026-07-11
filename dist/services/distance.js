const STORE_LAT = parseFloat(process.env.STORE_LAT || '-13.656400500215916');
const STORE_LNG = parseFloat(process.env.STORE_LNG || '-73.38997826136861');
const DELIVERY_RADIUS = parseFloat(process.env.DELIVERY_RADIUS_KM || '30000');
function toRad(deg) {
    return (deg * Math.PI) / 180;
}
export function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function isWithinDeliveryZone(lat, lng) {
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
export function getDistanceToStore(lat, lng) {
    return haversineDistance(lat, lng, STORE_LAT, STORE_LNG);
}
export async function calculateDelivery(lat, lng, satMin) {
    const dist = getDistanceToStore(lat, lng);
    const tiempoBase = Math.ceil(dist * 5 + 8);
    const tiempoMin = tiempoBase + satMin;
    return { distanciaKm: Math.round(dist * 100) / 100, tiempoMin };
}

const EARTH_RADIUS_KM = 6371;

const toRadians = (value) => (Number(value) * Math.PI) / 180;

export const calculateHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const p1 = Number(lat1);
  const p2 = Number(lat2);
  const l1 = Number(lon1);
  const l2 = Number(lon2);

  if (![p1, p2, l1, l2].every((value) => Number.isFinite(value))) {
    return NaN;
  }

  const deltaLat = toRadians(p2 - p1);
  const deltaLon = toRadians(l2 - l1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(p1)) * Math.cos(toRadians(p2)) * Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export const isWithinDeliveryZone = (
  customerLat,
  customerLon,
  restaurantLat,
  restaurantLon,
  radiusKm
) => {
  const distanceKm = calculateHaversineDistanceKm(
    customerLat,
    customerLon,
    restaurantLat,
    restaurantLon
  );
  const maxRadiusKm = Number(radiusKm);

  if (!Number.isFinite(distanceKm) || !Number.isFinite(maxRadiusKm)) {
    return {
      withinZone: false,
      distanceKm: NaN,
    };
  }

  return {
    withinZone: distanceKm <= maxRadiusKm,
    distanceKm,
  };
};


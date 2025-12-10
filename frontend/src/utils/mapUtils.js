// Functions for map coordinates, distance, etc.

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

export function getFloodRiskColor(level) {
  switch (level.toLowerCase()) {
    case "low":
      return "#00ff99";
    case "medium":
      return "#ffdd00";
    case "high":
      return "#ff3300";
    case "critical":
      return "#990000";
    default:
      return "#cccccc";
  }
}

export function latLonToPoint(lat, lon) {
  return { x: lon, y: lat };
}

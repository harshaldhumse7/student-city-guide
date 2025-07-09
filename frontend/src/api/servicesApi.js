export async function fetchNearbyServices(lat, lng, radiusMeters, type) {
  const response = await fetch('http://localhost:5000/api/services');
  const data = await response.json();

  return data.filter((service) => {
    const distance = getDistanceFromLatLonInKm(lat, lng, service.lat, service.lng);
    const withinRadius = distance * 1000 <= radiusMeters;
    const matchesType = type === 'all' || service.type === type;
    return withinRadius && matchesType;
  });
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

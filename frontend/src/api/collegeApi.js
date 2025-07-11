const API_BASE_URL = "http://localhost:5000";

export async function fetchNearbyColleges(lat, lng) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/colleges`);
    if (!response.ok) {
      throw new Error("Failed to fetch colleges");
    }

    const data = await response.json();

    if (!lat || !lng) return [];

    return data.filter((college) => {
      if (!college.lat || !college.lon) return false;
      const distance = getDistanceFromLatLonInKm(lat, lng, college.lat, college.lon);
      return distance <= 5;
    });
  } catch (error) {
    console.error("Error in fetchNearbyColleges:", error);
    return [];
  }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
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

export async function fetchNearbyColleges(lat, lng) {
  const response = await fetch('http://localhost:5000/api/colleges');
  const data = await response.json();

  // Optionally filter based on lat/lng
  return data.filter((college) => {
    const distance = getDistanceFromLatLonInKm(lat, lng, college.lat, college.lon);
    return distance <= 5; // return within 5 km
  });
}

// Utility function to calculate distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

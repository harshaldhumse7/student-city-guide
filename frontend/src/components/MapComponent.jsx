import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { fetchNearbyColleges } from '../api/collegeApi';
import { fetchNearbyServices } from '../api/servicesApi';
import { FaBed, FaUtensils, FaTshirt, FaPencilRuler, FaStar } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const typeIcons = {
  pg: <FaBed className="inline mr-1" />,
  food: <FaUtensils className="inline mr-1" />,
  laundry: <FaTshirt className="inline mr-1" />,
  stationery: <FaPencilRuler className="inline mr-1" />,
};

// Component to recenter map
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

function MapComponent({ center, userLocation }) {
  const [nearbyColleges, setNearbyColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedType, setSelectedType] = useState('all');

  // Fetch nearby colleges based on user location
  useEffect(() => {
    if (userLocation) {
      fetchNearbyColleges(userLocation.lat, userLocation.lng)
        .then(setNearbyColleges)
        .catch(console.error);
    }
  }, [userLocation]);

  // Fetch services based on selected college or user location
  useEffect(() => {
    const radiusMeters = 2500;
    const origin = selectedCollege || userLocation;

    if (!origin) {
      setFilteredServices([]);
      return;
    }

    const lat = origin.lat;
    const lng = origin.lng || origin.lon;

    fetchNearbyServices(lat, lng, radiusMeters, selectedType)
      .then(setFilteredServices)
      .catch((err) => {
        console.error('Error fetching services:', err);
        setFilteredServices([]);
      });
  }, [selectedCollege, selectedType, userLocation]);

  // Handle college selection from dropdown
  const handleCollegeChange = useCallback((e) => {
    const value = e.target.value;
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.lat && (parsed.lng || parsed.lon)) {
          setSelectedCollege(parsed);
        }
      } catch {
        setSelectedCollege(null);
      }
    } else {
      setSelectedCollege(null);
    }
  }, []);

  const mapCenter = selectedCollege
    ? [selectedCollege.lat, selectedCollege.lng || selectedCollege.lon]
    : [userLocation?.lat, userLocation?.lng];

  return (
    <div>
      {/* College Dropdown */}
      {nearbyColleges.length > 0 && (
        <div className="p-4 bg-white rounded shadow mb-4">
          <label className="mr-2 font-semibold">Select a nearby college:</label>
          <select onChange={handleCollegeChange} className="border px-3 py-1 rounded">
            <option value="">-- Select --</option>
            {nearbyColleges.map((college, index) => (
              <option key={index} value={JSON.stringify(college)}>
                {college.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Service Type Filter */}
      {(selectedCollege || userLocation) && (
        <div className="p-4 bg-white rounded shadow mb-4">
          <label className="mr-2 font-semibold">Filter by service type:</label>
          <select
            onChange={(e) => setSelectedType(e.target.value)}
            className="border px-3 py-1 rounded"
            value={selectedType}
          >
            <option value="all">All</option>
            <option value="pg">PG</option>
            <option value="food">Food</option>
            <option value="laundry">Laundry</option>
            <option value="stationery">Stationery</option>
          </select>
        </div>
      )}

      {/* Map Section */}
      <div className="map-container" style={{ height: '500px', width: '100%' }}>
        <MapContainer center={mapCenter} zoom={14} scrollWheelZoom>
          <RecenterMap center={mapCenter} />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* College Marker */}
          {selectedCollege && (
            <Marker position={[selectedCollege.lat, selectedCollege.lng || selectedCollege.lon]}>
              <Popup>{selectedCollege.name}</Popup>
            </Marker>
          )}

          {/* Service Markers */}
          {filteredServices.map((service) => (
            <Marker key={service.id} position={[service.lat, service.lng]}>
              <Popup>
                <strong>{service.name}</strong>
                <br />
                Type: {typeIcons[service.type]} {service.type}
                <br />
                Contact: {service.contact}
                <br />
                Rating:{' '}
                {Array.from({ length: service.rating }, (_, i) => (
                  <FaStar key={i} className="inline text-yellow-400" />
                ))}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Info Footer */}
      {(selectedCollege || userLocation) && (
        <p className="text-gray-600 mt-2">
          Showing <strong>{selectedType === 'all' ? 'all' : selectedType}</strong> services near{' '}
          <strong>{selectedCollege?.name || 'your location'}</strong> (within 2.5 km)
        </p>
      )}

      {/* No Services Fallback */}
      {(selectedCollege || userLocation) && filteredServices.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No services found for selected filters.
        </p>
      )}
    </div>
  );
}

export default MapComponent;

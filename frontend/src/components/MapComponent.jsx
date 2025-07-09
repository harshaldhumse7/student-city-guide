import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { fetchNearbyColleges } from '../api/collegeApi';
import { fetchNearbyServices } from '../api/servicesApi';
import { FaBed, FaUtensils, FaTshirt, FaPencilRuler, FaStar } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Recenter map helper
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

// Default Leaflet marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Icons by type
const typeIcons = {
  pg: <FaBed className="inline mr-1" />,
  food: <FaUtensils className="inline mr-1" />,
  laundry: <FaTshirt className="inline mr-1" />,
  stationery: <FaPencilRuler className="inline mr-1" />,
};

function MapComponent({ center, userLocation }) {
  const [nearbyColleges, setNearbyColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (userLocation) {
      fetchNearbyColleges(userLocation.lat, userLocation.lng).then(setNearbyColleges);
    }
  }, [userLocation]);

  useEffect(() => {
    const radiusKm = 2.5;
    const origin = selectedCollege || userLocation;

    if (origin) {
      fetchNearbyServices(origin.lat, origin.lng || origin.lon, radiusKm * 1000, selectedType)
        .then(setFilteredServices)
        .catch((err) => {
          console.error('Error fetching services:', err);
          setFilteredServices([]);
        });
    } else {
      setFilteredServices([]);
    }
  }, [selectedCollege, selectedType, userLocation]);

  return (
    <div>
      {/* College Dropdown */}
      {nearbyColleges.length > 0 && (
        <div className="p-4 bg-white rounded shadow mb-4">
          <label className="mr-2 font-semibold">Select a nearby college:</label>
          <select
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue) {
                try {
                  setSelectedCollege(JSON.parse(selectedValue));
                } catch {
                  setSelectedCollege(null);
                }
              } else {
                setSelectedCollege(null);
              }
            }}
            className="border px-3 py-1 rounded"
          >
            <option value="">-- Select --</option>
            {nearbyColleges.map((college, index) => (
              <option key={index} value={JSON.stringify(college)}>
                {college.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filter by type */}
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
        <MapContainer center={center} zoom={14} scrollWheelZoom>
          <RecenterMap center={selectedCollege ? [selectedCollege.lat, selectedCollege.lon] : [userLocation?.lat, userLocation?.lng]} />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User location marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={defaultIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* College marker */}
          {selectedCollege && (
            <Marker position={[selectedCollege.lat, selectedCollege.lon]} icon={defaultIcon}>
              <Popup>{selectedCollege.name}</Popup>
            </Marker>
          )}

          {/* Nearby service markers */}
          {filteredServices.map((service) => (
            <Marker key={service.id} position={[service.lat, service.lng]} icon={defaultIcon}>
              <Popup>
                <strong>{service.name}</strong>
                <br />
                Type: {service.type} {typeIcons[service.type]}
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

      {/* No services message */}
      {(selectedCollege || userLocation) && filteredServices.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No services found for selected filters.
        </p>
      )}
    </div>
  );
}

export default MapComponent;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { fetchNearbyColleges } from '../api/collegeApi';
import nearbyData from '../data/nearbyData'; // Update path if needed
import { calculateDistance } from '../utils/calculateDistance';

function MapComponent({ center, services, userLocation }) {
  const [nearbyColleges, setNearbyColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [collegeServices, setCollegeServices] = useState([]);

  // Fetch nearby colleges once user location is available
  useEffect(() => {
    if (userLocation) {
      fetchNearbyColleges(userLocation.lat, userLocation.lng).then((colleges) => {
        setNearbyColleges(colleges);
      });
    }
  }, [userLocation]);

  // Fetch nearby services for selected college
  useEffect(() => {
    if (selectedCollege) {
      const radiusKm = 2.5; // You can adjust this
      const filtered = nearbyData.filter(service => {
        const dist = calculateDistance(
          selectedCollege.lat,
          selectedCollege.lon,
          service.latitude,
          service.longitude
        );
        return dist <= radiusKm;
      });

      setCollegeServices(filtered);
    } else {
      setCollegeServices([]);
    }
  }, [selectedCollege]);

  return (
    <div>
      {/* College Dropdown */}
      {nearbyColleges.length > 0 && (
        <div className="p-4 bg-white rounded shadow mb-4">
          <label className="mr-2 font-medium">Select Nearby College:</label>
          <select
            onChange={(e) => {
              const selected = JSON.parse(e.target.value);
              setSelectedCollege(selected);
            }}
            className="border p-2"
          >
            <option value="">-- Choose a college --</option>
            {nearbyColleges.map((college, i) => (
              <option key={i} value={JSON.stringify(college)}>
                {college.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Map */}
      <div className="map-container" style={{ height: '500px', width: '100%' }}>
        <MapContainer center={center} zoom={14} scrollWheelZoom>
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

          {/* Service Markers (static or default) */}
          {services.map(service => (
            <Marker
              key={service.id}
              position={[service.latitude, service.longitude]}
            >
              <Popup>
                {service.name} <br />
                {service.address}
              </Popup>
            </Marker>
          ))}

          {/* Selected College Marker */}
          {selectedCollege && (
            <Marker position={[selectedCollege.lat, selectedCollege.lon]}>
              <Popup>{selectedCollege.name}</Popup>
            </Marker>
          )}

          {/* Nearby Services around selected college */}
          {collegeServices.map(service => (
            <Marker
              key={service.id}
              position={[service.latitude, service.longitude]}
            >
              <Popup>
                {service.name} <br />
                {service.type} <br />
                {service.address}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Info Text */}
      {selectedCollege && collegeServices.length > 0 && (
        <p className="text-gray-600 mt-2">
          Showing services within 2.5 km of <strong>{selectedCollege.name}</strong>.
        </p>
      )}
    </div>
  );
}

export default MapComponent;

import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaBed,
  FaUtensils,
  FaTshirt,
  FaPencilRuler,
  FaStar,
  FaLocationArrow,
} from "react-icons/fa";

// Icons for types
const typeIcons = {
  pg: <FaBed className="inline mr-1" />,
  food: <FaUtensils className="inline mr-1" />,
  laundry: <FaTshirt className="inline mr-1" />,
  stationery: <FaPencilRuler className="inline mr-1" />,
};

// Default Marker Icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Recenter Map
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
};

// Distance Calculation (Haversine)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const App = () => {
  const [colleges, setColleges] = useState({});
  const [services, setServices] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [useUserLocation, setUseUserLocation] = useState(false);

  const serviceTypes = ["pg", "food", "laundry", "stationery"];

  // Fetch colleges and services
  useEffect(() => {
    fetch("http://localhost:5000/colleges")
      .then((res) => res.json())
      .then((data) => {
        const formatted = {};
        data.forEach((c) => (formatted[c.name] = { lat: c.lat, lng: c.lng }));
        setColleges(formatted);
      });

    fetch("http://localhost:5000/services")
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);

  // Get user location
  useEffect(() => {
    if (useUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(coords);
          setMapCenter([coords.lat, coords.lng]);
        },
        () => {
          alert("Permission denied for location.");
          setUseUserLocation(false);
        }
      );
    }
  }, [useUserLocation]);

  // College select
  const handleCollegeChange = (e) => {
    const college = e.target.value;
    setSelectedCollege(college);
    setUseUserLocation(false);
    setSelectedType("all");
    setSearchTerm("");
    if (colleges[college]) {
      setMapCenter([colleges[college].lat, colleges[college].lng]);
    }
  };

  // Filter and compute distance
  let filteredServices = [];
  if ((useUserLocation && userLocation) || (selectedCollege && colleges[selectedCollege])) {
    const center = useUserLocation ? userLocation : colleges[selectedCollege];
    filteredServices = services
      .map((service) => {
        const dist = calculateDistance(center.lat, center.lng, service.lat, service.lng);
        return { ...service, distance: dist.toFixed(2) + " km" };
      })
      .filter(
        (s) =>
          (!useUserLocation || calculateDistance(center.lat, center.lng, s.lat, s.lng) <= 3) &&
          (selectedType === "all" || s.type === selectedType) &&
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (!selectedCollege || s.college === selectedCollege)
      );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Student City Guide</h1>

      {/* Location Options */}
      <div className="flex justify-center gap-4 mb-4 flex-wrap">
        <select
          value={selectedCollege}
          onChange={handleCollegeChange}
          className="border px-4 py-2 rounded shadow-md"
        >
          <option value="">Select your college</option>
          {Object.keys(colleges).map((college) => (
            <option key={college} value={college}>
              {college}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setUseUserLocation(true);
            setSelectedCollege("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            useUserLocation ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          <FaLocationArrow /> Use My Location
        </button>
      </div>

      {/* Filters */}
      {(selectedCollege || useUserLocation) && (
        <>
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            <button
              className={`px-4 py-1 rounded ${
                selectedType === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setSelectedType("all")}
            >
              All
            </button>
            {serviceTypes.map((type) => (
              <button
                key={type}
                className={`capitalize px-4 py-1 rounded ${
                  selectedType === type ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
                onClick={() => setSelectedType(type)}
              >
                {typeIcons[type]} {type}
              </button>
            ))}
          </div>

          <div className="flex justify-center mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search service by name or keyword"
              className="border px-4 py-2 rounded w-full max-w-md shadow-sm"
            />
          </div>
        </>
      )}

      {/* Map */}
      <div className="mb-8">
        <MapContainer center={mapCenter} zoom={14} style={{ height: "400px" }}>
          <RecenterMap center={mapCenter} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {selectedCollege && (
            <Marker position={mapCenter} icon={defaultIcon}>
              <Popup>
                <strong>{selectedCollege}</strong>
              </Popup>
            </Marker>
          )}
          {useUserLocation && userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={defaultIcon}>
              <Popup>
                <strong>You are here</strong>
              </Popup>
            </Marker>
          )}
          {filteredServices.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={defaultIcon}>
              <Popup>
                <strong>{s.name}</strong>
                <br />
                Type: {s.type}
                <br />
                Distance: {s.distance}
                <br />
                Contact: {s.contact}
                <br />
                Rating:{" "}
                {Array.from({ length: s.rating }, (_, i) => (
                  <FaStar key={i} className="inline text-yellow-400" />
                ))}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Services List */}
      {(selectedCollege || useUserLocation) && (
        <>
          <h2 className="text-2xl font-semibold mb-4">
            Nearby Services {selectedCollege && `for ${selectedCollege}`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredServices.map((s) => (
              <div key={s.id} className="border rounded-lg p-4 shadow-md bg-white">
                <h3 className="text-lg font-bold mb-1">{s.name}</h3>
                <p className="capitalize mb-1">{typeIcons[s.type]} {s.type}</p>
                <p>Distance: {s.distance}</p>
                <p>Contact: {s.contact}</p>
                <p className="flex items-center gap-1">
                  Rating:{" "}
                  {Array.from({ length: s.rating }, (_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </p>
              </div>
            ))}
            {filteredServices.length === 0 && (
              <p className="col-span-full text-center text-gray-500">
                No services found for selected filter or search.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;

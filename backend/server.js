const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Sample colleges data
const colleges = require('./colleges.json');

// Sample services data
const services = require('./services');

// API route for colleges
app.get('/api/colleges', (req, res) => {
  res.json(colleges);
});

// API route for services
app.get('/api/services', (req, res) => {
  const { lat, lng, radius = 2500, type = 'all' } = req.query;

  const origin = { lat: parseFloat(lat), lng: parseFloat(lng) };
  const r = parseFloat(radius);

  const filtered = services.filter((s) => {
    const dLat = (s.lat - origin.lat) * 111000; // ~111km per degree latitude
    const dLng = (s.lng - origin.lng) * 111000;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    const typeMatch = type === 'all' || s.type === type;
    return dist <= r && typeMatch;
  });

  res.json(filtered);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

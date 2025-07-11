// src/components/ServiceCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { MapPin, Star, Phone } from 'lucide-react'; // Icons for location, rating, and contact

function ServiceCard({ place }) {
  const name = place?.name || 'Unknown Service';
  const rating = place?.rating ?? 0;
  const type = place?.type || 'N/A';
  const location = place?.location || (place?.lat && place?.lng ? `Lat: ${place.lat}, Lng: ${place.lng}` : 'Location unavailable');
  const contact = place?.contact || null;

  const mapUrl = place?.lat && place?.lng
    ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 transition hover:shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-800 dark:text-gray-200">{rating}</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-300 capitalize">{type}</p>

      <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
        <MapPin className="w-4 h-4 mr-1" />
        {location}
      </div>

      {contact && (
        <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="w-4 h-4 mr-1" />
          {contact}
        </div>
      )}

      {mapUrl && (
        <div className="mt-3">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200"
          >
            📍 Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

// Prop types validation
ServiceCard.propTypes = {
  place: PropTypes.shape({
    name: PropTypes.string,
    rating: PropTypes.number,
    type: PropTypes.string,
    location: PropTypes.string,
    contact: PropTypes.string,
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
};

export default ServiceCard;

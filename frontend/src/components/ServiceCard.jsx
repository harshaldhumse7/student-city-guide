// src/components/ServiceCard.jsx
import React from 'react';
import { MapPin, Star } from 'lucide-react'; // Optional icons (Tailwind + Lucide)

function ServiceCard({ place }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 transition hover:shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{place.name}</h3>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400" />
          <span>{place.rating}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300">{place.type}</p>
      <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
        <MapPin className="w-4 h-4 mr-1" />
        {place.location}
      </div>
    </div>
  );
}

export default ServiceCard;

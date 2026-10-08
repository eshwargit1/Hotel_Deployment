import React from "react";

const HotelMap = ({ latitude, longitude, hotelName, location }) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return (
      <div className="hotel-geo-map" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
        Location coordinates unavailable
      </div>
    );
  }

  // OpenStreetMap bounding box around the coordinates (~1km radius)
  const delta = 0.008;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="hotel-geo-map" style={{ overflow: "hidden" }}>
      <iframe
        title={`Map for ${hotelName}`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        src={mapSrc}
      />
    </div>
  );
};

export default HotelMap;

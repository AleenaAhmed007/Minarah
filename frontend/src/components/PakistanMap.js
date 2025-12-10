import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/apiService";

function PakistanMap() {
  const [pakistanGeo, setPakistanGeo] = useState(null);

  useEffect(() => {
    const fetchPakistan = async () => {
      try {
        const res = await api.fetchPakistanGeo(); // your /geo/pakistan
        setPakistanGeo(res.data);
      } catch (error) {
        console.error("GeoJSON fetch error:", error);
      }
    };
    fetchPakistan();
  }, []);

  // Styling the full Pakistan region
  const mapStyle = {
    fillColor: "#00bcd4",
    weight: 2,
    opacity: 1,
    color: "#006977",
    fillOpacity: 0.6,
  };

  return (
    <div className="w-full h-screen">
      <MapContainer
        center={[30, 70]}
        zoom={5}
        minZoom={5}
        maxZoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        // -------------------------------
        // LOCK MAP TO PAKISTAN BOUNDS
        // -------------------------------
        maxBounds={[
          [37.0841, 60.8742], // North-West
          [23.6345, 77.8375], // South-East
        ]}
        maxBoundsViscosity={1.0} // Hard-lock boundaries
      >
        {/* Light background tiles */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pakistan GeoJSON Colored */}
        {pakistanGeo && (
          <GeoJSON
            data={pakistanGeo}
            style={() => mapStyle}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default PakistanMap;

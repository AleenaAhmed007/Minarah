import React, { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import AnimatedRain from "./AnimatedRain";

function MapView({ visitorMode }) {
  const pakistanCenter = [30.3753, 69.3451];

  useEffect(() => {
    document.querySelector(".leaflet-container").style.border =
      "2px solid #00eaff";
    document.querySelector(".leaflet-container").style.boxShadow =
      "0 0 25px #00eaff55";
  }, []);

  return (
    <div className="relative w-full h-[70vh] rounded-lg overflow-hidden">
      <AnimatedRain />

      <MapContainer
        center={pakistanCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution="Pakistan Maps"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Placeholder polygons — real shapefile later */}
        <GeoJSON
          data={{
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [66.5, 24.5],
                  [67.8, 24.7],
                  [68.0, 25.5],
                  [67.0, 25.4],
                  [66.5, 24.5]
                ]
              ]
            }
          }}
          style={{
            color: visitorMode ? "#00eaff" : "red",
            weight: 2,
            fillOpacity: visitorMode ? 0.15 : 0.35,
          }}
        />
      </MapContainer>
    </div>
  );
}

export default MapView;

import React from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

function HeatmapLayer({ points = [] }) {
  const map = useMap();

  React.useEffect(() => {
    if (!map) return;

    const heat = L.heatLayer(
      points.map((p) => [p.lat, p.lon, p.intensity || 0.5]),
      { radius: 25, blur: 15, gradient: { 0.4: "blue", 0.65: "lime", 1: "red" } }
    ).addTo(map);

    return () => map.removeLayer(heat);
  }, [map, points]);

  return null;
}

export default HeatmapLayer;

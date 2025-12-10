// src/pages/CitizenDashboard.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import {
  AlertTriangle,
  MapPin,
  RefreshCw,
  Thermometer,
  CloudRain,
  Sprout,
  Snowflake,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Droplets,
  Navigation,
  LogOut,
} from "lucide-react";
import apiService from "../services/apiService";
import SOSRequestModal from "../components/SOSRequestModal";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

// ========== ICONS CONFIG ==========
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4320/4320350.png",
  iconSize: [35, 35],
  popupAnchor: [0, -15],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131546.png",
  iconSize: [35, 35],
  popupAnchor: [0, -15],
});

// ========== CONSTANTS ==========
const PROVINCE_THRESHOLDS = {
  punjab: { precipHigh: 100, tempHigh: 35, ndviLow: 0.25, ndsiSnow: 0.3 },
  sindh: { precipHigh: 80, tempHigh: 38, ndviLow: 0.2, ndsiSnow: 0.25 },
  balochistan: { precipHigh: 50, tempHigh: 36, ndviLow: 0.15, ndsiSnow: 0.2 },
  kpk: { precipHigh: 120, tempHigh: 33, ndviLow: 0.28, ndsiSnow: 0.4 },
  gilgit: { precipHigh: 60, tempHigh: 25, ndviLow: 0.2, ndsiSnow: 0.5 },
  islamabad: { precipHigh: 90, tempHigh: 34, ndviLow: 0.25, ndsiSnow: 0.3 },
};

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws";
const ORS_API_KEY = process.env.REACT_APP_ORS_KEY;

// ========== API HELPERS ==========
const fetchCoordinates = async (city) => {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );
  const json = await res.json();
  if (!json?.results?.length) throw new Error(`City "${city}" not found`);

  return {
    lat: json.results[0].latitude,
    lon: json.results[0].longitude,
  };
};

const fetchWeatherData = async (lat, lon) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&current=temperature_2m,precipitation&daily=precipitation_sum&timezone=auto`
  );
  const data = await res.json();

  if (!data?.current_weather || !data?.daily) {
    throw new Error("Weather API returned incomplete data");
  }

  return {
    temperature: data.current_weather.temperature,
    precipitation: data.daily.precipitation_sum?.[0] || 0,
    rainfallCurrent: data.current_weather.precipitation ?? 0,
  };
};

const fetchNDVI = async (lat, lon) => {
  const today = new Date();
  const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}${m}${day}`;
  };

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=GWETROOT&community=AG&longitude=${lon}&latitude=${lat}&start=${formatDate(startDate)}&end=${formatDate(today)}&format=JSON`;
  const res = await fetch(url);
  const json = await res.json();

  if (!json?.properties?.parameter?.GWETROOT) {
    throw new Error("NDVI proxy (NASA POWER) returned incomplete data");
  }

  const gwet = json.properties.parameter.GWETROOT;
  const values = Object.values(gwet);
  const latest = values[values.length - 1];

  return Math.min(Math.max(latest / 0.5, 0), 1);
};

const fetchNDSI = async (lat, lon) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snow_depth&timezone=auto`
  );
  const data = await res.json();
  const snowDepth = data?.daily?.snow_depth?.[0] || 0;

  return Math.min(Math.max(snowDepth / 100, 0), 1);
};

// ========== ROUTING HELPERS ==========

// 1. Get Live GPS
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err)
    );
  });
};

// 2. Find Nearest Hospital (Overpass API)
const fetchNearbyHospitals = async (lat, lon, radius = 15000) => {
  const query = `
    [out:json];
    node["amenity"="hospital"](around:${radius},${lat},${lon});
    out;
  `;
  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });
    const data = await response.json();
    return data.elements.map((item) => ({
      id: item.id,
      name: item.tags.name || "Medical Center",
      lat: item.lat,
      lon: item.lon,
    }));
  } catch (e) {
    console.error("Overpass API Error:", e);
    return [];
  }
};

// 3. Calculate Distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// 4. Check Flood Risk for Coordinates
const checkFloodRisk = async (lat, lon, province) => {
  try {
    const weather = await fetchWeatherData(lat, lon);
    const ndvi = await fetchNDVI(lat, lon);
    const ndsi = await fetchNDSI(lat, lon);

    const payload = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      temp: weather.temperature,
      ice: ndsi,
      veg: ndvi,
      rain_mm: weather.precipitation,
      province: province || "Punjab",
    };

    const resp = await apiService.getFloodPrediction(payload);
    return resp.data;
  } catch (e) {
    console.error("Flood check error:", e);
    return null;
  }
};

// 5. Sample Route Points for Flood Check
const sampleRoutePoints = (routeCoords, numSamples = 5) => {
  if (routeCoords.length <= numSamples) return routeCoords;

  const samples = [];
  const step = Math.floor(routeCoords.length / numSamples);

  for (let i = 0; i < numSamples; i++) {
    samples.push(routeCoords[i * step]);
  }

  return samples;
};

// 6. Get Optimized Route with Flood Checking (OpenRouteService)
const getOptimizedRoute = async (start, end, province, setFloodWarnings) => {
  if (!ORS_API_KEY) {
    console.error("Missing ORS API Key");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start.lon},${start.lat}&end=${end.lon},${end.lat}`
    );
    const data = await res.json();

    if (!data.features || data.features.length === 0) return null;

    if (data.features[0].geometry.coordinates) {
      const routePath = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);

      const samplePoints = sampleRoutePoints(routePath, 5);
      const floodChecks = [];

      console.log("🔍 Checking route for flood risks...");

      for (const point of samplePoints) {
        const floodData = await checkFloodRisk(point[0], point[1], province);
        if (floodData && floodData.flood) {
          floodChecks.push({
            lat: point[0],
            lon: point[1],
            severity: floodData.severity,
            confidence: floodData.confidence
          });
        }
      }

      if (setFloodWarnings && floodChecks.length > 0) {
        setFloodWarnings(floodChecks);
      }

      return routePath;
    }
    return [];
  } catch (e) {
    console.error("ORS Routing Error:", e);
    return null;
  }
};

// Helper: Auto-zoom map to route
const MapReCenter = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

// ========== UTILITY FUNCTIONS ==========
const computeThresholdExplanations = (features, province) => {
  const thresholds = PROVINCE_THRESHOLDS[province?.toLowerCase()] || PROVINCE_THRESHOLDS.punjab;
  const factors = [];

  if (features.precipitation >= thresholds.precipHigh) {
    factors.push(`Heavy daily precipitation: ${features.precipitation.toFixed(1)} mm`);
  } else if (features.precipitation >= thresholds.precipHigh * 0.6) {
    factors.push(`Moderate precipitation: ${features.precipitation.toFixed(1)} mm`);
  }

  if (features.temperature >= thresholds.tempHigh) {
    factors.push(`High temperature: ${features.temperature.toFixed(1)} °C`);
  }

  if (features.ndvi <= thresholds.ndviLow) {
    factors.push(`Low vegetation (NDVI ${features.ndvi.toFixed(3)}) — reduced infiltration`);
  }

  if (features.ndsi >= thresholds.ndsiSnow) {
    factors.push(`Snow/ice presence (NDSI ${features.ndsi.toFixed(3)}) — melt risk`);
  }

  if (features.rainfallCurrent > 0) {
    factors.push(`Currently raining: ${features.rainfallCurrent.toFixed(1)} mm`);
  }

  return factors;
};

const mapSeverityToUI = (mlResult) => {
  if (!mlResult) return { level: "UNKNOWN", color: "text-gray-400", icon: Info };
  if (!mlResult.flood) return { level: "LOW", color: "text-green-500", icon: CheckCircle };

  switch ((mlResult.severity || "").toLowerCase()) {
    case "severe":
    case "high":
      return { level: "CRITICAL", color: "text-red-500", icon: AlertTriangle };
    case "moderate":
      return { level: "HIGH", color: "text-orange-500", icon: AlertCircle };
    case "mild":
    case "low":
      return { level: "MODERATE", color: "text-yellow-500", icon: AlertCircle };
    default:
      return { level: "HIGH", color: "text-orange-500", icon: AlertCircle };
  }
};

// ========== COMPONENT ==========
function CitizenDashboard() {
  const [coords, setCoords] = useState(null);
  const [features, setFeatures] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [explain, setExplain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showSOSModal, setShowSOSModal] = useState(false);

  // Routing State
  const [userLocation, setUserLocation] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [floodWarnings, setFloodWarnings] = useState([]);
  const [alternateHospitals, setAlternateHospitals] = useState([]);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Demo User",
    area: "Lahore",
    province: "Punjab",
  };

  // ========================= WebSocket Handling =========================
  useEffect(() => {
    let socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("🔥 WebSocket Connected");
      socket.send(JSON.stringify({ type: "join", role: "citizen" }));
    };

    socket.onmessage = (event) => {
      console.log("📩 Message from server:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === "sos-update") alert(`🚨 SOS Update: ${data.message}`);
        if (data.type === "system-alert") alert(`⚠️ System Alert: ${data.message}`);
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    socket.onclose = () => {
      console.warn("WebSocket closed. Reconnecting in 3s...");
      setTimeout(() => {
        // window.location.reload();
      }, 3000);
    };

    socket.onerror = (err) => {
      console.error("WebSocket Error", err);
    };

    return () => socket.close();
  }, []);

  // ========== MAIN DATA FETCH ==========
  const fetchAllDataAndPredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await fetchCoordinates(user.area);
      setCoords(location);

      try {
        const gps = await getUserLocation();
        setUserLocation(gps);
      } catch (e) {
        console.warn("GPS Access Denied. Using City Center.");
        setUserLocation(location);
      }

      const [weather, ndvi, ndsi] = await Promise.all([
        fetchWeatherData(location.lat, location.lon),
        fetchNDVI(location.lat, location.lon),
        fetchNDSI(location.lat, location.lon),
      ]);

      const combinedFeatures = {
        temperature: Number(weather.temperature),
        precipitation: Number(weather.precipitation),
        ndvi: Number(ndvi),
        ndsi: Number(ndsi),
        rainfallCurrent: Number(weather.rainfallCurrent || 0),
        snowfall: 0,
        cloudCover: 0,
      };

      setFeatures(combinedFeatures);

      const payload = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        temp: combinedFeatures.temperature,
        ice: combinedFeatures.ndsi,
        veg: combinedFeatures.ndvi,
        rain_mm: combinedFeatures.precipitation,
        province: user.province || "Punjab",
      };

      const resp = await apiService.getFloodPrediction(payload);
      setMlResult(resp.data);

      const explanation = computeThresholdExplanations(combinedFeatures, user.province);
      setExplain(explanation);

      setLastUpdated(new Date());
    } catch (err) {
      console.error("fetch/predict error:", err);
      setError(err.message || "Failed to fetch/predict data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDataAndPredict();
    const interval = setInterval(fetchAllDataAndPredict, REFRESH_INTERVAL);
    return () => clearInterval(interval);
    
  }, [user.area]);

  // ========== ROUTING LOGIC ==========
  const handleFindRoute = async () => {
    if (!userLocation) {
      alert("Please enable GPS to find a route.");
      return;
    }
    setRoutingLoading(true);
    setRoutePath(null);
    setNearestHospital(null);
    setFloodWarnings([]);
    setAlternateHospitals([]);

    try {
      const hospitals = await fetchNearbyHospitals(userLocation.lat, userLocation.lon, 15000);

      if (hospitals.length === 0) {
        alert("No hospitals found nearby (15km).");
        setRoutingLoading(false);
        return;
      }

      const hospitalsWithDistance = hospitals.map((h) => ({
        ...h,
        distance: calculateDistance(userLocation.lat, userLocation.lon, h.lat, h.lon)
      })).sort((a, b) => a.distance - b.distance);

      let safeRouteFound = false;
      let selectedHospital = null;
      let selectedRoute = null;
      let routeWarnings = [];

      for (let i = 0; i < Math.min(3, hospitalsWithDistance.length) && !safeRouteFound; i++) {
        const hospital = hospitalsWithDistance[i];
        console.log(`🏥 Checking route to: ${hospital.name} (${hospital.distance.toFixed(1)}km)`);

        const tempWarnings = [];
        const path = await getOptimizedRoute(
          userLocation,
          hospital,
          user.province,
          (warnings) => tempWarnings.push(...warnings)
        );

        if (path) {
          if (tempWarnings.length === 0) {
            safeRouteFound = true;
            selectedHospital = hospital;
            selectedRoute = path;
            console.log(`✅ Safe route found to ${hospital.name}`);
            break;
          } else if (i === 0) {
            selectedHospital = hospital;
            selectedRoute = path;
            routeWarnings = tempWarnings;
          }
        }
      }

      if (selectedRoute) {
        setNearestHospital(selectedHospital);
        setRoutePath(selectedRoute);
        setFloodWarnings(routeWarnings);
        setAlternateHospitals(hospitalsWithDistance.slice(1, 4).filter(h => h.id !== selectedHospital.id));

        if (routeWarnings.length > 0) {
          alert(`⚠️ WARNING: Flood risk detected on route to ${selectedHospital.name}!\n\n` +
            `${routeWarnings.length} flood zone(s) detected along the path.\n` +
            `Consider alternate routes or wait for conditions to improve.`);
        } else {
          alert(`✅ Safe route calculated to ${selectedHospital.name} (${selectedHospital.distance.toFixed(1)}km)`);
        }
      } else {
        alert("Could not calculate any driving route (ORS API error).");
      }

    } catch (e) {
      console.error("Routing Failed:", e);
      alert("Error finding route: " + e.message);
    } finally {
      setRoutingLoading(false);
    }
  };

  const uiSeverity = mapSeverityToUI(mlResult);
  const SeverityIcon = uiSeverity.icon;

  // ========== RENDER STATES ==========
  if (loading && !features) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-500" />
          <p className="text-xl">Loading real-time data and model prediction...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-red-500">Error</h2>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchAllDataAndPredict}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.name} 👋</h1>
          <div className="flex items-center gap-2 text-lg mb-1">
            <MapPin className="h-5 w-5 text-blue-400" />
            <span>City: <b>{user.area}</b> • Province: <b>{user.province}</b></span>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Emergency SOS Button */}
          <button
            onClick={() => setShowSOSModal(true)}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white flex items-center gap-2 transition-colors animate-pulse"
          >
            <AlertTriangle className="h-4 w-4" />
            Emergency SOS
          </button>

          <button
            onClick={fetchAllDataAndPredict}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-4 py-2 rounded text-white flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ML Result Alert */}
      {mlResult && (
        <div
          className={`mb-6 p-6 rounded-lg border ${
            uiSeverity.level === "CRITICAL"
              ? "bg-red-900/20 border-red-500"
              : uiSeverity.level === "HIGH"
                ? "bg-orange-900/20 border-orange-500"
                : uiSeverity.level === "MODERATE"
                  ? "bg-yellow-900/20 border-yellow-500"
                  : "bg-green-900/20 border-green-500"
          }`}
        >
          <div className="flex items-center gap-4">
            <SeverityIcon className={`h-10 w-10 ${uiSeverity.color}`} />
            <div>
              <h2 className="text-2xl font-bold">
                Model prediction: <span className={uiSeverity.color}>{uiSeverity.level}</span>
              </h2>
              <p className="text-gray-300">
                Severity: {mlResult.severity} • Flood: {mlResult.flood ? "Yes" : "No"}
                {mlResult.confidence && ` • Confidence: ${(mlResult.confidence * 100).toFixed(0)}%`}
              </p>
            </div>
          </div>

          {mlResult?.explanation && (
            <div className="mt-4">
              <p className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Model reasons:
              </p>
              <ul className="list-disc ml-5 mt-2">
                {mlResult.explanation.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Map Section */}
      {coords && (
        <div className="mb-6 relative z-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-400" />
              Live Evacuation Map
            </h2>
            <button
              onClick={handleFindRoute}
              disabled={routingLoading}
              className={`px-4 py-2 rounded flex items-center gap-2 text-white font-bold transition-all ${
                routingLoading ? "bg-gray-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {routingLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {routingLoading ? "Calculating..." : "Find Safe Route"}
            </button>
          </div>

          <div className="relative z-10 w-full h-[400px] overflow-hidden rounded-lg shadow-lg">
            <MapContainer
              center={[coords.lat, coords.lon]}
              zoom={10}
              className="absolute inset-0"
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {/* User Live GPS */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}

              {/* Nearest Hospital */}
              {nearestHospital && (
                <Marker position={[nearestHospital.lat, nearestHospital.lon]} icon={hospitalIcon}>
                  <Popup>
                    <b>{nearestHospital.name}</b>
                    <br />
                    Safe Zone
                    <br />
                    Distance: {nearestHospital.distance?.toFixed(1)} km
                    {floodWarnings.length > 0 && (
                      <>
                        <br />
                        <span className="text-red-600 font-bold">⚠️ Route has flood risk!</span>
                      </>
                    )}
                  </Popup>
                </Marker>
              )}

              {/* Route */}
              {routePath && (
                <>
                  <Polyline
                    positions={routePath}
                    color={floodWarnings.length > 0 ? "red" : "blue"}
                    weight={5}
                  />
                  <MapReCenter bounds={routePath} />

                  {/* Mark flood zones on route */}
                  {floodWarnings.map((warning, idx) => (
                    <Circle
                      key={idx}
                      center={[warning.lat, warning.lon]}
                      radius={1000}
                      pathOptions={{
                        color: "red",
                        fillColor: "red",
                        fillOpacity: 0.3,
                      }}
                    >
                      <Popup>
                        <b>⚠️ Flood Risk Zone</b>
                        <br />
                        Severity: {warning.severity}
                        <br />
                        Confidence: {warning.confidence ? `${(warning.confidence * 100).toFixed(0)}%` : "N/A"}
                      </Popup>
                    </Circle>
                  ))}
                </>
              )}

              {/* Flood Risk Zone - Main Area */}
              <Circle
                center={[coords.lat, coords.lon]}
                radius={5000}
                pathOptions={{
                  color:
                    uiSeverity.level === "CRITICAL"
                      ? "red"
                      : uiSeverity.level === "HIGH"
                        ? "orange"
                        : uiSeverity.level === "MODERATE"
                          ? "yellow"
                          : "green",
                  fillOpacity: 0.15,
                }}
              />
            </MapContainer>
          </div>

          {/* Flood Warnings Section */}
          {floodWarnings.length > 0 && (
            <div className="mt-4 bg-red-900/30 border border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-red-500">⚠️ Flood Risk on Route</h3>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                {floodWarnings.length} flood zone(s) detected along the route. Consider alternate routes.
              </p>
              <ul className="text-sm space-y-1">
                {floodWarnings.map((w, i) => (
                  <li key={i} className="text-gray-300">
                    • Zone {i + 1}: <b>{w.severity}</b> severity
                    {w.confidence && ` (${(w.confidence * 100).toFixed(0)}% confidence)`}
                  </li>
                ))}
              </ul>

              {alternateHospitals.length > 0 && (
                <div className="mt-3 pt-3 border-t border-red-500/30">
                  <p className="text-sm font-semibold mb-2">Consider these alternatives:</p>
                  <ul className="text-sm space-y-1">
                    {alternateHospitals.map((h, i) => (
                      <li key={i} className="text-gray-300">
                        • {h.name} ({h.distance.toFixed(1)} km)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Safe Route Confirmation */}
          {routePath && floodWarnings.length === 0 && (
            <div className="mt-4 bg-green-900/30 border border-green-500 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="font-bold text-green-500">✅ Safe Route - No flood risks detected</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features Grid */}
      {features && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800 p-5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="h-5 w-5 text-red-400" />
              <h3 className="font-bold">Temperature</h3>
            </div>
            <p className="text-2xl">{features.temperature.toFixed(1)} °C</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold">Daily Precipitation</h3>
            </div>
            <p className="text-2xl">{features.precipitation.toFixed(1)} mm</p>
            <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
              <Droplets className="h-4 w-4" />
              <span>Current: {features.rainfallCurrent.toFixed(1)} mm</span>
            </div>
          </div>

          <div className="bg-slate-800 p-5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="h-5 w-5 text-green-400" />
              <h3 className="font-bold">NDVI (Vegetation)</h3>
            </div>
            <p className="text-2xl">{features.ndvi.toFixed(3)}</p>
            <p className="text-sm text-gray-400">Range 0 - 1</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Snowflake className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold">NDSI (Snow / Ice)</h3>
            </div>
            <p className="text-2xl">{features.ndsi.toFixed(3)}</p>
            <p className="text-sm text-gray-400">Range 0 - 1</p>
          </div>
        </div>
      )}

      {/* Contributing Factors */}
      {explain && explain.length > 0 && (
        <div className="bg-slate-800 p-5 rounded-lg mb-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-400" />
            Contributing Factors (Explanatory)
          </h3>
          <ul className="list-disc list-inside space-y-2">
            {explain.map((f, i) => (
              <li key={i} className="text-gray-300">
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SOS Modal Component */}
      <SOSRequestModal
        isOpen={showSOSModal}
        onClose={() => setShowSOSModal(false)}
        user={user}
      />
    </div>
  );
}

export default CitizenDashboard;
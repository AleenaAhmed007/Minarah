// src/pages/CitizenDashboard.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
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
} from "lucide-react";

// ========== MOCK API SERVICE ==========
const apiService = {
  getFloodPrediction: async (payload) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        flood: payload.rain_mm > 80,
        severity: payload.rain_mm > 100 ? "severe" : payload.rain_mm > 80 ? "moderate" : "low",
        confidence: 0.85,
        explanation: [
          `Precipitation: ${payload.rain_mm.toFixed(1)} mm`,
          `Temperature: ${payload.temp.toFixed(1)}°C`,
          `Vegetation index: ${payload.veg.toFixed(3)}`,
        ]
      }
    };
  }
};

// ========== ICONS CONFIG ==========
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

// ========== DUMMY DATA FOR TESTING ==========
const DUMMY_FLOOD_DATA = {
  enabled: false,
  floodedRoute: true,
  mlResult: {
    flood: true,
    severity: "severe",
    confidence: 0.89,
    explanation: [
      "Heavy precipitation detected: 120 mm/day",
      "Low vegetation cover (NDVI 0.18) reduces water absorption",
      "High temperature (38°C) increases evaporation stress",
      "Historical flood patterns in this region"
    ]
  },
  features: {
    temperature: 38.5,
    precipitation: 120.0,
    ndvi: 0.18,
    ndsi: 0.05,
    rainfallCurrent: 15.2,
    snowfall: 0,
    cloudCover: 85
  },
  routeWarnings: [
    { lat: 31.5497, lon: 74.3436, severity: "severe", confidence: 0.91 },
    { lat: 31.5520, lon: 74.3500, severity: "moderate", confidence: 0.78 },
    { lat: 31.5560, lon: 74.3580, severity: "high", confidence: 0.85 }
  ]
};

// ========== LRU CACHE IMPLEMENTATION ==========
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// ========== HASH MAP FOR HOSPITAL DATA ==========
class HospitalHashMap {
  constructor() {
    this.map = new Map();
  }

  generateKey(lat, lon, radius) {
    const roundedLat = Math.round(lat * 1000) / 1000;
    const roundedLon = Math.round(lon * 1000) / 1000;
    return `${roundedLat},${roundedLon},${radius}`;
  }

  set(lat, lon, radius, hospitals) {
    const key = this.generateKey(lat, lon, radius);
    this.map.set(key, {
      hospitals,
      timestamp: Date.now(),
    });
  }

  get(lat, lon, radius) {
    const key = this.generateKey(lat, lon, radius);
    const data = this.map.get(key);
    if (!data) return null;
    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - data.timestamp > ONE_HOUR) {
      this.map.delete(key);
      return null;
    }
    return data.hospitals;
  }

  clear() {
    this.map.clear();
  }
}

// ========== GLOBAL CACHE INSTANCES ==========
const hospitalCache = new HospitalHashMap();
const routeCache = new LRUCache(50);

// ========== CONSTANTS ==========
const PROVINCE_THRESHOLDS = {
  punjab: { precipHigh: 100, tempHigh: 35, ndviLow: 0.25, ndsiSnow: 0.3 },
  sindh: { precipHigh: 80, tempHigh: 38, ndviLow: 0.2, ndsiSnow: 0.25 },
  balochistan: { precipHigh: 50, tempHigh: 36, ndviLow: 0.15, ndsiSnow: 0.2 },
  kpk: { precipHigh: 120, tempHigh: 33, ndviLow: 0.28, ndsiSnow: 0.4 },
  gilgit: { precipHigh: 60, tempHigh: 25, ndviLow: 0.2, ndsiSnow: 0.5 },
  islamabad: { precipHigh: 90, tempHigh: 34, ndviLow: 0.25, ndsiSnow: 0.3 },
};

const REFRESH_INTERVAL = 30 * 60 * 1000;
const ORS_API_KEY = process.env.REACT_APP_ORS_KEY; // Demo key

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
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err)
    );
  });
};

const fetchNearbyHospitals = async (lat, lon, radius = 15000) => {
  const cachedHospitals = hospitalCache.get(lat, lon, radius);
  if (cachedHospitals) {
    console.log("🎯 Using cached hospital data");
    return cachedHospitals;
  }
  console.log("🔍 Fetching hospitals from Overpass API...");
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
    const hospitals = data.elements.map((item) => ({
      id: item.id,
      name: item.tags.name || "Medical Center",
      lat: item.lat,
      lon: item.lon,
    }));
    hospitalCache.set(lat, lon, radius, hospitals);
    console.log(`✅ Cached ${hospitals.length} hospitals`);
    return hospitals;
  } catch (e) {
    console.error("Overpass API Error:", e);
    return [];
  }
};

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

const sampleRoutePoints = (routeCoords, numSamples = 15) => {
  // Increased to 15 sample points for better coverage
  if (routeCoords.length <= numSamples) return routeCoords;
  const samples = [];
  const step = Math.floor(routeCoords.length / numSamples);
  for (let i = 0; i < numSamples; i++) {
    samples.push(routeCoords[i * step]);
  }
  // Always include start, middle, and end points
  if (!samples.some(p => p[0] === routeCoords[0][0])) {
    samples.unshift(routeCoords[0]);
  }
  if (!samples.some(p => p[0] === routeCoords[routeCoords.length - 1][0])) {
    samples.push(routeCoords[routeCoords.length - 1]);
  }
  return samples;
};

const getOptimizedRoute = async (start, end, province, setFloodWarnings, avoidFloodZones = []) => {
  if (!ORS_API_KEY) {
    console.error("Missing ORS API Key");
    return null;
  }
  
  const cacheKey = `${start.lat.toFixed(4)},${start.lon.toFixed(4)}-${end.lat.toFixed(4)},${end.lon.toFixed(4)}-${province}-${avoidFloodZones.length}`;
  const cachedRoute = routeCache.get(cacheKey);
  if (cachedRoute) {
    console.log("🎯 Using cached route data");
    if (setFloodWarnings && cachedRoute.floodWarnings) {
      setFloodWarnings(cachedRoute.floodWarnings);
    }
    return cachedRoute.routePath;
  }
  
  console.log("🔍 Fetching route from OpenRouteService...");
  
  try {
    // Build request body with avoid_polygons if we have flood zones
    let requestBody = {
      coordinates: [[start.lon, start.lat], [end.lon, end.lat]]
    };
    
    // Add avoid_polygons for flood zones
    if (avoidFloodZones && avoidFloodZones.length > 0) {
      const avoidPolygons = {
        type: "MultiPolygon",
        coordinates: avoidFloodZones.map(zone => {
          // Create a polygon around each flood point (square buffer)
          const offset = 0.008; // ~800m offset
          return [[
            [zone.lon - offset, zone.lat - offset],
            [zone.lon + offset, zone.lat - offset],
            [zone.lon + offset, zone.lat + offset],
            [zone.lon - offset, zone.lat + offset],
            [zone.lon - offset, zone.lat - offset] // Close the polygon
          ]];
        })
      };
      requestBody.options = { avoid_polygons: avoidPolygons };
    }
    
    const res = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
      {
        method: 'POST',
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
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
      
      routeCache.set(cacheKey, {
        routePath,
        floodWarnings: floodChecks,
        timestamp: Date.now(),
      });
      console.log("✅ Route cached in LRU");
      
      return routePath;
    }
    return [];
  } catch (e) {
    console.error("ORS Routing Error:", e);
    return null;
  }
};

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
  const [userLocation, setUserLocation] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [floodWarnings, setFloodWarnings] = useState([]);
  const [alternateHospitals, setAlternateHospitals] = useState([]);
  const [cacheStats, setCacheStats] = useState({ hospitals: 0, routes: 0 });
  const [dummyMode, setDummyMode] = useState(false);

  const user = {
    name: "Demo User",
    area: "Lahore",
    province: "Punjab",
  };

  useEffect(() => {
    const updateStats = () => {
      setCacheStats({
        hospitals: hospitalCache.map.size,
        routes: routeCache.size(),
      });
    };
    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllDataAndPredict = async () => {
    setLoading(true);
    setError(null);
    try {
      if (dummyMode) {
        console.log("🧪 DUMMY MODE: Using simulated flood data");
        const location = await fetchCoordinates(user.area);
        setCoords(location);
        try {
          const gps = await getUserLocation();
          setUserLocation(gps);
        } catch (e) {
          console.warn("GPS Access Denied. Using City Center.");
          setUserLocation(location);
        }
        setFeatures(DUMMY_FLOOD_DATA.features);
        setMlResult(DUMMY_FLOOD_DATA.mlResult);
        const explanation = computeThresholdExplanations(DUMMY_FLOOD_DATA.features, user.province);
        setExplain(explanation);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }
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
  }, [user.area, dummyMode]);

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

      if (dummyMode && DUMMY_FLOOD_DATA.floodedRoute) {
        console.log("🧪 DUMMY MODE: Injecting flood warnings on route");
        const selectedHospital = hospitalsWithDistance[0];
        const dummyPath = [
          [userLocation.lat, userLocation.lon],
          [userLocation.lat + 0.01, userLocation.lon + 0.01],
          [userLocation.lat + 0.02, userLocation.lon + 0.02],
          [selectedHospital.lat, selectedHospital.lon]
        ];
        const safeHospital = hospitalsWithDistance[1] || hospitalsWithDistance[0];
        const safeDummyPath = [
          [userLocation.lat, userLocation.lon],
          [userLocation.lat + 0.005, userLocation.lon + 0.015],
          [userLocation.lat + 0.015, userLocation.lon + 0.025],
          [safeHospital.lat, safeHospital.lon]
        ];
        setNearestHospital(selectedHospital);
        setRoutePath(dummyPath);
        setFloodWarnings(DUMMY_FLOOD_DATA.routeWarnings);
        const alternates = hospitalsWithDistance.slice(1, 4).map((h, idx) => ({
          ...h,
          routePath: idx === 0 ? safeDummyPath : null,
          floodWarnings: idx === 0 ? [] : null,
          isSafe: idx === 0
        }));
        setAlternateHospitals(alternates);
        alert(`⚠️ [DUMMY MODE] WARNING: Flood risk detected on route to ${selectedHospital.name}!\n\n` +
          `${DUMMY_FLOOD_DATA.routeWarnings.length} flood zone(s) detected along the path.\n` +
          `🟢 SAFE ALTERNATE ROUTE displayed to ${safeHospital.name} (green line)`);
        setRoutingLoading(false);
        return;
      }

      console.log(`🔍 Checking routes to ${Math.min(5, hospitalsWithDistance.length)} hospitals...`);
      const routeResults = [];
      
      // First pass: Get initial routes and detect flood zones
      const initialFloodZones = [];
      
      for (let i = 0; i < Math.min(5, hospitalsWithDistance.length); i++) {
        const hospital = hospitalsWithDistance[i];
        console.log(`🏥 ${i + 1}. Checking: ${hospital.name} (${hospital.distance.toFixed(1)}km)`);

        const tempWarnings = [];
        const path = await getOptimizedRoute(
          userLocation,
          hospital,
          user.province,
          (warnings) => tempWarnings.push(...warnings),
          [] // No avoidance zones on first pass
        );

        if (path) {
          routeResults.push({
            hospital,
            path,
            warnings: tempWarnings,
            isSafe: tempWarnings.length === 0,
            riskScore: tempWarnings.length
          });
          
          // ONLY collect HIGH-RISK flood zones (severe/high severity) for avoidance
          if (tempWarnings.length > 0) {
            const highRiskZones = tempWarnings.filter(w => 
              w.severity && ['severe', 'high', 'critical'].includes(w.severity.toLowerCase())
            );
            initialFloodZones.push(...highRiskZones);
            console.log(`   ⚠️ ${tempWarnings.length} flood zones (${highRiskZones.length} high-risk)`);
          } else {
            console.log(`   ✅ 0 flood zones`);
          }
        }
      }

      if (routeResults.length === 0) {
        alert("Could not calculate any driving routes (ORS API error).");
        setRoutingLoading(false);
        return;
      }

      // Sort by safety first
      routeResults.sort((a, b) => {
        if (a.isSafe && !b.isSafe) return -1;
        if (!a.isSafe && b.isSafe) return 1;
        if (a.riskScore !== b.riskScore) return a.riskScore - b.riskScore;
        return a.hospital.distance - b.hospital.distance;
      });

      const primaryRoute = routeResults[0];
      
      // If primary route has HIGH-RISK floods, try to reroute avoiding them
      if (!primaryRoute.isSafe && initialFloodZones.length > 0) {
        console.log(`🔄 High-risk floods detected. Attempting reroute avoiding ${initialFloodZones.length} danger zones...`);
        
        const rerouteWarnings = [];
        const reroutePath = await getOptimizedRoute(
          userLocation,
          primaryRoute.hospital,
          user.province,
          (warnings) => rerouteWarnings.push(...warnings),
          initialFloodZones // Avoid ONLY high-risk flood zones
        );
        
        if (reroutePath && rerouteWarnings.length < primaryRoute.warnings.length) {
          console.log(`✅ Reroute successful! Reduced flood zones from ${primaryRoute.warnings.length} to ${rerouteWarnings.length}`);
          primaryRoute.path = reroutePath;
          primaryRoute.warnings = rerouteWarnings;
          primaryRoute.isSafe = rerouteWarnings.length === 0;
          primaryRoute.riskScore = rerouteWarnings.length;
        } else if (reroutePath) {
          console.log(`⚠️ Reroute attempted but similar risk level maintained`);
        }
      }

      setNearestHospital(primaryRoute.hospital);
      setRoutePath(primaryRoute.path);
      setFloodWarnings(primaryRoute.warnings);

      const alternates = routeResults.slice(1, 4).map(r => ({
        ...r.hospital,
        routePath: r.path,
        floodWarnings: r.warnings,
        isSafe: r.isSafe,
        riskScore: r.riskScore
      }));
      setAlternateHospitals(alternates);

      if (primaryRoute.isSafe) {
        const floodedCount = routeResults.filter(r => !r.isSafe).length;
        if (floodedCount > 0) {
          alert(`✅ SAFEST ROUTE FOUND: ${primaryRoute.hospital.name} (${primaryRoute.hospital.distance.toFixed(1)}km)\n\n` +
            `Route automatically avoids all flood zones!\n` +
            `⚠️ ${floodedCount} other route(s) have flood risks.`);
        } else {
          alert(`✅ Safe route to ${primaryRoute.hospital.name} (${primaryRoute.hospital.distance.toFixed(1)}km)\n\nNo flood zones detected.`);
        }
      } else {
        const safeAlternates = alternates.filter(a => a.isSafe);
        if (safeAlternates.length > 0) {
          alert(`⚠️ NEAREST HOSPITAL: ${primaryRoute.hospital.name}\n\n` +
            `Route still has ${primaryRoute.warnings.length} flood zone(s) (shown in RED).\n` +
            `Unable to completely avoid flooding on this route.\n\n` +
            `🟢 ${safeAlternates.length} SAFER ALTERNATE(S) available:\n` +
            safeAlternates.map(a => `  • ${a.name} (${a.distance.toFixed(1)}km)`).join('\n'));
        } else {
          alert(`⚠️ ALL ROUTES HAVE FLOOD RISK!\n\n` +
            `Best route: ${primaryRoute.hospital.name} (${primaryRoute.warnings.length} flood zones)\n` +
            `System attempted automatic rerouting but flooding is widespread.\n\n` +
            `⚠️ RECOMMENDATION: Wait for conditions to improve or seek immediate shelter.`);
        }
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

  if (loading && !features) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-500" />
          <p className="text-xl">Loading real-time data and model prediction...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-slate-900 text-white min-h-screen">
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
    <div className="p-6 max-w-6xl mx-auto bg-slate-900 text-white min-h-screen">
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
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <span>🗄️ Cache: {cacheStats.hospitals} hospitals | {cacheStats.routes} routes</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => setDummyMode(!dummyMode)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                dummyMode 
                  ? "bg-purple-600 hover:bg-purple-700 text-white" 
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
            >
              {dummyMode ? "🧪 Dummy Mode: ON" : "🧪 Dummy Mode: OFF"}
            </button>
            {dummyMode && (
              <span className="text-xs text-purple-400 animate-pulse">
                Using simulated flood data for testing
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
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

              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
                  <Popup>
                    <div style={{color: '#000'}}>
                      <b>📍 Your Location</b>
                      <br />
                      Lat: {userLocation.lat.toFixed(4)}
                      <br />
                      Lon: {userLocation.lon.toFixed(4)}
                    </div>
                  </Popup>
                </Marker>
              )}

              {nearestHospital && (
                <Marker position={[nearestHospital.lat, nearestHospital.lon]} icon={hospitalIcon}>
                  <Popup>
                    <div style={{color: '#000', minWidth: '150px'}}>
                      <b>🏥 {nearestHospital.name}</b>
                      <br />
                      <span style={{color: floodWarnings.length > 0 ? '#dc2626' : '#22c55e', fontWeight: 'bold'}}>
                        {floodWarnings.length > 0 ? '⚠️ FLOODED ROUTE' : '✅ SAFE ROUTE'}
                      </span>
                      <br />
                      Distance: <b>{nearestHospital.distance?.toFixed(1)} km</b>
                      {floodWarnings.length > 0 && (
                        <>
                          <br />
                          <span style={{color: '#dc2626', fontSize: '11px'}}>
                            {floodWarnings.length} flood zone(s) detected
                          </span>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}

              {routePath && (
                <>
                  <Polyline
                    positions={routePath}
                    color={floodWarnings.length > 0 ? "#dc2626" : "#2563eb"}
                    weight={5}
                    opacity={1}
                  />
                  {routePath.length > 0 && <MapReCenter bounds={routePath} />}

                  {floodWarnings.map((warning, idx) => (
                    <Circle
                      key={`primary-flood-${idx}`}
                      center={[warning.lat, warning.lon]}
                      radius={500}
                      pathOptions={{
                        color: "#dc2626",
                        fillColor: "#ef4444",
                        fillOpacity: 0.25,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div style={{color: '#000'}}>
                          <b>⚠️ Flood Risk Zone {idx + 1}</b>
                          <br />
                          Severity: <b>{warning.severity}</b>
                          <br />
                          {warning.confidence && `Confidence: ${(warning.confidence * 100).toFixed(0)}%`}
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                </>
              )}

              {alternateHospitals.filter(h => h.routePath).map((hospital, idx) => (
                <React.Fragment key={`alt-route-${idx}`}>
                  <Polyline
                    positions={hospital.routePath}
                    color={hospital.isSafe ? "#22c55e" : "#f97316"}
                    weight={4}
                    opacity={0.7}
                    dashArray="10, 10"
                  />
                  <Marker position={[hospital.lat, hospital.lon]} icon={hospitalIcon}>
                    <Popup>
                      <div style={{color: '#000'}}>
                        <b>{hospital.name}</b>
                        <br />
                        {hospital.isSafe ? "✅ SAFE ROUTE" : `⚠️ ${hospital.floodWarnings?.length || 0} flood zone(s)`}
                        <br />
                        Distance: {hospital.distance?.toFixed(1)} km
                        <br />
                        <span style={{fontSize: '11px', color: '#666'}}>
                          {hospital.isSafe ? "(Green dashed line)" : "(Orange dashed line)"}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                  {hospital.floodWarnings?.map((warning, wIdx) => (
                    <Circle
                      key={`alt-${idx}-flood-${wIdx}`}
                      center={[warning.lat, warning.lon]}
                      radius={400}
                      pathOptions={{
                        color: "#f97316",
                        fillColor: "#fb923c",
                        fillOpacity: 0.2,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div style={{color: '#000'}}>
                          <b>⚠️ Alternate Route Risk</b>
                          <br />
                          Route to: {hospital.name}
                          <br />
                          Severity: {warning.severity}
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                </React.Fragment>
              ))}

              <Circle
                center={[coords.lat, coords.lon]}
                radius={3000}
                pathOptions={{
                  color:
                    uiSeverity.level === "CRITICAL"
                      ? "#dc2626"
                      : uiSeverity.level === "HIGH"
                        ? "#f97316"
                        : uiSeverity.level === "MODERATE"
                          ? "#eab308"
                          : "#22c55e",
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: "5, 5"
                }}
              />
            </MapContainer>
          </div>

          {floodWarnings.length > 0 && (
            <div className="mt-4 bg-red-900/30 border border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-red-500">⚠️ Flood Risk on PRIMARY Route (Red Line)</h3>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                {floodWarnings.length} flood zone(s) detected on route to <b>{nearestHospital?.name}</b>
              </p>
              <ul className="text-sm space-y-1">
                {floodWarnings.map((w, i) => (
                  <li key={i} className="text-gray-300">
                    • Zone {i + 1}: <b>{w.severity}</b> severity
                    {w.confidence && ` (${(w.confidence * 100).toFixed(0)}% confidence)`}
                  </li>
                ))}
              </ul>

              {alternateHospitals.filter(h => h.isSafe).length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-500/30 bg-green-900/20 rounded p-2">
                  <p className="text-sm font-semibold mb-2 text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    ✅ SAFE ALTERNATE ROUTES AVAILABLE (Green Dashed Lines):
                  </p>
                  <ul className="text-sm space-y-1">
                    {alternateHospitals.filter(h => h.isSafe).map((h, i) => (
                      <li key={i} className="text-green-300">
                        • <b>{h.name}</b> - {h.distance.toFixed(1)} km (NO flood zones)
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-green-400 mt-2">
                    💡 Green dashed lines on map show safe routes
                  </p>
                </div>
              )}

              {alternateHospitals.filter(h => !h.isSafe && h.routePath).length > 0 && (
                <div className="mt-3 pt-3 border-t border-orange-500/30">
                  <p className="text-sm font-semibold mb-2 text-orange-400">
                    ⚠️ Other routes (also have flood risks):
                  </p>
                  <ul className="text-sm space-y-1">
                    {alternateHospitals.filter(h => !h.isSafe && h.routePath).map((h, i) => (
                      <li key={i} className="text-orange-300">
                        • {h.name} - {h.distance.toFixed(1)} km ({h.riskScore} flood zone{h.riskScore > 1 ? 's' : ''})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {routePath && floodWarnings.length === 0 && (
            <div className="mt-4 bg-green-900/30 border border-green-500 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="font-bold text-green-500">✅ SAFE PRIMARY ROUTE (Blue Line)</p>
              </div>
              <p className="text-sm text-gray-300">
                Route to <b>{nearestHospital?.name}</b> ({nearestHospital?.distance.toFixed(1)} km) - No flood risks detected
              </p>
              {alternateHospitals.filter(h => h.routePath).length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-500/30">
                  <p className="text-xs text-gray-400">
                    {alternateHospitals.filter(h => h.isSafe).length} additional safe route(s) available (shown as green dashed lines)
                  </p>
                </div>
              )}
            </div>
          )}

          {routePath && (
            <div className="mt-4 bg-slate-800/50 border border-slate-600 rounded-lg p-3">
              <p className="text-sm font-semibold mb-2">🗺️ Map Legend:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-blue-500"></div>
                  <span>Safe Primary Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-red-500"></div>
                  <span>Flooded Primary Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-green-500 opacity-60 border-t-2 border-dashed border-green-500"></div>
                  <span>Safe Alternate Routes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-orange-500 opacity-60 border-t-2 border-dashed border-orange-500"></div>
                  <span>Risky Alternate Routes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
}

export default CitizenDashboard;
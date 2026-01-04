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
  LogOut,
} from "lucide-react";
import apiService from "../services/apiService";
import SOSRequestModal from "../components/SOSRequestModal";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

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

// ========== PRIORITY QUEUE FOR A* ALGORITHM ==========
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(element, priority) {
    const queueElement = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

// ========== GRAPH DATA STRUCTURE (ADJACENCY LIST) ==========
class RoadNetworkGraph {
  constructor() {
    this.adjacencyList = new Map();
    this.nodes = new Map();
  }

  addNode(id, lat, lon, type = 'intersection') {
    if (!this.nodes.has(id)) {
      console.log(`%c📍 ADJACENCY LIST - ADD NODE`, 'color: #10b981; font-weight: bold');
      console.log(`   Node ID: ${id}`);
      console.log(`   Type: ${type}`);
      console.log(`   Location: [${lat.toFixed(4)}, ${lon.toFixed(4)}]`);
      this.nodes.set(id, { id, lat, lon, type });
      this.adjacencyList.set(id, []);
    }
  }

  addEdge(from, to, distance, floodRisk = 0) {
    if (!this.adjacencyList.has(from)) {
      this.addNode(from, 0, 0);
    }
    if (!this.adjacencyList.has(to)) {
      this.addNode(to, 0, 0);
    }

    console.log(`%c🔗 ADJACENCY LIST - ADD EDGE`, 'color: #3b82f6; font-weight: bold');
    console.log(`   From: ${from} → To: ${to}`);
    console.log(`   Distance: ${distance.toFixed(2)} km`);
    console.log(`   Flood Risk: ${(floodRisk * 100).toFixed(0)}%`);
    console.log(`   Weight: ${(distance * (1 + floodRisk * 10)).toFixed(2)}`);

    // Bidirectional edge
    this.adjacencyList.get(from).push({
      neighbor: to,
      distance,
      floodRisk,
      weight: distance * (1 + floodRisk * 10)
    });

    this.adjacencyList.get(to).push({
      neighbor: from,
      distance,
      floodRisk,
      weight: distance * (1 + floodRisk * 10)
    });
  }

  updateFloodRisk(from, to, newFloodRisk) {
    const updateEdge = (source, target) => {
      const edges = this.adjacencyList.get(source);
      if (edges) {
        const edge = edges.find(e => e.neighbor === target);
        if (edge) {
          edge.floodRisk = newFloodRisk;
          edge.weight = edge.distance * (1 + newFloodRisk * 10);
        }
      }
    };

    updateEdge(from, to);
    updateEdge(to, from);
  }

  getNeighbors(nodeId) {
    return this.adjacencyList.get(nodeId) || [];
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  getNodesByType(type) {
    return Array.from(this.nodes.values()).filter(node => node.type === type);
  }

  // ========== HEURISTIC FUNCTION (Haversine Distance) ==========
  calculateHeuristic(nodeId, goalId) {
    const node = this.getNode(nodeId);
    const goal = this.getNode(goalId);
    
    if (!node || !goal) return 0;

    // Haversine formula for great-circle distance
    const R = 6371; // Earth's radius in km
    const dLat = ((goal.lat - node.lat) * Math.PI) / 180;
    const dLon = ((goal.lon - node.lon) * Math.PI) / 180;
    
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((node.lat * Math.PI) / 180) *
      Math.cos((goal.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ========== A* ALGORITHM IMPLEMENTATION ==========
  findShortestPathAStar(startId, endId, preferSafety = true) {
    console.log(`%c🎯 A* ALGORITHM - PATHFINDING START`, 'color: #f59e0b; font-weight: bold; font-size: 14px');
    console.log(`   Start Node: ${startId}`);
    console.log(`   End Node: ${endId}`);
    console.log(`   Prefer Safety: ${preferSafety ? 'YES' : 'NO'}`);
    
    const openSet = new PriorityQueue();
    const closedSet = new Set();
    
    // Track actual cost from start (g-score)
    const gScore = new Map();
    // Track estimated total cost (f-score = g + h)
    const fScore = new Map();
    // Track path
    const cameFrom = new Map();
    
    // Initialize
    for (const nodeId of this.nodes.keys()) {
      gScore.set(nodeId, Infinity);
      fScore.set(nodeId, Infinity);
    }
    
    gScore.set(startId, 0);
    fScore.set(startId, this.calculateHeuristic(startId, endId));
    
    openSet.enqueue(startId, fScore.get(startId));
    
    let nodesExplored = 0;
    
    while (!openSet.isEmpty()) {
      const current = openSet.dequeue().element;
      nodesExplored++;
      
      // Goal reached!
      if (current === endId) {
        console.log(`%c✅ A* ALGORITHM - SUCCESS!`, 'color: #10b981; font-weight: bold; font-size: 14px');
        console.log(`   Nodes Explored: ${nodesExplored}`);
        console.log(`   Path Found: YES`);
        return this.reconstructPath(cameFrom, current, gScore);
      }
      
      closedSet.add(current);
      
      // Explore neighbors
      const neighbors = this.getNeighbors(current);
      
      for (const edge of neighbors) {
        const neighbor = edge.neighbor;
        
        if (closedSet.has(neighbor)) continue;
        
        // Calculate tentative g-score
        const weight = preferSafety ? edge.weight : edge.distance;
        const tentativeGScore = gScore.get(current) + weight;
        
        if (tentativeGScore < gScore.get(neighbor)) {
          // This path is better!
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeGScore);
          
          // f(n) = g(n) + h(n)
          const heuristic = this.calculateHeuristic(neighbor, endId);
          fScore.set(neighbor, tentativeGScore + heuristic);
          
          // Add to open set if not already there
          openSet.enqueue(neighbor, fScore.get(neighbor));
        }
      }
    }
    
    console.log(`%c❌ A* ALGORITHM - NO PATH FOUND`, 'color: #ef4444; font-weight: bold; font-size: 14px');
    console.log(`   Nodes Explored: ${nodesExplored}`);
    return null;
  }

  // ========== RECONSTRUCT PATH ==========
  reconstructPath(cameFrom, current, scores) {
    const path = [];
    
    while (current !== undefined && current !== null) {
      path.unshift(current);
      current = cameFrom.get(current);
    }

    if (path.length === 0) return null;

    return {
      path,
      distance: scores.get(path[path.length - 1]),
      nodes: path.map(id => this.getNode(id))
    };
  }

  // ========== PATH ANALYSIS ==========
  getPathFloodRisk(path) {
    let totalRisk = 0;
    let count = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const edges = this.getNeighbors(path[i]);
      const edge = edges.find(e => e.neighbor === path[i + 1]);
      if (edge) {
        totalRisk += edge.floodRisk;
        count++;
      }
    }

    return count > 0 ? totalRisk / count : 0;
  }

  getPathDetails(path) {
    let totalDistance = 0;
    let totalRisk = 0;
    let highRiskSegments = 0;
    const segments = [];

    for (let i = 0; i < path.length - 1; i++) {
      const edges = this.getNeighbors(path[i]);
      const edge = edges.find(e => e.neighbor === path[i + 1]);
      
      if (edge) {
        totalDistance += edge.distance;
        totalRisk += edge.floodRisk;
        if (edge.floodRisk > 0.5) highRiskSegments++;
        
        segments.push({
          from: path[i],
          to: path[i + 1],
          distance: edge.distance,
          floodRisk: edge.floodRisk,
          weight: edge.weight
        });
      }
    }

    return {
      totalDistance,
      averageRisk: path.length > 1 ? totalRisk / (path.length - 1) : 0,
      highRiskSegments,
      segments,
      waypoints: path.length
    };
  }

  clear() {
    this.adjacencyList.clear();
    this.nodes.clear();
  }

  getStats() {
    let totalEdges = 0;
    let highRiskEdges = 0;

    for (const edges of this.adjacencyList.values()) {
      totalEdges += edges.length;
      highRiskEdges += edges.filter(e => e.floodRisk > 0.5).length;
    }

    return {
      nodes: this.nodes.size,
      edges: totalEdges / 2,
      highRiskEdges: highRiskEdges / 2,
      intersections: this.getNodesByType('intersection').length,
      hospitals: this.getNodesByType('hospital').length,
      shelters: this.getNodesByType('shelter').length,
    };
  }
}

// ========== GLOBAL GRAPH INSTANCE ==========
const roadNetwork = new RoadNetworkGraph();

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

// ========== LRU CACHE IMPLEMENTATION ==========
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      console.log(`%c💾 LRU CACHE - GET (MISS)`, 'color: #ef4444; font-weight: bold');
      console.log(`   Key: ${key.substring(0, 50)}...`);
      console.log(`   Status: NOT FOUND`);
      return null;
    }
    
    console.log(`%c💾 LRU CACHE - GET (HIT)`, 'color: #10b981; font-weight: bold');
    console.log(`   Key: ${key.substring(0, 50)}...`);
    console.log(`   Action: Moving to most recent position`);
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      console.log(`%c💾 LRU CACHE - UPDATE`, 'color: #06b6d4; font-weight: bold');
      console.log(`   Key: ${key.substring(0, 50)}...`);
      console.log(`   Action: Updating existing entry`);
      this.cache.delete(key);
    } else {
      console.log(`%c💾 LRU CACHE - INSERT`, 'color: #06b6d4; font-weight: bold');
      console.log(`   Key: ${key.substring(0, 50)}...`);
      console.log(`   Action: Adding new entry`);
    }
    
    this.cache.set(key, value);
    
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      console.log(`%c💾 LRU CACHE - EVICTION`, 'color: #f59e0b; font-weight: bold');
      console.log(`   Evicted Key: ${firstKey.substring(0, 50)}...`);
      console.log(`   Reason: Cache capacity exceeded`);
      this.cache.delete(firstKey);
    }
    console.log(`   Current Size: ${this.cache.size}/${this.capacity}`);
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
    console.log(`%c🗄️ HASHMAP - SET OPERATION`, 'color: #8b5cf6; font-weight: bold');
    console.log(`   Key: ${key}`);
    console.log(`   Hospitals Count: ${hospitals.length}`);
    console.log(`   Timestamp: ${new Date().toLocaleTimeString()}`);
    this.map.set(key, {
      hospitals,
      timestamp: Date.now(),
    });
  }

  get(lat, lon, radius) {
    const key = this.generateKey(lat, lon, radius);
    const data = this.map.get(key);
    
    if (!data) {
      console.log(`%c🗄️ HASHMAP - GET OPERATION (MISS)`, 'color: #ef4444; font-weight: bold');
      console.log(`   Key: ${key}`);
      console.log(`   Status: NOT FOUND`);
      return null;
    }
    
    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - data.timestamp > ONE_HOUR) {
      console.log(`%c🗄️ HASHMAP - GET OPERATION (EXPIRED)`, 'color: #f59e0b; font-weight: bold');
      console.log(`   Key: ${key}`);
      console.log(`   Status: CACHE EXPIRED`);
      this.map.delete(key);
      return null;
    }
    
    console.log(`%c🗄️ HASHMAP - GET OPERATION (HIT)`, 'color: #10b981; font-weight: bold');
    console.log(`   Key: ${key}`);
    console.log(`   Hospitals Retrieved: ${data.hospitals.length}`);
    console.log(`   Cache Age: ${Math.floor((Date.now() - data.timestamp) / 1000 / 60)} minutes`);
    return data.hospitals;
  }

  clear() {
    this.map.clear();
  }
}

// ========== FLOOD RISK CACHE ==========
class FloodRiskCache {
  constructor(ttl = 30 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  generateKey(lat, lon) {
    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLon = Math.round(lon * 100) / 100;
    return `${roundedLat},${roundedLon}`;
  }

  set(lat, lon, floodData) {
    const key = this.generateKey(lat, lon);
    console.log(`%c🌊 FLOOD CACHE - SET`, 'color: #06b6d4; font-weight: bold');
    console.log(`   Key: ${key}`);
    console.log(`   Flood: ${floodData?.flood ? 'YES' : 'NO'}`);
    console.log(`   Severity: ${floodData?.severity || 'N/A'}`);
    this.cache.set(key, {
      data: floodData,
      timestamp: Date.now(),
    });
  }

  get(lat, lon) {
    const key = this.generateKey(lat, lon);
    const cached = this.cache.get(key);
    
    if (!cached) {
      console.log(`%c🌊 FLOOD CACHE - MISS`, 'color: #ef4444; font-weight: bold');
      console.log(`   Key: ${key}`);
      return null;
    }
    
    if (Date.now() - cached.timestamp > this.ttl) {
      console.log(`%c🌊 FLOOD CACHE - EXPIRED`, 'color: #f59e0b; font-weight: bold');
      console.log(`   Key: ${key}`);
      this.cache.delete(key);
      return null;
    }
    
    console.log(`%c🌊 FLOOD CACHE - HIT`, 'color: #10b981; font-weight: bold');
    console.log(`   Key: ${key}`);
    console.log(`   Age: ${Math.floor((Date.now() - cached.timestamp) / 1000)}s`);
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// ========== GLOBAL CACHE INSTANCES ==========
const hospitalCache = new HospitalHashMap();
const routeCache = new LRUCache(50);
const floodRiskCache = new FloodRiskCache();

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
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum&timezone=auto`
    );
    
    if (!res.ok) {
      console.warn("Snow data unavailable for this location, defaulting to 0");
      return 0;
    }
    
    const data = await res.json();
    const snowfall = data?.daily?.snowfall_sum?.[0] || 0;
    
    return Math.min(Math.max(snowfall / 10, 0), 1);
  } catch (e) {
    console.warn("NDSI fetch failed:", e.message);
    return 0;
  }
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

// ========== OPTIMIZED FLOOD RISK CHECKING ==========
const checkFloodRisk = async (lat, lon, province) => {
  const cached = floodRiskCache.get(lat, lon);
  if (cached) {
    return cached;
  }

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
    
    floodRiskCache.set(lat, lon, resp.data);
    
    return resp.data;
  } catch (e) {
    console.error("Flood check error:", e);
    return null;
  }
};

// ========== BATCH FLOOD RISK CHECKING (PARALLEL) ==========
const checkFloodRiskBatch = async (points, province) => {
  console.log(`%c🚀 PARALLEL FLOOD CHECKS`, 'color: #3b82f6; font-weight: bold; font-size: 14px');
  console.log(`   Points to check: ${points.length}`);
  console.log(`   Starting parallel processing...`);
  
  const startTime = Date.now();
  
  const promises = points.map(point => 
    checkFloodRisk(point[0], point[1], province).catch(err => {
      console.warn(`Failed to check point ${point[0]}, ${point[1]}:`, err);
      return null;
    })
  );
  
  const results = await Promise.all(promises);
  
  const elapsed = Date.now() - startTime;
  console.log(`%c✅ PARALLEL CHECKS COMPLETE`, 'color: #10b981; font-weight: bold');
  console.log(`   Time: ${elapsed}ms`);
  console.log(`   Speed: ${(points.length / (elapsed / 1000)).toFixed(1)} checks/second`);
  
  return results.map((result, index) => ({
    lat: points[index][0],
    lon: points[index][1],
    floodData: result
  }));
};

const sampleRoutePoints = (routeCoords, numSamples = 8) => {
  if (routeCoords.length <= numSamples) return routeCoords;

  const samples = [];
  const step = Math.floor(routeCoords.length / numSamples);

  for (let i = 0; i < numSamples; i++) {
    samples.push(routeCoords[i * step]);
  }

  if (!samples.some(p => p[0] === routeCoords[0][0])) {
    samples.unshift(routeCoords[0]);
  }
  if (!samples.some(p => p[0] === routeCoords[routeCoords.length - 1][0])) {
    samples.push(routeCoords[routeCoords.length - 1]);
  }

  return samples;
};

// ========== OPTIMIZED GRAPH BUILDING (PARALLEL FLOOD CHECKS) ==========
const buildGraphFromRoute = async (routePath, province, userLocation, hospitals) => {
  console.log(`%c🔨 GRAPH CONSTRUCTION - START`, 'color: #14b8a6; font-weight: bold; font-size: 14px');
  const startTime = Date.now();
  
  roadNetwork.clear();

  roadNetwork.addNode('user', userLocation.lat, userLocation.lon, 'intersection');

  hospitals.forEach(hospital => {
    roadNetwork.addNode(`hospital_${hospital.id}`, hospital.lat, hospital.lon, 'hospital');
  });

  const samples = sampleRoutePoints(routePath, 8);
  console.log(`   Sampled ${samples.length} waypoints from ${routePath.length} route points`);
  
  for (let i = 0; i < samples.length; i++) {
    const nodeId = `intersection_${i}`;
    roadNetwork.addNode(nodeId, samples[i][0], samples[i][1], 'intersection');
  }

  const floodResults = await checkFloodRiskBatch(samples, province);
  
  for (let i = 1; i < samples.length; i++) {
    const prevNodeId = i === 1 ? 'user' : `intersection_${i - 1}`;
    const nodeId = `intersection_${i}`;
    
    const distance = calculateDistance(
      samples[i - 1][0], samples[i - 1][1],
      samples[i][0], samples[i][1]
    );

    const floodData = floodResults[i].floodData;
    const floodRisk = floodData && floodData.flood ? 
      (floodData.severity === 'severe' ? 1.0 : floodData.severity === 'moderate' ? 0.6 : 0.3) : 0;

    roadNetwork.addEdge(prevNodeId, nodeId, distance, floodRisk);
  }

  if (samples.length > 0 && hospitals.length > 0) {
    const lastIntersection = `intersection_${samples.length - 1}`;
    const nearestHospital = hospitals[0];
    const distance = calculateDistance(
      samples[samples.length - 1][0], samples[samples.length - 1][1],
      nearestHospital.lat, nearestHospital.lon
    );
    roadNetwork.addEdge(lastIntersection, `hospital_${nearestHospital.id}`, distance, 0);
  }

  const elapsed = Date.now() - startTime;
  const stats = roadNetwork.getStats();
  console.log(`%c✅ GRAPH CONSTRUCTION - COMPLETE`, 'color: #10b981; font-weight: bold; font-size: 14px');
  console.log(`   Time: ${elapsed}ms`);
  console.log(`   Nodes: ${stats.nodes} | Edges: ${stats.edges}`);
};

// ========== OPTIMIZED ROUTE FETCHING ==========
const getOptimizedRoute = async (start, end, province, setFloodWarnings, avoidFloodZones = []) => {
  console.log(`%c🗺️ ROUTING - START`, 'color: #ec4899; font-weight: bold; font-size: 14px');
  
  if (!ORS_API_KEY) {
    console.error("❌ Missing ORS_API_KEY");
    return null;
  }

  const cacheKey = `${start.lat.toFixed(4)},${start.lon.toFixed(4)}-${end.lat.toFixed(4)},${end.lon.toFixed(4)}-${province}-${avoidFloodZones.length}`;
  
  const cachedRoute = routeCache.get(cacheKey);
  if (cachedRoute) {
    if (setFloodWarnings && cachedRoute.floodWarnings) {
      setFloodWarnings(cachedRoute.floodWarnings);
    }
    return cachedRoute.routePath;
  }

  try {
    let requestBody = {
      coordinates: [[start.lon, start.lat], [end.lon, end.lat]]
    };
    
    if (avoidFloodZones && avoidFloodZones.length > 0) {
      const avoidPolygons = {
        type: "MultiPolygon",
        coordinates: avoidFloodZones.map(zone => {
          const offset = 0.008;
          return [[
            [zone.lon - offset, zone.lat - offset],
            [zone.lon + offset, zone.lat - offset],
            [zone.lon + offset, zone.lat + offset],
            [zone.lon - offset, zone.lat + offset],
            [zone.lon - offset, zone.lat - offset]
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

      const samplePoints = sampleRoutePoints(routePath, 3);
      
      console.log(`%c🔍 FLOOD RISK ANALYSIS`, 'color: #3b82f6; font-weight: bold; font-size: 14px');

      const floodResults = await checkFloodRiskBatch(samplePoints, province);
      const floodChecks = floodResults
        .filter(result => result.floodData && result.floodData.flood)
        .map(result => ({
          lat: result.lat,
          lon: result.lon,
          severity: result.floodData.severity,
          confidence: result.floodData.confidence
        }));

      if (setFloodWarnings && floodChecks.length > 0) {
        setFloodWarnings(floodChecks);
      }

      routeCache.set(cacheKey, {
        routePath,
        floodWarnings: floodChecks,
        timestamp: Date.now(),
      });

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
  const [showSOSModal, setShowSOSModal] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [floodWarnings, setFloodWarnings] = useState([]);
  const [alternateHospitals, setAlternateHospitals] = useState([]);
  const [pathDetails, setPathDetails] = useState(null);
  const [routingTime, setRoutingTime] = useState(null);

  const [cacheStats, setCacheStats] = useState({ hospitals: 0, routes: 0, floodRisk: 0 });
  const [graphStats, setGraphStats] = useState(null);
  const [dummyMode, setDummyMode] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Demo User",
    area: "Lahore",
    province: "Punjab",
  };

  useEffect(() => {
    const updateStats = () => {
      setCacheStats({
        hospitals: hospitalCache.map.size,
        routes: routeCache.size(),
        floodRisk: floodRiskCache.size(),
      });
      setGraphStats(roadNetwork.getStats());
    };
    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

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
    };

    socket.onerror = (err) => {
      console.error("WebSocket Error", err);
    };

    return () => socket.close();
  }, []);

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

      if (dummyMode) {
        console.log("🧪 DUMMY MODE: Using simulated flood data");
        setFeatures(DUMMY_FLOOD_DATA.features);
        setMlResult(DUMMY_FLOOD_DATA.mlResult);
        const explanation = computeThresholdExplanations(DUMMY_FLOOD_DATA.features, user.province);
        setExplain(explanation);
        setLastUpdated(new Date());
        setLoading(false);
        return;
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
    console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'color: #ec4899; font-weight: bold');
    console.log(`%c🚀 ROUTE CALCULATION INITIATED`, 'color: #ec4899; font-weight: bold; font-size: 18px');
    console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'color: #ec4899; font-weight: bold');
    
    const startTime = Date.now();
    
    if (!userLocation) {
      console.log(`%c❌ ERROR: GPS location not available`, 'color: #ef4444; font-weight: bold');
      alert("Please enable GPS to find a route.");
      return;
    }
    
    setRoutingLoading(true);
    setRoutePath(null);
    setNearestHospital(null);
    setFloodWarnings([]);
    setAlternateHospitals([]);
    setPathDetails(null);
    setRoutingTime(null);

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

      // DUMMY MODE SPECIAL HANDLING
      if (dummyMode && DUMMY_FLOOD_DATA.floodedRoute) {
        console.log(`%c🧪 DUMMY MODE ACTIVATED`, 'color: #a855f7; font-weight: bold; font-size: 16px');
        
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
        
        setPathDetails({
          totalDistance: 5.2,
          averageRisk: 0.68,
          highRiskSegments: 2,
          waypoints: 4,
          segments: []
        });
        
        const elapsed = Date.now() - startTime;
        setRoutingTime(elapsed);
        
        alert(`⚠️ [DUMMY MODE] WARNING: Flood risk detected!\n\nRoute calculated in ${elapsed}ms\n${DUMMY_FLOOD_DATA.routeWarnings.length} flood zone(s) detected.`);
        setRoutingLoading(false);
        return;
      }

      // REAL MODE - OPTIMIZED PROCESSING
      console.log(`%c🏥 HOSPITAL ROUTE ANALYSIS - START`, 'color: #ec4899; font-weight: bold; font-size: 16px');
      
      const routeResults = [];
      const initialFloodZones = [];
      
      // Check up to 3 hospitals in parallel
      const hospitalsToCheck = hospitalsWithDistance.slice(0, 3);
      console.log(`%c🚀 PARALLEL HOSPITAL ROUTING`, 'color: #8b5cf6; font-weight: bold; font-size: 14px');
      console.log(`   Checking ${hospitalsToCheck.length} hospitals simultaneously...`);
      
      const routePromises = hospitalsToCheck.map(async (hospital) => {
        const tempWarnings = [];
        const path = await getOptimizedRoute(
          userLocation,
          hospital,
          user.province,
          (warnings) => tempWarnings.push(...warnings),
          []
        );

        if (path) {
          await buildGraphFromRoute(path, user.province, userLocation, hospitalsWithDistance);
          const pathResult = roadNetwork.findShortestPathAStar('user', `hospital_${hospital.id}`, true);

          if (pathResult) {
            const details = roadNetwork.getPathDetails(pathResult.path);
            console.log(`   ${hospital.name}: ${details.totalDistance.toFixed(2)}km, Risk: ${(details.averageRisk * 100).toFixed(0)}%`);
          }

          const highRiskZones = tempWarnings.filter(w => 
            w.severity && ['severe', 'high', 'critical'].includes(w.severity.toLowerCase())
          );
          
          return {
            hospital,
            path,
            warnings: tempWarnings,
            isSafe: tempWarnings.length === 0,
            riskScore: tempWarnings.length,
            highRiskZones
          };
        }
        return null;
      });

      const results = await Promise.all(routePromises);
      routeResults.push(...results.filter(r => r !== null));

      results.forEach(result => {
        if (result && result.highRiskZones) {
          initialFloodZones.push(...result.highRiskZones);
        }
      });

      if (routeResults.length === 0) {
        alert("Could not calculate any driving routes (ORS API error).");
        setRoutingLoading(false);
        return;
      }

      routeResults.sort((a, b) => {
        if (a.isSafe && !b.isSafe) return -1;
        if (!a.isSafe && b.isSafe) return 1;
        if (a.riskScore !== b.riskScore) return a.riskScore - b.riskScore;
        return a.hospital.distance - b.hospital.distance;
      });

      const primaryRoute = routeResults[0];
      
      // Try reroute if primary has high-risk floods
      if (!primaryRoute.isSafe && initialFloodZones.length > 0) {
        console.log(`%c🔄 ATTEMPTING REROUTE`, 'color: #f59e0b; font-weight: bold; font-size: 14px');
        
        const rerouteWarnings = [];
        const reroutePath = await getOptimizedRoute(
          userLocation,
          primaryRoute.hospital,
          user.province,
          (warnings) => rerouteWarnings.push(...warnings),
          initialFloodZones
        );
        
        if (reroutePath && rerouteWarnings.length < primaryRoute.warnings.length) {
          console.log(`%c✅ REROUTE SUCCESSFUL!`, 'color: #10b981; font-weight: bold; font-size: 14px');
          primaryRoute.path = reroutePath;
          primaryRoute.warnings = rerouteWarnings;
          primaryRoute.isSafe = rerouteWarnings.length === 0;
          primaryRoute.riskScore = rerouteWarnings.length;
        }
      }

      await buildGraphFromRoute(primaryRoute.path, user.province, userLocation, hospitalsWithDistance);
      const pathResult = roadNetwork.findShortestPathAStar('user', `hospital_${primaryRoute.hospital.id}`, true);

      if (pathResult) {
        const details = roadNetwork.getPathDetails(pathResult.path);
        setPathDetails(details);
      }

      setNearestHospital(primaryRoute.hospital);
      setRoutePath(primaryRoute.path);
      setFloodWarnings(primaryRoute.warnings);

      const alternates = routeResults.slice(1).map(r => ({
        ...r.hospital,
        routePath: r.path,
        floodWarnings: r.warnings,
        isSafe: r.isSafe,
        riskScore: r.riskScore
      }));
      setAlternateHospitals(alternates);

      const elapsed = Date.now() - startTime;
      setRoutingTime(elapsed);

      if (primaryRoute.isSafe) {
        const floodedCount = routeResults.filter(r => !r.isSafe).length;
        if (floodedCount > 0) {
          alert(`✅ SAFEST ROUTE FOUND in ${elapsed}ms!\n\n${primaryRoute.hospital.name} (${primaryRoute.hospital.distance.toFixed(1)}km)\n\nRoute avoids all flood zones!`);
        } else {
          alert(`✅ Safe route found in ${elapsed}ms\n\n${primaryRoute.hospital.name} (${primaryRoute.hospital.distance.toFixed(1)}km)`);
        }
      } else {
        const safeAlternates = alternates.filter(a => a.isSafe);
        if (safeAlternates.length > 0) {
          alert(`⚠️ Route calculated in ${elapsed}ms\n\nNearest: ${primaryRoute.hospital.name} has ${primaryRoute.warnings.length} flood zone(s)\n\n✅ ${safeAlternates.length} safer alternate(s) available!`);
        } else {
          alert(`⚠️ ALL ROUTES HAVE FLOOD RISK (${elapsed}ms)\n\nBest: ${primaryRoute.hospital.name} (${primaryRoute.warnings.length} zones)\n\n⚠️ Consider waiting for better conditions.`);
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
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <span>🗄️ Cache: {cacheStats.hospitals} hospitals | {cacheStats.routes} routes | {cacheStats.floodRisk} flood</span>
            {graphStats && (
              <span>📊 Graph: {graphStats.nodes} nodes | {graphStats.edges} edges</span>
            )}
            {routingTime && (
              <span className="text-green-400">⚡ {routingTime}ms</span>
            )}
          </div>

          {/* Dummy Mode Toggle */}
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

          {/* Path Details */}
          {pathDetails && (
            <div className="mb-4 bg-slate-800 rounded-lg p-4">
              <h3 className="font-bold mb-2 text-cyan-400">📊 Path Analysis {routingTime && `(${routingTime}ms)`}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Distance:</span>
                  <p className="font-bold">{pathDetails.totalDistance.toFixed(2)} km</p>
                </div>
                <div>
                  <span className="text-gray-400">Avg Risk:</span>
                  <p className={`font-bold ${
                    pathDetails.averageRisk > 0.5 ? 'text-red-400' : 
                    pathDetails.averageRisk > 0.3 ? 'text-orange-400' : 
                    'text-green-400'
                  }`}>
                    {(pathDetails.averageRisk * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Waypoints:</span>
                  <p className="font-bold">{pathDetails.waypoints}</p>
                </div>
                <div>
                  <span className="text-gray-400">High-Risk Segments:</span>
                  <p className={`font-bold ${pathDetails.highRiskSegments > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {pathDetails.highRiskSegments}
                  </p>
                </div>
              </div>
            </div>
          )}

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

      <SOSRequestModal
        isOpen={showSOSModal}
        onClose={() => setShowSOSModal(false)}
        user={user}
      />
    </div>
  );
}

export default CitizenDashboard;
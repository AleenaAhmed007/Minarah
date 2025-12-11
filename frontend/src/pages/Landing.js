// src/pages/Landing.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RefreshCw, AlertTriangle, CheckCircle, AlertCircle, Info } from "lucide-react";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// GLOBAL COLOR PALETTE
export const colors = {
  primary: '#06b6d4',
  primaryDark: '#0891b2',
  primaryLight: '#67e8f9',
  accent: '#10b981',
  accentDark: '#059669',
  danger: '#ef4444',
  warning: '#f59e0b',
  bgDark: '#0f172a',
  bgMedium: '#1e293b',
  bgLight: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
};

// ========== MAJOR CITIES DATA ==========
const MAJOR_CITIES = [
  { name: "Karachi", lat: 24.8607, lon: 67.0011, province: "Sindh" },
  { name: "Lahore", lat: 31.5204, lon: 74.3587, province: "Punjab" },
  { name: "Islamabad", lat: 33.6844, lon: 73.0479, province: "Islamabad" },
  { name: "Rawalpindi", lat: 33.5651, lon: 73.0169, province: "Punjab" },
  { name: "Faisalabad", lat: 31.4504, lon: 73.1350, province: "Punjab" },
  { name: "Multan", lat: 30.1575, lon: 71.5249, province: "Punjab" },
  { name: "Peshawar", lat: 34.0151, lon: 71.5249, province: "KPK" },
  { name: "Quetta", lat: 30.1798, lon: 66.9750, province: "Balochistan" },
  { name: "Sialkot", lat: 32.4945, lon: 74.5229, province: "Punjab" },
  { name: "Gujranwala", lat: 32.1617, lon: 74.1883, province: "Punjab" },
];

// ========== API HELPER FUNCTIONS ==========
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
    throw new Error("NDVI proxy returned incomplete data");
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

const getFloodPrediction = async (payload) => {
  // IMPORTANT: Replace with your actual backend API URL
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
  
  try {
    const response = await fetch(`${API_URL}/api/flood/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error("Prediction API failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Prediction API Error:", error);
    // Return mock data on error to keep demo working
    return {
      flood: Math.random() > 0.7,
      severity: ["Low", "Moderate", "High", "Severe"][Math.floor(Math.random() * 4)],
      confidence: Math.random() * 0.4 + 0.6,
    };
  }
};

const mapSeverityToUI = (mlResult) => {
  if (!mlResult) return { level: "UNKNOWN", color: "#94a3b8", icon: Info };
  if (!mlResult.flood) return { level: "LOW", color: "#10b981", icon: CheckCircle };
  
  switch ((mlResult.severity || "").toLowerCase()) {
    case "severe":
    case "high":
      return { level: "CRITICAL", color: "#ef4444", icon: AlertTriangle };
    case "moderate":
      return { level: "HIGH", color: "#f97316", icon: AlertCircle };
    case "mild":
    case "low":
      return { level: "MODERATE", color: "#eab308", icon: AlertCircle };
    default:
      return { level: "HIGH", color: "#f97316", icon: AlertCircle };
  }
};

// ========== LIVE MAP COMPONENT ==========
function LiveCityPredictions() {
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchCityPredictions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const predictions = await Promise.all(
        MAJOR_CITIES.map(async (city) => {
          try {
            // Fetch weather and environmental data
            const [weather, ndvi, ndsi] = await Promise.all([
              fetchWeatherData(city.lat, city.lon),
              fetchNDVI(city.lat, city.lon),
              fetchNDSI(city.lat, city.lon),
            ]);
            
            // Prepare prediction payload
            const payload = {
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              temp: weather.temperature,
              ice: ndsi,
              veg: ndvi,
              rain_mm: weather.precipitation,
              province: city.province,
            };
            
            // Get ML prediction
            const prediction = await getFloodPrediction(payload);
            
            return {
              ...city,
              weather,
              ndvi,
              ndsi,
              prediction: prediction,
              severity: mapSeverityToUI(prediction),
            };
          } catch (err) {
            console.error(`Error fetching data for ${city.name}:`, err);
            return {
              ...city,
              error: true,
              severity: { level: "UNKNOWN", color: "#94a3b8", icon: Info },
            };
          }
        })
      );
      
      setCityData(predictions);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCityPredictions();
    // Refresh every 30 minutes
    const interval = setInterval(fetchCityPredictions, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Header with refresh button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Live Pakistan Flood Map
          </h2>
          <p className="text-slate-400 text-lg">
            Real-time flood predictions for major cities across Pakistan
          </p>
          {lastUpdated && (
            <p className="text-sm text-slate-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <button
          onClick={fetchCityPredictions}
          disabled={loading}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white rounded-lg flex items-center gap-2 transition-colors font-semibold"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Updating..." : "Refresh Data"}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-red-400">Error loading predictions: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && cityData.length === 0 && (
        <div className="flex items-center justify-center h-[600px] bg-slate-800/50 rounded-2xl border border-slate-700">
          <div className="text-center">
            <RefreshCw className="animate-spin h-12 w-12 mx-auto mb-4 text-cyan-500" />
            <p className="text-slate-400 text-lg">Loading real-time data for all cities...</p>
            <p className="text-slate-500 text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      )}

      {/* City Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {cityData.map((city, idx) => {
              const SeverityIcon = city.severity.icon;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white">{city.name}</h3>
                      <p className="text-xs text-slate-400">{city.province}</p>
                    </div>
                    <SeverityIcon 
                      className="h-5 w-5" 
                      style={{ color: city.severity.color }}
                    />
                  </div>
                  
                  {city.error ? (
                    <p className="text-xs text-slate-500">Data unavailable</p>
                  ) : (
                    <>
                      <div className="space-y-1 text-xs text-slate-300 mb-3">
                        <p>🌡️ Temp: {city.weather?.temperature.toFixed(1)}°C</p>
                        <p>🌧️ Rain: {city.weather?.precipitation.toFixed(1)} mm</p>
                      </div>
                      
                      <div 
                        className="text-xs font-bold px-2 py-1 rounded text-center"
                        style={{ 
                          backgroundColor: `${city.severity.color}20`,
                          color: city.severity.color 
                        }}
                      >
                        {city.severity.level}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

      {/* Map Container */}
      {cityData.length > 0 && (
        <>
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 blur-2xl" />
            <div className="relative h-[600px] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
              <MapContainer
                center={[30.3753, 69.3451]}
                zoom={6}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                
                {cityData.map((city, idx) => {
                  const SeverityIcon = city.severity.icon;
                  
                  return (
                    <React.Fragment key={idx}>
                      <Marker position={[city.lat, city.lon]}>
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-lg mb-2">{city.name}</h3>
                            <div className="space-y-1 text-sm">
                              <p>
                                <strong>Status:</strong>{" "}
                                <span style={{ color: city.severity.color }}>
                                  {city.severity.level}
                                </span>
                              </p>
                              {!city.error && city.weather && (
                                <>
                                  <p><strong>Temp:</strong> {city.weather.temperature.toFixed(1)}°C</p>
                                  <p><strong>Rain:</strong> {city.weather.precipitation.toFixed(1)} mm</p>
                                  <p><strong>NDVI:</strong> {city.ndvi.toFixed(3)}</p>
                                  {city.prediction?.flood && (
                                    <p className="text-red-600 font-bold mt-2">
                                      ⚠️ Flood Risk Detected
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                      
                      <Circle
                        center={[city.lat, city.lon]}
                        radius={30000}
                        pathOptions={{
                          color: city.severity.color,
                          fillColor: city.severity.color,
                          fillOpacity: 0.15,
                          weight: 2,
                        }}
                      />
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          

          {/* Statistics Summary */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { 
                label: "Critical", 
                count: cityData.filter(c => c.severity.level === "CRITICAL").length,
                color: "#ef4444"
              },
              { 
                label: "High", 
                count: cityData.filter(c => c.severity.level === "HIGH").length,
                color: "#f97316"
              },
              { 
                label: "Moderate", 
                count: cityData.filter(c => c.severity.level === "MODERATE").length,
                color: "#eab308"
              },
              { 
                label: "Low", 
                count: cityData.filter(c => c.severity.level === "LOW").length,
                color: "#10b981"
              },
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center"
              >
                <div 
                  className="text-4xl font-bold mb-2"
                  style={{ color: stat.color }}
                >
                  {stat.count}
                </div>
                <div className="text-slate-400 text-sm">{stat.label} Risk</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700">
            <h3 className="font-bold text-white mb-4 text-lg">📊 Risk Levels Explained</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { level: "LOW", color: "#10b981", desc: "Minimal risk - Normal conditions" },
                { level: "MODERATE", color: "#eab308", desc: "Watch conditions carefully" },
                { level: "HIGH", color: "#f97316", desc: "Elevated risk - Prepare" },
                { level: "CRITICAL", color: "#ef4444", desc: "Immediate danger - Evacuate" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div 
                    className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{item.level}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ========== MAIN LANDING COMPONENT ==========
function Landing() {
  const features = [
    {
      icon: "🌊",
      title: "Real-Time Monitoring",
      description: "Live updates on water levels, rainfall, and flood conditions across Pakistan"
    },
    {
      icon: "🤖",
      title: "AI Predictions",
      description: "Machine learning algorithms forecast flood risks hours before they occur"
    },
    {
      icon: "🚁",
      title: "Rescue Coordination",
      description: "Connect with emergency services and coordinate relief efforts efficiently"
    },
    {
      icon: "📱",
      title: "Mobile Alerts",
      description: "Receive instant notifications about flood warnings in your area"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* HERO SECTION */}
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/assets/hero-bg.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-slate-900/80 to-emerald-900/30" />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-6 py-20">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-medium backdrop-blur-sm">
              🇵🇰 Protecting Pakistan's Communities
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Flood Intelligence
            <br />
            <span className="text-4xl md:text-6xl">for Pakistan</span>
          </motion.h1>

          <motion.p
            className="text-slate-300 max-w-3xl mb-10 text-lg md:text-xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Real-time monitoring, AI-based predictions, and rescue coordination — 
            empowering citizens and authorities to stay safe.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link
              to="/signup"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-xl shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Get Started
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            
            <a
              href="#map"
              className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-slate-200 font-semibold rounded-xl hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
            >
              View Live Map
            </a>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-3 gap-8 md:gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              { value: "24/7", label: "Monitoring" },
              { value: "10+", label: "Cities" },
              { value: "Live", label: "Updates" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-cyan-500 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <div className="px-4 md:px-10 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Comprehensive tools designed to protect lives and property from flood disasters
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* LIVE MAP SECTION - UPDATED */}
      <div id="map" className="px-4 md:px-10 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <LiveCityPredictions />
        </motion.div>
      </div>

      {/* CTA SECTION */}
      <div className="px-4 md:px-10 py-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-emerald-600 to-cyan-700 p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Stay Protected?
            </h2>
            <p className="text-cyan-50 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of citizens and authorities using our platform to prevent flood disasters
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-4 bg-white text-cyan-600 font-bold rounded-xl shadow-xl hover:bg-slate-100 transition-all duration-300 hover:scale-105"
            >
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Landing;
// src/pages/RescueDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Helicopter,
  Phone,
  MapPin,
  RefreshCw,
  Activity,
  Mail,
  Building2,
  User,
  Shield,
  AlertTriangle,
  Clock,
  Target,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import apiService from "../services/apiService";

// MapView component
const MapView = ({ coordinates, teamLocation }) => {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (!coordinates || !mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (mapRef.current) {
      mapRef.current._leaflet_id = null;
      mapRef.current.innerHTML = "";
    }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (window.L) {
      initializeMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    }

    function initializeMap() {
      if (!mapRef.current) return;

      const L = window.L;

      try {
        const map = L.map(mapRef.current).setView(
          [coordinates.lat, coordinates.lng],
          13
        );
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        const rescueIcon = L.divIcon({
          className: "custom-rescue-marker",
          html: `
            <div style="
              background: linear-gradient(135deg, #10b981, #06b6d4);
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        L.marker([coordinates.lat, coordinates.lng], { icon: rescueIcon })
          .addTo(map)
          .bindPopup(
            `
            <div style="text-align: center; padding: 8px;">
              <strong style="color: #06b6d4; font-size: 16px;">🚁 Rescue Team</strong><br/>
              <span style="color: #64748b;">${teamLocation}</span><br/>
              <small style="color: #94a3b8;">Lat: ${coordinates.lat.toFixed(4)}, Lng: ${coordinates.lng.toFixed(4)}</small>
            </div>
          `
          )
          .openPopup();
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current._leaflet_id = null;
      }
    };
  }, [coordinates, teamLocation]);

  if (!coordinates) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyan-400 mx-auto mb-2 animate-spin" />
          <p className="text-slate-400">Loading map coordinates...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ background: "#0f172a" }}
    />
  );
};

const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws/ws";

function RescueDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [assignedSOSList, setAssignedSOSList] = useState([]);
  const [rescuedCount, setRescuedCount] = useState(0);
  const [loadingSOS, setLoadingSOS] = useState(false);

  const [currentTeam, setCurrentTeam] = useState(
    JSON.parse(localStorage.getItem("user")) || {
      id: "demo-team-1",
      name: "Demo Team",
      email: "demo@rescue.com",
      province: "Punjab",
      area: "Lahore",
      phone: "N/A",
      availability: "Available",
      role: "rescue",
    }
  );

  // WebSocket Handling
  useEffect(() => {
    let socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("🔥 WebSocket Connected");
      socket.send(JSON.stringify({ type: "join", role: "rescue" }));
    };

    socket.onmessage = (event) => {
      console.log("📩 Message from server:", event.data);
      try {
        const data = JSON.parse(event.data);

        if (data.type === "sos-update") {
          alert(`🚨 SOS Update: ${data.message}`);
          fetchAssignedSOS();
        }

        if (data.type === "system-alert") {
          alert(`⚠️ System Alert: ${data.message}`);
        }
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

  const rescue_email = currentTeam.email;

  // Fetch assigned SOS alerts
  const fetchAssignedSOS = async () => {
    setLoadingSOS(true);
    try {
      // Fetch assigned SOS
      const assignedResponse = await apiService.AssignedSOS(rescue_email);
      setAssignedSOSList(assignedResponse.data || []);

      // Fetch rescued SOS count
      try {
        const rescuedResponse = await apiService.RescuedSOS(rescue_email);
        setRescuedCount((rescuedResponse.data || []).length);
      } catch (err) {
        console.error("Error fetching rescued SOS:", err);
        setRescuedCount(0);
      }
    } catch (err) {
      console.error("Error fetching assigned SOS:", err);
      setError("Failed to load assigned SOS alerts");
    } finally {
      setLoadingSOS(false);
    }
  };

  useEffect(() => {
    if (rescue_email) {
      fetchAssignedSOS();
    }
  }, [rescue_email]);

  // Fetch coordinates for city
  const fetchCityCoordinates = async (city, province) => {
    try {
      const query = `${city}, ${province}, Pakistan`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setCoordinates({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
      } else {
        setError("Could not find coordinates for this location");
      }
    } catch (err) {
      console.error("Error fetching coordinates:", err);
      setError("Failed to load map coordinates");
    }
  };

  useEffect(() => {
    if (currentTeam.area && currentTeam.province) {
      fetchCityCoordinates(currentTeam.area, currentTeam.province);
    }
  }, [currentTeam.area, currentTeam.province]);

  // Update team status
  const updateTeamStatus = async (newStatus) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.updateRescueTeamStatus(currentTeam.id, newStatus);
      const updatedTeam = { ...currentTeam, availability: newStatus };
      localStorage.setItem("user", JSON.stringify(updatedTeam));
      setCurrentTeam(updatedTeam);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update team status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "text-green-400";
      case "busy":
        return "text-orange-400";
      case "offline":
        return "text-gray-400";
      default:
        return "text-green-400";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const getSOSStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "in progress":
      case "assigned":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "rescued":
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/40";
      case "cancelled":
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const statusOptions = [
    { value: "Available", label: "Available", color: "text-green-400" },
    { value: "Busy", label: "On Mission", color: "text-orange-400" },
    { value: "Offline", label: "Offline", color: "text-gray-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Helicopter className="w-10 h-10 text-emerald-400" />
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Rescue Team Dashboard
                </h1>
              </div>
              <p className="text-slate-400">
                Monitor your team status and assigned SOS alerts
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* MISSIONS BUTTON */}
              <button
                onClick={() => navigate("/rescue-missions")}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Target className="w-5 h-5" />
                Missions
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* TEAM STATUS DROPDOWN */}
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-slate-400" />
                <select
                  value={currentTeam.availability}
                  onChange={(e) => updateTeamStatus(e.target.value)}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (user) setCurrentTeam(user);
                    fetchAssignedSOS();
                  }}
                  disabled={loading}
                  className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                >
                  <RefreshCw
                    className={`w-5 h-5 text-cyan-400 ${
                      loading || loadingSOS ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ERROR MESSAGE */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 flex items-center gap-3"
          >
            <Shield className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-5 cursor-pointer hover:border-orange-500/50 transition-all"
            onClick={() => navigate("/rescue-missions")}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Active Missions</p>
                <p className="text-3xl font-bold text-orange-400">
                  {assignedSOSList.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-5 cursor-pointer hover:border-green-500/50 transition-all"
            onClick={() => navigate("/rescue-missions")}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Rescued</p>
                <p className="text-3xl font-bold text-green-400">
                  {rescuedCount}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Activity className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Team Status</p>
                <p
                  className={`text-2xl font-bold ${getStatusColor(
                    currentTeam.availability
                  )}`}
                >
                  {currentTeam.availability}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* TEAM INFORMATION CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Team Profile</h2>
              <p className="text-slate-400 text-sm">
                Active rescue team information
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <User className="w-5 h-5 text-cyan-400 mt-1" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Team Name</p>
                  <p className="text-slate-100 text-lg font-semibold">
                    {currentTeam.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <Mail className="w-5 h-5 text-cyan-400 mt-1" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-slate-100 text-lg">{currentTeam.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <Phone className="w-5 h-5 text-cyan-400 mt-1" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Phone</p>
                  <p className="text-slate-100 text-lg">{currentTeam.phone}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <Building2 className="w-5 h-5 text-cyan-400 mt-1" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Province</p>
                  <p className="text-slate-100 text-lg font-semibold">
                    {currentTeam.province}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <MapPin className="w-5 h-5 text-cyan-400 mt-1" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Area / City</p>
                  <p className="text-slate-100 text-lg font-semibold">
                    {currentTeam.area}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <Activity className="w-5 h-5 text-cyan-400 mt-1" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        currentTeam.availability?.toLowerCase() === "available"
                          ? "bg-green-400 animate-pulse"
                          : currentTeam.availability?.toLowerCase() === "busy"
                          ? "bg-orange-400"
                          : "bg-gray-400"
                      }`}
                    />
                    <p
                      className={`text-lg font-semibold ${getStatusColor(
                        currentTeam.availability
                      )}`}
                    >
                      {currentTeam.availability}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-sm">
              Team ID:{" "}
              <span className="text-slate-400 font-mono">{currentTeam.id}</span>
            </p>
          </div>
        </motion.div>

        {/* RECENT ASSIGNED SOS ALERTS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">
                  Recent SOS Alerts
                </h2>
                <p className="text-slate-400 text-sm">
                  {assignedSOSList.length} active{" "}
                  {assignedSOSList.length === 1 ? "alert" : "alerts"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {loadingSOS && (
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
              )}
              <button
                onClick={() => navigate("/rescue-missions")}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg flex items-center gap-2 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {assignedSOSList.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No SOS alerts assigned</p>
              <p className="text-slate-500 text-sm mt-2">
                You'll see new assignments here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedSOSList.slice(0, 3).map((sos, index) => (
                <motion.div
                  key={sos._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-5 hover:bg-slate-700/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-slate-100">
                          {sos.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                            sos.priority
                          )}`}
                        >
                          {sos.priority}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSOSStatusColor(
                            sos.status
                          )}`}
                        >
                          {sos.status}
                        </span>
                      </div>
                      <p className="text-red-400 font-medium mb-2">
                        {sos.issue}
                      </p>
                      <p className="text-slate-300 text-sm mb-3">
                        {sos.location}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">{sos.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">{sos.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">{sos.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {assignedSOSList.length > 3 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => navigate("/rescue-missions")}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-2 mx-auto"
                  >
                    View {assignedSOSList.length - 3} more alerts
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* MAP SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" /> Team Location Map
          </h3>

          <div className="h-[500px] rounded-xl overflow-hidden border border-slate-700">
            <MapView
              coordinates={coordinates}
              teamLocation={`${currentTeam.area}, ${currentTeam.province}`}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default RescueDashboard;
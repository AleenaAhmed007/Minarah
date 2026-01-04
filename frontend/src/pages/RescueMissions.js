// src/pages/RescueMissions.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Mail,
  Phone,
  User,
  Calendar,
  RefreshCw,
  Shield,
  Target,
  Award,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Navigation,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import apiService from "../services/apiService";

const RescueMissions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assigned");
  const [assignedMissions, setAssignedMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);
  const [filterPriority, setFilterPriority] = useState("all");

  // Get current team from localStorage
  const currentTeam = JSON.parse(localStorage.getItem("user")) || {
    id: "demo-team-1",
    name: "Demo Team",
    email: "demo@rescue.com",
    province: "Punjab",
    area: "Lahore",
  };

  const rescue_email = currentTeam.email;

  // Fetch all missions
  const fetchMissions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch assigned SOS (active missions)
      const assignedResponse = await apiService.AssignedSOS(rescue_email);
      setAssignedMissions(assignedResponse.data || []);

      // Fetch rescued/completed SOS
      const rescuedResponse = await apiService.RescuedSOS(rescue_email);
      setCompletedMissions(rescuedResponse.data || []);
    } catch (err) {
      console.error("Error fetching missions:", err);
      setError("Failed to load missions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rescue_email) {
      fetchMissions();
    }
  }, [rescue_email]);

  // Mark SOS as Rescued (Completed)
  const handleMarkRescued = async (sosId, sosName) => {
    setActionLoading(sosId);
    setError(null);
    setSuccessMessage(null);

    try {
      await apiService.markRescue(sosId);

      // Move the SOS from assigned to completed
      const rescuedSOS = assignedMissions.find((sos) => sos._id === sosId);
      if (rescuedSOS) {
        const updatedSOS = {
          ...rescuedSOS,
          status: "Rescued",
          rescuedAt: new Date().toISOString(),
        };
        setAssignedMissions((prev) => prev.filter((sos) => sos._id !== sosId));
        setCompletedMissions((prev) => [updatedSOS, ...prev]);
      }

      setSuccessMessage(`✅ ${sosName} has been rescued successfully!`);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Error marking rescued:", err);
      setError(`Failed to mark ${sosName} as rescued. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  // ========== PRIORITY SORTING FUNCTION ==========
  // Critical > High > Medium > Low
  const getPriorityValue = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return 1;
      case "high":
        return 2;
      case "medium":
        return 3;
      case "low":
        return 4;
      default:
        return 5; // Unknown priorities go last
    }
  };

  const sortMissionsByPriority = (missions) => {
    return [...missions].sort((a, b) => {
      // First sort by priority
      const priorityDiff = getPriorityValue(a.priority) - getPriorityValue(b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by timestamp (newest first)
      return new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0);
    });
  };

  // Filter missions based on search and priority, then sort
  const filterMissions = (missions) => {
    const filtered = missions.filter((mission) => {
      const matchesSearch =
        mission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.issue?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority =
        filterPriority === "all" ||
        mission.priority?.toLowerCase() === filterPriority.toLowerCase();

      return matchesSearch && matchesPriority;
    });

    // Sort filtered missions by priority
    return sortMissionsByPriority(filtered);
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "assigned":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "in progress":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      case "rescued":
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeSince = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Mission Card Component
  const MissionCard = ({ mission, isCompleted = false }) => {
    const isExpanded = expandedCard === mission._id;
    const isProcessing = actionLoading === mission._id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-slate-700/30 border rounded-xl overflow-hidden transition-all ${
          isCompleted
            ? "border-green-500/30 hover:border-green-500/50"
            : "border-slate-600/50 hover:border-cyan-500/50"
        }`}
      >
        {/* Card Header */}
        <div
          className="p-5 cursor-pointer"
          onClick={() => setExpandedCard(isExpanded ? null : mission._id)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-xl font-semibold text-slate-100">
                  {mission.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                    mission.priority
                  )}`}
                >
                  {mission.priority || "Normal"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    mission.status
                  )}`}
                >
                  {mission.status}
                </span>
              </div>

              <p className="text-red-400 font-medium mb-2">{mission.issue}</p>

              <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{mission.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {getTimeSince(mission.timestamp || mission.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isCompleted && (
                <div className="p-2 bg-green-500/20 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
              )}
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-slate-600/50"
            >
              <div className="p-5 space-y-4">
                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <User className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Victim Name</p>
                      <p className="text-slate-100">{mission.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Email</p>
                      <p className="text-slate-100">{mission.email || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Phone className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Phone</p>
                      <p className="text-slate-100">{mission.phone || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Full Location</p>
                      <p className="text-slate-100">{mission.location}</p>
                    </div>
                  </div>
                </div>

                {/* Coordinates if available */}
                {mission.coordinates && (
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Navigation className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-slate-400 text-xs">GPS Coordinates</p>
                      <p className="text-slate-100">
                        {mission.coordinates.lat?.toFixed(6)},{" "}
                        {mission.coordinates.lng?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Issue Description */}
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">
                    Emergency Details
                  </p>
                  <p className="text-slate-100">{mission.issue}</p>
                </div>

                {/* Timestamps */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Reported At</p>
                      <p className="text-slate-100">
                        {formatDate(mission.timestamp || mission.createdAt)}
                      </p>
                    </div>
                  </div>

                  {isCompleted && (mission.rescuedAt || mission.completedAt) && (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-green-400 text-xs">Rescued At</p>
                        <p className="text-green-300">
                          {formatDate(mission.rescuedAt || mission.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!isCompleted && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRescued(mission._id, mission.name);
                      }}
                      disabled={isProcessing}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        isProcessing
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="w-5 h-5" />
                          Mark as Rescued
                        </>
                      )}
                    </button>

                    {mission.coordinates && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://www.google.com/maps?q=${mission.coordinates.lat},${mission.coordinates.lng}`,
                            "_blank"
                          );
                        }}
                        className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-all flex items-center gap-2"
                      >
                        <Navigation className="w-5 h-5" />
                        Navigate
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/rescue")}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-300" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Rescue Missions
              </h1>
              <p className="text-slate-400">
                Manage your assigned and completed rescue operations
                
              </p>
            </div>
          </div>

          <button
            onClick={fetchMissions}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 text-cyan-400 ${loading ? "animate-spin" : ""}`}
            />
            <span className="text-slate-300">Refresh</span>
          </button>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-green-300">{successMessage}</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Target className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Assigned Missions</p>
                <p className="text-3xl font-bold text-orange-400">
                  {assignedMissions.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Rescued</p>
                <p className="text-3xl font-bold text-green-400">
                  {completedMissions.length}
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
                <Award className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Missions</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {assignedMissions.length + completedMissions.length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex bg-slate-900/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("assigned")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "assigned"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Assigned ({assignedMissions.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "completed"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Rescued ({completedMissions.length})
                </div>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search missions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Info */}
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing{" "}
              <span className="text-cyan-400 font-semibold">
                {filterMissions(activeTab === "assigned" ? assignedMissions : completedMissions).length}
              </span>{" "}
              mission(s)
              <span className="text-orange-400 ml-2 font-medium">
                
              </span>
            </p>
          </div>
        </div>

        {/* Mission List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
                <p className="text-slate-400">Loading missions...</p>
              </div>
            </div>
          ) : activeTab === "assigned" ? (
            filterMissions(assignedMissions).length === 0 ? (
              <div className="text-center py-20">
                <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No assigned missions</p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchTerm || filterPriority !== "all"
                    ? "Try adjusting your filters"
                    : "New assignments will appear here"}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filterMissions(assignedMissions).map((mission) => (
                  <MissionCard
                    key={mission._id}
                    mission={mission}
                    isCompleted={false}
                  />
                ))}
              </AnimatePresence>
            )
          ) : filterMissions(completedMissions).length === 0 ? (
            <div className="text-center py-20">
              <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No rescued missions yet</p>
              <p className="text-slate-500 text-sm mt-2">
                {searchTerm || filterPriority !== "all"
                  ? "Try adjusting your filters"
                  : "Your rescued missions will appear here"}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filterMissions(completedMissions).map((mission) => (
                <MissionCard
                  key={mission._id}
                  mission={mission}
                  isCompleted={true}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default RescueMissions;
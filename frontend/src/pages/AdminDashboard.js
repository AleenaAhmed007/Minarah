// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Hooks
import { useFloodData } from "../hooks/useFloodData";
import { useSOSData } from "../hooks/useSOSData";
import { useRescueTeams } from "../hooks/useRescueTeams";

// Components
import KPICards from "../components/admin/KPICards";
import TabNavigation from "../components/admin/TabNavigation";
import AssignmentModal from "../components/admin/AssignmentModal";

// Tabs
import OverviewTab from "../components/admin/tabs/OverviewTab";
import SOSManagementTab from "../components/admin/tabs/SOSManagementTab";
import RescueTeamsTab from "../components/admin/tabs/RescueTeamsTab";
import AnalyticsTab from "../components/admin/tabs/AnalyticsTab";

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [assignmentModal, setAssignmentModal] = useState(null);
  const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws/ws";

  // Custom hooks
  const { loading: floodLoading, error: floodError, chartData, summary } = useFloodData();
  const { 
    sosList, 
    loading: sosLoading, 
    actionLoading, 
    fetchSOS, 
    assignSOS, 
    markRescued, 
    kpis: sosKpis 
  } = useSOSData();
  const { 
    teams, 
    loading: teamsLoading, 
    fetchTeams, 
    kpis: teamKpis 
  } = useRescueTeams();

  // Initial fetch
  useEffect(() => {
    fetchSOS();
    fetchTeams();
  }, [fetchSOS, fetchTeams]);

  // Handle assignment
  const handleAssign = async (sosId, teamEmail) => {
    await assignSOS(sosId, teamEmail, () => {
      setAssignmentModal(null);
      fetchTeams();
    });
  };

  const handleMarkRescued = async (sosId) => {
    await markRescued(sosId);
    fetchTeams();
  };

  const handleRefresh = () => {
    fetchSOS();
    fetchTeams();
  };

  function setupWebSocket() {
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
  
          // If rescue team sends updates
          if (data.type === "sos-update") {
            alert(`🚨 SOS Update: ${data.message}`);
          }
  
          // If admin / system broadcasts something
          if (data.type === "system-alert") {
            alert(`⚠️ System Alert: ${data.message}`);
          }
        } catch (err) {
          console.error("WS parse error", err);
        }
      };
  
      socket.onclose = () => {
        console.warn("WebSocket closed. Reconnecting in 3s...");
        setTimeout(() => {
          window.location.reload(); // Quick simple reconnect
        }, 3000);
      };
  
      socket.onerror = (err) => {
        console.error("WebSocket Error", err);
      };
  
      return () => socket.close();
    }, []);

  }

  setupWebSocket();
  
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">⚙️</span>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Admin Control Panel
            </h1>
          </div>
          <p className="text-slate-400 ml-14">
            Manage SOS requests, rescue teams, and monitor flood data
          </p>
        </motion.div>

        {/* KPI Cards */}
        <KPICards sosKpis={sosKpis} teamKpis={teamKpis} />

        {/* Tab Navigation */}
        <TabNavigation selectedTab={selectedTab} onTabChange={setSelectedTab} />

        {/* Loading/Error States */}
        {floodLoading && (
          <div className="p-6 bg-slate-800/40 rounded-lg border border-slate-700 text-slate-300 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
            Loading CSV data...
          </div>
        )}
        {floodError && (
          <div className="p-6 bg-red-900/20 rounded-lg border border-red-500/50 text-red-200">
            Error loading CSV: {floodError}
          </div>
        )}

        {/* Tab Content */}
        {selectedTab === "overview" && !floodLoading && (
          <OverviewTab chartData={chartData} summary={summary} />
        )}
        {selectedTab === "sos-management" && (
          <SOSManagementTab
            sosList={sosList}
            loading={sosLoading}
            sosKpis={sosKpis}
            actionLoading={actionLoading}
            onRefresh={handleRefresh}
            onAssign={(sos) => setAssignmentModal(sos)}
            onMarkRescued={handleMarkRescued}
          />
        )}
        {selectedTab === "rescue-teams" && (
          <RescueTeamsTab
            teams={teams}
            loading={teamsLoading}
            teamKpis={teamKpis}
            onRefresh={fetchTeams}
          />
        )}
        {selectedTab === "analytics" && (
          <AnalyticsTab sosList={sosList} sosKpis={sosKpis} teamKpis={teamKpis} />
        )}
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        sos={assignmentModal}
        teams={teams}
        loading={actionLoading === assignmentModal?._id}
        onClose={() => setAssignmentModal(null)}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default AdminDashboard;
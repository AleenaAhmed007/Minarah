// src/components/admin/KPICards.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiService from "../../services/apiService";

const KPICard = ({ title, value, subtitle, gradient, textColor }) => (
  <div
    className={`${gradient} rounded-xl p-4 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer`}
  >
    <div className={`${textColor} text-sm font-medium mb-1`}>{title}</div>
    <div className="text-3xl font-bold text-white">{value}</div>
    <div className="text-xs mt-1 opacity-70">{subtitle}</div>
  </div>
);

const KPICards = () => {
  const [sosKpis, setSosKpis] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    rescued: 0,
  });

  const [teamKpis, setTeamKpis] = useState({
    total: 0,
    available: 0,
    busy: 0,
  });

  // Fetch SOS + TEAM KPI data
  useEffect(() => {
    const loadKpis = async () => {
      try {
        // ========= SOS DATA =========
        const sosRes = await apiService.getallSOS();
        const sos = sosRes.data;

        setSosKpis({
          total: sos.length,
          pending: sos.filter((x) => x.status === "Pending").length,
          assigned: sos.filter((x) => x.status === "Assigned").length,
          rescued: sos.filter((x) => x.status === "Rescued").length,
        });

        // ========= TEAM DATA =========
        const teamRes = await apiService.getAllTeams();
        const teams = teamRes.data;

        setTeamKpis({
          total: teams.length,
          available: teams.filter((x) => x.availability === "Available").length,
          busy: teams.filter((x) => x.availability === "Busy").length,
          offline: teams.filter((x) => x.availability === "offline").length,
        });

      } catch (err) {
        console.error("KPI loading failed:", err);
      }
    };

    loadKpis();
  }, []);

  const cards = [
    {
      title: "Total SOS",
      value: sosKpis.total,
      subtitle: "All requests",
      gradient: "bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30",
      textColor: "text-red-400",
    },
    {
      title: "Pending",
      value: sosKpis.pending,
      subtitle: "Awaiting assignment",
      gradient: "bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30",
      textColor: "text-orange-400",
    },
    {
      title: "Assigned",
      value: sosKpis.assigned,
      subtitle: "In progress",
      gradient: "bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30",
      textColor: "text-blue-400",
    },
    {
      title: "Rescued",
      value: sosKpis.rescued,
      subtitle: "Completed",
      gradient: "bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30",
      textColor: "text-green-400",
    },
    {
      title: "Total Teams",
      value: teamKpis.total,
      subtitle: "Rescue units",
      gradient: "bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30",
      textColor: "text-cyan-400",
    },
    {
      title: "Available",
      value: teamKpis.available,
      subtitle: "Ready to deploy",
      gradient: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30",
      textColor: "text-emerald-400",
    },
    {
      title: "Busy",
      value: teamKpis.busy,
      subtitle: "On mission",
      gradient: "bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30",
      textColor: "text-purple-400",
    },
    {
      title: "Offline",
      value: teamKpis.offline,
      subtitle: "On mission",
      gradient: "bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-purple-500/30",
      textColor: "text-purple-400",
    },


  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
    >
      {cards.map((card, idx) => (
        <KPICard key={idx} {...card} />
      ))}
    </motion.div>
  );

};

export default KPICards;
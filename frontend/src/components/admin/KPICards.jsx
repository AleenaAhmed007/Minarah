// src/components/admin/KPICards.jsx
import React from "react";
import { motion } from "framer-motion";

const KPICard = ({ title, value, subtitle, gradient, textColor }) => (
  <div
    className={`${gradient} rounded-xl p-4 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer`}
  >
    <div className={`${textColor} text-sm font-medium mb-1`}>{title}</div>
    <div className="text-3xl font-bold text-white">{value}</div>
    <div className={`${textColor.replace("400", "300/60")} text-xs mt-1`}>
      {subtitle}
    </div>
  </div>
);

const KPICards = ({ sosKpis, teamKpis }) => {
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
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
    >
      {cards.map((card, idx) => (
        <KPICard key={idx} {...card} />
      ))}
    </motion.div>
  );
};

export default KPICards;
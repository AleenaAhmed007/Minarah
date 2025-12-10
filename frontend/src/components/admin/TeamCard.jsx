// src/components/admin/TeamCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { getAvailabilityColor } from "../../utils/colorHelpers";

const TeamCard = ({ team, index }) => {
  const getBorderColor = () => {
    if (team.availability === "Available") return "border-emerald-500/40 hover:border-emerald-400";
    if (team.availability === "Busy") return "border-orange-500/40 hover:border-orange-400";
    return "border-slate-600 hover:border-slate-500";
  };

  const getAvailabilityPrefix = () => {
    if (team.availability === "Available") return "✓ ";
    if (team.availability === "Busy") return "⏳ ";
    return "○ ";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-slate-700/40 border rounded-xl p-5 transition-all hover:shadow-lg ${getBorderColor()}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-100">{team.name}</h4>
          <p className="text-slate-400 text-sm">{team.email}</p>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getAvailabilityColor(team.availability)}`}>
          {getAvailabilityPrefix()}{team.availability}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <PhoneIcon />
          <span>{team.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <LocationIcon />
          <span>{team.area}, {team.province}</span>
        </div>
      </div>
    </motion.div>
  );
};

const PhoneIcon = () => (
  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default TeamCard;
// src/components/admin/tabs/RescueTeamsTab.jsx
import React from "react";
import { motion } from "framer-motion";
import TeamCard from "../TeamCard";

const RescueTeamsTab = ({ teams, loading, teamKpis, onRefresh }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <span>🚑</span> Rescue Teams Management
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400">{teamKpis.available}</div>
          <div className="text-emerald-300/80 text-sm">Available</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">{teamKpis.busy}</div>
          <div className="text-orange-300/80 text-sm">Busy</div>
        </div>
        <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-slate-400">{teamKpis.offline}</div>
          <div className="text-slate-300/80 text-sm">Offline</div>
        </div>
      </div>

      {/* Teams List */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          All Rescue Teams ({teams.length})
        </h3>

        {loading ? (
          <div className="text-slate-400 text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mx-auto mb-3"></div>
            Loading rescue teams...
          </div>
        ) : teams.length === 0 ? (
          <div className="text-slate-400 text-center py-12 bg-slate-700/30 rounded-lg">
            <span className="text-5xl mb-3 block">👥</span>
            <p className="text-lg">No rescue teams registered</p>
            <p className="text-sm text-slate-500">Add teams to get started</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team, idx) => (
              <TeamCard key={team.id || idx} team={team} index={idx} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RescueTeamsTab;
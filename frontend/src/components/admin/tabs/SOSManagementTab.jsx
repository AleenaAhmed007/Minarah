// src/components/admin/tabs/SOSManagementTab.jsx
import React from "react";
import { motion } from "framer-motion";
import SOSCard from "../SOSCard";

const SOSManagementTab = ({
  sosList,
  loading,
  sosKpis,
  actionLoading,
  onRefresh,
  onAssign,
  onMarkRescued,
}) => {
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
          <span>🆘</span> SOS Request Management
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

      {/* SOS List */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-100">
            All SOS Requests ({sosList.length})
          </h3>
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30">
              {sosKpis.pending} Pending
            </span>
            <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {sosKpis.assigned} Assigned
            </span>
            <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300 border border-green-500/30">
              {sosKpis.rescued} Rescued
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mx-auto mb-3"></div>
            Loading SOS requests...
          </div>
        ) : sosList.length === 0 ? (
          <div className="text-slate-400 text-center py-12 bg-slate-700/30 rounded-lg">
            <span className="text-5xl mb-3 block">✅</span>
            <p className="text-lg">No SOS requests found</p>
            <p className="text-sm text-slate-500">All clear!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {sosList.map((sos, idx) => (
              <SOSCard
                key={sos.id || idx}
                sos={sos}
                index={idx}
                actionLoading={actionLoading}
                onAssign={onAssign}
                onMarkRescued={onMarkRescued}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SOSManagementTab;
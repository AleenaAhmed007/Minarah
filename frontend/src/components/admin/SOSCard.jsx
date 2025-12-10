// src/components/admin/SOSCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { getStatusColor, getPriorityColor, getPriorityIcon } from "../../utils/colorHelpers";

const SOSCard = ({ sos, index, actionLoading, onAssign, onMarkRescued }) => {
  const getBorderColor = () => {
    if (sos.priority === "High") return "border-red-500/50 hover:border-red-400";
    if (sos.priority === "Medium") return "border-yellow-500/50 hover:border-yellow-400";
    return "border-slate-600 hover:border-cyan-500/50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-slate-700/40 border rounded-xl p-5 transition-all hover:shadow-lg ${getBorderColor()}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        {/* SOS Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getPriorityIcon(sos.priority)}</span>
                <h4 className="text-lg font-semibold text-slate-100">{sos.name}</h4>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(sos.priority)}`}>
                  {sos.priority} Priority
                </span>
              </div>
              <p className="text-slate-400 text-sm">{sos.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(sos.status)}`}>
              {sos.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <LocationIcon />
              <span>{sos.area}, {sos.province}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapIcon />
              <span>{sos.location}</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-3">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Issue Description</p>
            <p className="text-slate-200">{sos.issue}</p>
          </div>

          {sos.rescue_team && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <TeamIcon />
              <span className="text-blue-300 font-medium">Assigned Team: {sos.rescue_team}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row lg:flex-col gap-2">
          {sos.status === "Pending" && (
            <ActionButton
              onClick={() => onAssign(sos)}
              loading={actionLoading === sos.id}
              variant="assign"
            />
          )}
          {sos.status === "Assigned" && (
            <ActionButton
              onClick={() => onMarkRescued(sos.id)}
              loading={actionLoading === sos.id}
              variant="rescue"
            />
          )}
          {sos.status === "Rescued" && <CompletedBadge />}
        </div>
      </div>
    </motion.div>
  );
};

// Helper components
const LocationIcon = () => (
  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MapIcon = () => (
  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const TeamIcon = () => (
  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ActionButton = ({ onClick, loading, variant }) => {
  const config = {
    assign: {
      className: "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border-cyan-500/30",
      loadingColor: "border-cyan-400",
      text: "Assign Team",
    },
    rescue: {
      className: "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30",
      loadingColor: "border-emerald-400",
      text: "Mark Rescued",
    },
  };

  const { className, loadingColor, text } = config[variant];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2 ${className} border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 justify-center`}
    >
      {loading ? (
        <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${loadingColor}`}></div>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {text}
    </button>
  );
};

const CompletedBadge = () => (
  <div className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium flex items-center gap-2 justify-center">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    Completed
  </div>
);

export default SOSCard;
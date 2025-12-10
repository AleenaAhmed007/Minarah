// src/components/admin/AssignmentModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPriorityColor } from "../../utils/colorHelpers";

const AssignmentModal = ({ sos, teams, loading, onClose, onAssign }) => {
  const [selectedTeam, setSelectedTeam] = useState("");

  const availableTeams = teams.filter((t) => t.availability === "Available");

  const handleAssign = () => {
    onAssign(sos._id, selectedTeam);
  };

  return (
    <AnimatePresence>
      {sos && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <span>🚑</span> Assign Rescue Team
            </h3>

            {/* SOS Details */}
            <div className="mb-5 p-4 bg-slate-700/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-100 font-semibold text-lg">{sos.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(sos.priority)}`}>
                  {sos.priority} Priority
                </span>
              </div>
              <p className="text-slate-400 text-sm">{sos.email}</p>
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{sos.area}, {sos.province}</span>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-3 mt-2">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Issue</p>
                <p className="text-slate-200 text-sm">{sos.issue}</p>
              </div>
            </div>

            {/* Team Selection */}
            <div className="mb-5">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Select Available Rescue Team
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              >
                <option value="">-- Select a team --</option>
                {availableTeams.map((team) => (
                  <option key={team.id || team.email} value={team.email}>
                    {team.name} - {team.area}, {team.province} ({team.phone})
                  </option>
                ))}
              </select>
              {availableTeams.length === 0 && (
                <p className="text-orange-400 text-sm mt-2 flex items-center gap-1">
                  <WarningIcon />
                  No teams available. All teams are currently busy or offline.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedTeam || loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckIcon />
                    Assign Team
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const WarningIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default AssignmentModal;
// src/utils/colorHelpers.js
export const getStatusColor = (status) => {
  const colors = {
    Pending: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    Assigned: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    Rescued: "bg-green-500/20 text-green-300 border border-green-500/30",
  };
  return colors[status] || "bg-slate-500/20 text-slate-300 border border-slate-500/30";
};

export const getPriorityColor = (priority) => {
  const colors = {
    High: "bg-red-500/20 text-red-300 border border-red-500/30",
    Medium: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    Low: "bg-green-500/20 text-green-300 border border-green-500/30",
  };
  return colors[priority] || "bg-slate-500/20 text-slate-300 border border-slate-500/30";
};

export const getAvailabilityColor = (availability) => {
  const colors = {
    Available: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    Busy: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    Offline: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  };
  return colors[availability] || "bg-slate-500/20 text-slate-300 border border-slate-500/30";
};

export const getPriorityIcon = (priority) => {
  const icons = { High: "🔴", Medium: "🟡", Low: "🟢" };
  return icons[priority] || "⚪";
};
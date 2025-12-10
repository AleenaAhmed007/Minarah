// src/components/admin/charts/ChartCard.jsx
import React from "react";

const ChartCard = ({ title, icon, children, className = "" }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-2xl ${className}`}>
    <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
      {icon && <span>{icon}</span>}
      {title}
    </h2>
    {children}
  </div>
);

export default ChartCard;
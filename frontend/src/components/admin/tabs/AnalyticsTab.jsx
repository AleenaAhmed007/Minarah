// src/components/admin/tabs/AnalyticsTab.jsx
import React from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import { chartOptions } from "../../../utils/chartConfig";

const AnalyticsTab = ({ sosList, sosKpis, teamKpis }) => {
  const sosByProvinceData = {
    labels: [...new Set(sosList.map((s) => s.province))],
    datasets: [
      {
        label: "SOS Requests",
        data: [...new Set(sosList.map((s) => s.province))].map(
          (province) => sosList.filter((s) => s.province === province).length
        ),
        backgroundColor: "rgba(6, 182, 212, 0.85)",
        borderRadius: 8,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* SOS by Priority */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-2xl">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span>⚡</span> SOS by Priority
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-slate-300">High</span>
              </div>
              <span className="text-xl font-bold text-red-400">
                {sosList.filter((s) => s.priority === "High").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-slate-300">Medium</span>
              </div>
              <span className="text-xl font-bold text-yellow-400">
                {sosList.filter((s) => s.priority === "Medium").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-slate-300">Low</span>
              </div>
              <span className="text-xl font-bold text-green-400">
                {sosList.filter((s) => s.priority === "Low").length}
              </span>
            </div>
          </div>
        </div>

        {/* SOS by Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-2xl">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span>📊</span> SOS by Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-slate-300">Pending</span>
              </div>
              <span className="text-xl font-bold text-orange-400">{sosKpis.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-slate-300">Assigned</span>
              </div>
              <span className="text-xl font-bold text-blue-400">{sosKpis.assigned}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-slate-300">Rescued</span>
              </div>
              <span className="text-xl font-bold text-green-400">{sosKpis.rescued}</span>
            </div>
          </div>
        </div>

        {/* Teams Overview */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-2xl">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span>🚑</span> Teams Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300">Available</span>
              </div>
              <span className="text-xl font-bold text-emerald-400">{teamKpis.available}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-slate-300">Busy</span>
              </div>
              <span className="text-xl font-bold text-orange-400">{teamKpis.busy}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                <span className="text-slate-300">Offline</span>
              </div>
              <span className="text-xl font-bold text-slate-400">{teamKpis.offline}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SOS by Province Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">SOS Requests by Province</h3>
        {sosList.length > 0 ? (
          <Bar data={sosByProvinceData} options={chartOptions} />
        ) : (
          <div className="text-slate-400 text-center py-12">No SOS data available</div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsTab;
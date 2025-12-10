// src/components/admin/tabs/OverviewTab.jsx
import React from "react";
import { motion } from "framer-motion";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import ChartCard from "../charts/ChartCard";
import { chartOptions, pieOptions } from "../../../utils/chartConfig";

const OverviewTab = ({ chartData, summary }) => {
  const {
    labelsByDate,
    tempSeries,
    vegSeries,
    floodCountsByProvince,
    avgRainByProvince,
    floodVsNoFlood,
  } = chartData;

  const tempChartData = {
    labels: labelsByDate,
    datasets: [
      {
        label: "Average Temp (°C)",
        data: tempSeries,
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "rgb(239, 68, 68)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const vegChartData = {
    labels: labelsByDate,
    datasets: [
      {
        label: "Average Vegetation Index",
        data: vegSeries,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const provinces = Object.keys(floodCountsByProvince || {});
  const floodCountsData = {
    labels: provinces,
    datasets: [
      {
        label: "Flood Occurrences",
        data: provinces.map((p) => floodCountsByProvince[p] || 0),
        backgroundColor: provinces.map((_, i) => {
          const colorPalette = [
            "rgba(99, 102, 241, 0.85)",
            "rgba(168, 85, 247, 0.85)",
            "rgba(236, 72, 153, 0.85)",
            "rgba(251, 146, 60, 0.85)",
          ];
          return colorPalette[i % colorPalette.length];
        }),
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 50,
      },
    ],
  };

  const avgRainProvinces = Object.keys(avgRainByProvince || {});
  const avgRainData = {
    labels: avgRainProvinces,
    datasets: [
      {
        label: "Average Rainfall (mm)",
        data: avgRainProvinces.map((p) => avgRainByProvince[p] || 0),
        backgroundColor: avgRainProvinces.map((_, i) => {
          const colorPalette = [
            "rgba(6, 182, 212, 0.85)",
            "rgba(14, 165, 233, 0.85)",
            "rgba(59, 130, 246, 0.85)",
            "rgba(99, 102, 241, 0.85)",
          ];
          return colorPalette[i % colorPalette.length];
        }),
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 50,
      },
    ],
  };

  const floodPieData = {
    labels: ["No Flood", "Flood"],
    datasets: [
      {
        data: [floodVsNoFlood.no || 0, floodVsNoFlood.yes || 0],
        backgroundColor: ["rgba(16, 185, 129, 0.9)", "rgba(239, 68, 68, 0.9)"],
        borderColor: ["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.2)"],
        borderWidth: 3,
        hoverOffset: 15,
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
      {/* Data Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📊</span>
            <div>
              <p className="text-slate-400 text-sm">Total Records</p>
              <p className="text-2xl font-bold text-slate-100">{summary.rows}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🗺️</span>
            <div>
              <p className="text-slate-400 text-sm">Provinces</p>
              <p className="text-2xl font-bold text-slate-100">{summary.provinces-1}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🌊</span>
            <div>
              <p className="text-slate-400 text-sm">Flood Events</p>
              <p className="text-2xl font-bold text-slate-100">{summary.floods}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Temperature Trends" icon="🌡️">
          {tempSeries.length > 0 ? (
            <Line data={tempChartData} options={chartOptions} />
          ) : (
            <div className="text-slate-400 text-center py-12">No temperature data available</div>
          )}
        </ChartCard>

        <ChartCard title="Vegetation Index" icon="🌱">
          {vegSeries.length > 0 ? (
            <Line data={vegChartData} options={chartOptions} />
          ) : (
            <div className="text-slate-400 text-center py-12">No vegetation data available</div>
          )}
        </ChartCard>

        <ChartCard title="Flood Occurrences by Province" icon="🌊">
          {provinces.length > 0 ? (
            <Bar data={floodCountsData} options={chartOptions} />
          ) : (
            <div className="text-slate-400 text-center py-12">No flood data available</div>
          )}
        </ChartCard>

        <ChartCard title="Average Rainfall by Province" icon="☔">
          {avgRainProvinces.length > 0 ? (
            <Bar data={avgRainData} options={chartOptions} />
          ) : (
            <div className="text-slate-400 text-center py-12">No rainfall data available</div>
          )}
        </ChartCard>
      </div>

      {/* Flood Distribution */}
      <ChartCard title="Flood Distribution" icon="📈" className="max-w-md mx-auto">
        {floodVsNoFlood.yes + floodVsNoFlood.no > 0 ? (
          <Doughnut data={floodPieData} options={pieOptions} />
        ) : (
          <div className="text-slate-400 text-center py-12">No distribution data available</div>
        )}
      </ChartCard>
    </motion.div>
  );
};

export default OverviewTab;
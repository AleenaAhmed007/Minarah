// src/utils/chartConfig.js
export const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: {
        color: "#e2e8f0",
        font: { size: 13, weight: "500" },
        padding: 15,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.98)",
      titleColor: "#f1f5f9",
      bodyColor: "#e2e8f0",
      borderColor: "#475569",
      borderWidth: 1.5,
      padding: 14,
      cornerRadius: 10,
      titleFont: { size: 14, weight: "600" },
      bodyFont: { size: 13 },
      displayColors: true,
      boxWidth: 12,
      boxHeight: 12,
      boxPadding: 6,
    },
  },
  scales: {
    x: {
      ticks: { color: "#94a3b8", font: { size: 12 }, padding: 8 },
      grid: { color: "rgba(148, 163, 184, 0.08)", drawBorder: false },
    },
    y: {
      ticks: { color: "#94a3b8", font: { size: 12 }, padding: 8 },
      grid: { color: "rgba(148, 163, 184, 0.08)", drawBorder: false },
    },
  },
};

export const pieOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#e2e8f0",
        font: { size: 13, weight: "500" },
        padding: 15,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.98)",
      titleColor: "#f1f5f9",
      bodyColor: "#e2e8f0",
      borderColor: "#475569",
      borderWidth: 1.5,
      padding: 14,
      cornerRadius: 10,
      callbacks: {
        label: function (context) {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((context.parsed / total) * 100).toFixed(1);
          return `${context.label}: ${context.parsed} (${percentage}%)`;
        },
      },
    },
  },
};
// src/components/admin/TabNavigation.jsx
import React from "react";
import { motion } from "framer-motion";
import { TABS } from "../../utils/constants";

const TabNavigation = ({ selectedTab, onTabChange }) => {
  const formatTabName = (tab) =>
    tab
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-wrap gap-2"
    >
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
            selectedTab === tab
              ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30 scale-105"
              : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600 hover:border-slate-500"
          }`}
        >
          {formatTabName(tab)}
        </button>
      ))}
    </motion.div>
  );
};

export default TabNavigation;
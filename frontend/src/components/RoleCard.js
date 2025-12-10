import React from "react";
import { motion } from "framer-motion";

function RoleCard({ title, description, icon, selected, onSelect }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-xl border cursor-pointer transition shadow-lg
        ${selected ? "border-aquaBlue shadow-aquaBlue/40" : "border-gray-600"}`}
      onClick={onSelect}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <img src={icon} alt="icon" className="w-16 h-16" />
        <h3 className="text-xl font-semibold neon-text">{title}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>
    </motion.div>
  );
}

export default RoleCard;

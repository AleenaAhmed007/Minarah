import React from "react";
import { motion, AnimatePresence } from "framer-motion";

function AlertPopup({ message, show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-6 right-6 bg-neonRed/90 text-white px-6 py-4 rounded-xl shadow-lg z-50"
        >
          <div className="flex justify-between items-center gap-4">
            <p>{message}</p>
            <button onClick={onClose} className="font-bold hover:text-gray-300">X</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AlertPopup;

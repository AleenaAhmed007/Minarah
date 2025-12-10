import React from "react";

function Loader({ size = 12 }) {
  return (
    <div className="flex justify-center items-center py-6">
      <div
        className={`w-${size} h-${size} border-4 border-t-aquaBlue border-b-neonRed rounded-full animate-spin`}
      />
    </div>
  );
}

export default Loader;

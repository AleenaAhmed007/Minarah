import React from "react";

function AnimatedRain() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
      <div className="rain"></div>

      <style>{`
        .rain {
          position: absolute;
          width: 200%;
          height: 200%;
          background: url('/assets/rain.png');
          background-size: contain;
          animation: rainMove 8s linear infinite;
        }

        @keyframes rainMove {
          0% { transform: translateY(-10%); }
          100% { transform: translateY(10%); }
        }
      `}</style>
    </div>
  );
}

export default AnimatedRain;

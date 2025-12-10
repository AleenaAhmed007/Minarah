import React, { useState } from "react";
import CitizenSignupForm from "../components/CiteizenSignupForm";
import RescueSignupForm from "../components/RescueSignupForm";

function Signup() {
  const [role, setRole] = useState(null);

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-900 px-4 py-10">
      <div className="bg-slate-800/50 p-10 rounded-xl border border-slate-700 shadow-xl max-w-xl w-full">
        
        <h1 className="text-3xl font-bold text-center text-cyan-300 mb-6">
          Create Your Account
        </h1>

        {!role && (
          <>
            <p className="text-slate-300 text-center mb-6">
              Choose how you want to sign up
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={() => setRole("citizen")}
                className="p-6 bg-slate-700/40 rounded-lg border border-cyan-500/30 hover:border-cyan-500 transition"
              >
                <div className="text-4xl mb-2">👤</div>
                <h2 className="text-xl font-semibold text-slate-200">
                  Citizen
                </h2>
                <p className="text-slate-400 text-sm">
                  Get alerts & request rescue
                </p>
              </button>

              <button
                onClick={() => setRole("rescue")}
                className="p-6 bg-slate-700/40 rounded-lg border border-emerald-500/30 hover:border-emerald-500 transition"
              >
                <div className="text-4xl mb-2">🚁</div>
                <h2 className="text-xl font-semibold text-slate-200">
                  Rescue Team
                </h2>
                <p className="text-slate-400 text-sm">
                  Respond to emergency requests
                </p>
              </button>
            </div>
          </>
        )}

        {/* POPUP FORMS */}
        {role === "citizen" && <CitizenSignupForm onBack={() => setRole(null)} />}
        {role === "rescue" && <RescueSignupForm onBack={() => setRole(null)} />}
      
      </div>
    </div>
  );
}

export default Signup;

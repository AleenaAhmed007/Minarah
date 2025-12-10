import React, { useState } from "react";
import api from "../services/apiService";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const update = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // --- Citizen / Admin Login ---
  const handleCitizenLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.login(form);
      const user = res.data;

      // Save user
      localStorage.setItem("user", JSON.stringify(user));

      // Admin check
      if (user.isAdmin === true) {
        user.role = "admin";
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/admin");
        return;
      }

      // Default citizen redirect
      navigate("/citizen");
    } catch (err) {
      alert(err.response?.data?.detail || "Citizen Login Failed!");
    }
  };

  // --- Rescue Login ---
  const handleRescueLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.loginRescue(form);
      const user = res.data;

      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, role: "rescue" })
      );

      navigate("/rescue");
    } catch (err) {
      alert(err.response?.data?.detail || "Rescue Login Failed!");
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h2 className="text-2xl mb-4 text-center font-bold">Login</h2>

      <input
        name="email"
        placeholder="Email"
        onChange={update}
        className="w-full p-3 mb-3 bg-slate-700 text-white rounded"
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={update}
        className="w-full p-3 mb-5 bg-slate-700 text-white rounded"
      />

      <div className="flex gap-4">
        <button
          onClick={handleCitizenLogin}
          className="w-1/2 py-3 bg-cyan-500 rounded text-white font-bold"
        >
          Login as Citizen
        </button>

        <button
          onClick={handleRescueLogin}
          className="w-1/2 py-3 bg-emerald-500 rounded text-white font-bold"
        >
          Login as Rescue
        </button>
      </div>
    </div>
  );
}

export default Login;

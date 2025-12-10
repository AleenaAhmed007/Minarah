import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/apiService";

function CitizenSignupForm({ onBack }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    province: "",
    area: "",
    password: ""
  });

  const update = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const res = await api.signup(form);
      alert("Account Created Successfully!");

      // 🔥 Redirect to Login page
      navigate("/login");

      console.log(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Signup Failed");
    }
  };

  return (
    <div className="mt-6">
      <button onClick={onBack} className="text-cyan-400 mb-4">
        ← Back
      </button>

      <h2 className="text-xl font-bold text-slate-200 mb-4">
        Citizen Sign Up
      </h2>

      <div className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          onChange={update}
          className="w-full p-3 rounded bg-slate-700 text-slate-200"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={update}
          className="w-full p-3 rounded bg-slate-700 text-slate-200"
        />

        <input
          name="province"
          placeholder="Province"
          onChange={update}
          className="w-full p-3 rounded bg-slate-700 text-slate-200"
        />

        <input
          name="area"
          placeholder="Area"
          onChange={update}
          className="w-full p-3 rounded bg-slate-700 text-slate-200"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={update}
          className="w-full p-3 rounded bg-slate-700 text-slate-200"
        />

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 rounded text-white font-bold"
        >
          Create Citizen Account
        </button>
      </div>
    </div>
  );
}

export default CitizenSignupForm;

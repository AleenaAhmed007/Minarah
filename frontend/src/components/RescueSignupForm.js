import React, { useState } from "react";
import api from "../services/apiService"; // <-- your axios instance
import axios from "axios";

function RescueSignupForm({ onBack }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    province: "",
    area: "",
    phone: "",
  });

  const update = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      console.log("Sending Rescue Signup Data:", form);

      // Use the axios instance from apiService
      const res = await axios.post("http://localhost:8000/rescue/rescue/register",form)

      alert("Rescue Team Registered Successfully!");
      console.log(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed");
      console.error(err);
    }
  };

  return (
    <div className="mt-6">
      <button onClick={onBack} className="text-emerald-400 mb-4">
        ← Back
      </button>

      <h2 className="text-xl font-bold text-slate-200 mb-4">
        Rescue Team Sign Up
      </h2>

      <div className="space-y-4">
        <input
          name="name"
          placeholder="Rescue Team Name"
          onChange={update}
          className="w-full p-3 rounded bg-slate-700 text-slate-200"
        />

        <input
          name="email"
          placeholder="Team Email"
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
          placeholder="Area / Zone"
          onChange={update}
          className="w-full p-3 rounded bg-slate-700 text-slate-200"
        />

        <input
          name="phone"
          placeholder="Team Phone Number"
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
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded text-white font-bold"
        >
          Create Rescue Account
        </button>
      </div>
    </div>
  );
}

export default RescueSignupForm;

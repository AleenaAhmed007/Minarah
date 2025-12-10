import React from "react";
import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import CitizenLogin from "./pages/Login";

import CitizenDashboard from "./pages/CitizenDashboard";
import RescueDashboard from "./pages/RescueDashboard";
import RescueMissions from "./pages/RescueMissions"; // Already imported!
import AdminDashboard from "./pages/AdminDashboard";

import AboutUs from "./pages/AboutUs";
import FloodCauses from "./pages/FloodCauses";
import FloodHistory from "./pages/FloodHistory";
import FloodPrevention from "./pages/FloodPrevention";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-deepBlue text-white">
      <Navbar />

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/FloodHistory" element={<FloodHistory />} />
        <Route path="/FloodCauses" element={<FloodCauses />} />
        <Route path="/FloodPrevention" element={<FloodPrevention />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login/citizen" element={<CitizenLogin />} />

        {/* Protected Role-Based Dashboards */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute role="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />

        {/* Rescue Team Routes */}
        <Route
          path="/rescue"
          element={
            <ProtectedRoute role="rescue">
              <RescueDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADD THIS NEW ROUTE FOR RESCUE MISSIONS */}
        <Route
          path="/rescue-missions"
          element={
            <ProtectedRoute role="rescue">
              <RescueMissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
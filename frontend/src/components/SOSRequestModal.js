// src/components/SOSRequestModal.jsx
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  X,
  MapPin,
  User,
  FileText,
  Users,
} from "lucide-react";
import apiService from "../services/apiService";

function SOSRequestModal({ isOpen, onClose, user }) {
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);
  const [rescueTeams, setRescueTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [sosForm, setSosForm] = useState({
    name: user.name || "",
    province: user.province || "",
    area: user.area || "",
    location: user.area || "",
    priority: "Medium",
    issue: "",
  });

  // Fetch rescue teams when modal opens

  

  const handleSOSSubmit = async (e) => {
    e.preventDefault();
    setSosLoading(true);
    setSosSuccess(false);

    try {
      const payload = {
        email: user.email || "",
        name: sosForm.name,
        province: sosForm.province,
        area: sosForm.area,
        location: sosForm.location,
        issue: sosForm.issue,
        priority: sosForm.priority,
        status: "Pending",
      };

      console.log("Sending payload:", payload);

      await apiService.createSOSRequest(payload);
      setSosSuccess(true);

      // Reset after success
      setTimeout(() => {
        onClose();
        setSosSuccess(false);
        setSosForm({
          email: user.email || "",
          name: user.name || "",
          province: user.province || "",
          area: user.area || "",
          location: user.area || "",
          priority: "Medium",
          issue: "",
        });
      }, 2000);
    } catch (err) {
      console.error("SOS request error:", err);
      alert("Failed to send SOS request. Please try again.");
    } finally {
      setSosLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <h2 className="text-2xl font-bold">Emergency SOS Request</h2>
        </div>

        {sosSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-green-400">SOS Request Sent!</p>
            <p className="text-slate-400 mt-2">Rescue teams have been notified</p>
          </div>
        ) : (
          <form onSubmit={handleSOSSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Name
              </label>
              <input
                type="text"
                value={sosForm.name}
                onChange={(e) => setSosForm({ ...sosForm, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Province
              </label>
              <select
                value={sosForm.province}
                onChange={(e) => setSosForm({ ...sosForm, province: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Province</option>
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="Balochistan">Balochistan</option>
                <option value="KPK">KPK</option>
                <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                <option value="Islamabad">Federal</option>
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Area/City
              </label>
              <input
                type="text"
                value={sosForm.area}
                onChange={(e) => setSosForm({ ...sosForm, area: e.target.value })}
                placeholder="e.g., Lahore, Karachi"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Specific Location
              </label>
              <input
                type="text"
                value={sosForm.location}
                onChange={(e) => setSosForm({ ...sosForm, location: e.target.value })}
                placeholder="e.g., Street name, landmark"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Priority Level
              </label>
              <select
                value={sosForm.priority}
                onChange={(e) => setSosForm({ ...sosForm, priority: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Issue */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Emergency Details
              </label>
              <textarea
                value={sosForm.issue}
                onChange={(e) => setSosForm({ ...sosForm, issue: e.target.value })}
                placeholder="Describe the emergency situation in detail..."
                rows="4"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={sosLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {sosLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send SOS"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SOSRequestModal;
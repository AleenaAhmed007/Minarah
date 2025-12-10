// src/hooks/useSOSData.js
import { useState, useCallback } from "react";
import api from "../services/apiService";

export const useSOSData = () => {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSOS = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.fetchSOSQueue();
      setSosList(response.data || []);
    } catch (error) {
      console.error("Error fetching SOS:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const assignSOS = useCallback(async (sosId, teamEmail, onSuccess) => {
    if (!teamEmail) {
      alert("Please select a rescue team");
      return;
    }
    setActionLoading(sosId);
    try {
      await api.assignSocToRescue(sosId, teamEmail);
      await fetchSOS();
      onSuccess?.();
    } catch (error) {
      console.error("Error assigning SOS:", error);
      alert(`Failed to assign SOS: ${error.response?.data?.detail || error.message}`);
    } finally {
      setActionLoading(null);
    }
  }, [fetchSOS]);

  const markRescued = useCallback(async (sosId) => {
    setActionLoading(sosId);
    try {
      await api.rescuedSOS(sosId);
      await fetchSOS();
    } catch (error) {
      console.error("Error marking as rescued:", error);
      alert("Failed to mark as rescued. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }, [fetchSOS]);

  const kpis = {
    total: sosList.length,
    pending: sosList.filter((s) => s.status === "Pending").length,
    assigned: sosList.filter((s) => s.status === "Assigned").length,
    rescued: sosList.filter((s) => s.status === "Rescued").length,
  };

  return { sosList, loading, actionLoading, fetchSOS, assignSOS, markRescued, kpis };
};
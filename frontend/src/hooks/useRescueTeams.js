// src/hooks/useRescueTeams.js
import { useState, useCallback } from "react";
import api from "../services/apiService";

export const useRescueTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getAvailableRescueTeams();
      setTeams(response.data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const kpis = {
    total: teams.length,
    available: teams.filter((t) => t.availability === "Available").length,
    busy: teams.filter((t) => t.availability === "Busy").length,
    offline: teams.filter((t) => t.availability === "Offline").length,
  };

  const availableTeams = teams.filter((t) => t.availability === "Available");

  return { teams, loading, fetchTeams, kpis, availableTeams };
};
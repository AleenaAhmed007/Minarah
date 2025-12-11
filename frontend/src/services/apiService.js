import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Attach token
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("minarah_user");
  if (raw) {
    const { token } = JSON.parse(raw);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // ==== USER AUTH ====
  signup: (data) => api.post("/users/user/signup", data),
  login: (data) => api.post("/users/user/login", data),

  // RESCUE TEAM AUTH
  signupRescue: (data) => api.post("/rescue/rescue/signup", data),
  loginRescue: (data) => api.post("/rescue/rescue/login", data),
  // Add to your apiService.js
  getAvailableRescueTeams: () => api.get('/rescue/rescue/available'),
  updateRescueTeamStatus: (teamId, status) => api.put(`/rescue/rescue/status/${teamId}?status=${status}`),
  getAllTeams: () => api.get(`/rescue/rescue/allTeams`),

  // ==== FLOOD ====
  // Your backend expects POST with JSON input, NOT GET
  getFloodPrediction: (payload) => api.post("/api/flood/predict", payload),

  // ==== SOS ====
  createSOSRequest: (payload) => api.post("/sos/sos/create", payload),
  // In your apiService.js file
assignSocToRescue: (sosId, teamEmail) => {
  return api.put(`/sos/sos/assign/${sosId}?team_email=${encodeURIComponent(teamEmail)}`);
},
  fetchSOSQueue: () => api.get("/sos/sos/pending"),
  rescuedSOS: (sosId) => api.put(`/sos/sos/rescue/${sosId}`),
  AssignedSOS: (rescue_email) => api.get(`/sos/sos/assigned/${rescue_email}`),
  markRescue: (sosId) => api.put(`/sos/sos/rescued/${sosId}`),
  RescuedSOS: (rescue_email) => api.get(`/sos/sos/rescuedSOS?rescue_email=${encodeURIComponent(rescue_email)}`),
  getallSOS: () => api.get("/sos/sos/sos"),

  // ==== MAPS ====
  fetchPakistanGeo: () => api.get("/geo/pakistan"),
  fetchDistrictRisk: () => api.get("/geo/district-risk"),
};
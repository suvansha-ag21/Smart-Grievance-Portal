import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (currentUser?.token) {
    config.headers.Authorization = `Bearer ${currentUser.token}`;
  }
  return config;
});

export default api;

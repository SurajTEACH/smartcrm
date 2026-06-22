import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_UR || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 401) {
      // Token expired or invalid — auto logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("Session expired. Please login again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } else if (status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (status === 429) {
      toast.error("Too many requests. Please slow down.");
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;

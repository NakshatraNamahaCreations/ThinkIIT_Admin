import axios from "axios";
import { config } from "./config";

const api = axios.create({
  baseURL: config.INSTITUTE_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach Token to Every Request
api.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// ✅ Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;

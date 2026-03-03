import axios from "axios";

// API configuration using VITE environment variable
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

console.log(" API Base URL:", baseURL);

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Don't log sensitive data in production
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        hasData: !!config.data,
        hasParams: !!config.params,
        headers: config.headers
      });
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error("API Response Error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
    }

    // Handle network errors
    if (!error.response) {
      error.message = "Serverga ulanib bo'lmadi. Internet aloqangizni tekshiring.";
    }

    return Promise.reject(error);
  }
);

export function setAuth(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

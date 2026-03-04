import axios from "axios";

// API configuration using VITE environment variable
const baseURL = import.meta.env.VITE_API_URL;

console.log("🔍 API Base URL:", baseURL);
console.log("🌍 Environment:", import.meta.env.MODE);
console.log("🔗 VITE_API_URL:", import.meta.env.VITE_API_URL || "undefined");

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Debug login requests specifically
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      console.log("🔐 Auth Request Debug:", {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasData: !!config.data,
        withCredentials: config.withCredentials,
        environment: import.meta.env.MODE,
        viteApiUrl: import.meta.env.VITE_API_URL || "undefined",
        headers: config.headers
      });
    }
    
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
        url: error.config?.url,
        baseURL: error.config?.baseURL
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

import axios from "axios";

// Development: vite proxy /api ga yo'naltiradi (http://localhost:3000/api)
// Production: VITE_API_BASE_URL o'rnatilishi kerak
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = "Serverga ulanib bo'lmadi. Internet aloqangizni tekshiring.";
    }
    return Promise.reject(error);
  }
);

export function setAuth(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

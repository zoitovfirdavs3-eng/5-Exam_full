import { getToken, logout } from "./auth";

// Production (Vercel) uchun backend URL
// Vercel -> Settings -> Environment Variables
// VITE_API_URL = https://five-exam-full.onrender.com
const BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "https://five-exam-full.onrender.com");

export async function api(path, options = {}) {
  const token = getToken();
  const headers = options.headers ? { ...options.headers } : {};

  // Agar body JSON bo'lsa content-type qo'shamiz
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Authorization token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Path normalizatsiya
  const finalPath = path.startsWith("/api") ? path : `/api${path}`;

  const res = await fetch(BASE + finalPath, {
    ...options,
    headers,
    credentials: "include", // refresh token cookie bo'lsa kerak
  });

  // 401 (token expired yoki unauthorized)
  if (res.status === 401) {
    let errorMessage = "Unauthorized";
    try {
      const data = await res.json();
      if (data?.code === "TOKEN_EXPIRED") {
        logout();
      }
      errorMessage = data?.message || errorMessage;
    } catch {
      logout();
    }
    throw new Error(errorMessage);
  }

  // Response parse
  let data;
  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error || data.msg)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
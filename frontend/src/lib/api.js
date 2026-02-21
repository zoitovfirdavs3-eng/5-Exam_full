import { getToken, logout } from "./auth";

export async function api(path, options = {}) {
  const token = getToken();
  const headers = options.headers ? { ...options.headers } : {};

  // FormData bo'lmasa JSON header qo'yamiz
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path.startsWith("/api") ? path : "/api" + path, {
    ...options,
    headers,
    credentials: "include",
  });

  // token expired case from backend auth.guard
  if (res.status === 401) {
    try {
      const data = await res.json();
      if (data?.code === "TOKEN_EXPIRED") {
        logout();
      }
      throw new Error(data?.message || "Unauthorized");
    } catch {
      logout();
      throw new Error("Unauthorized");
    }
  }

  let data;
  const isJson = res.headers.get("content-type")?.includes("application/json");
  if (isJson) data = await res.json();
  else data = await res.text();

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error || data.msg)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

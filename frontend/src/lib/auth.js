export function getToken() {
  return localStorage.getItem("accessToken") || "";
}

export function setToken(token) {
  localStorage.setItem("accessToken", token);
}

export function logout() {
  localStorage.removeItem("accessToken");
}

export function isAuthed() {
  return Boolean(getToken());
}

function b64UrlDecode(str) {
  // base64url -> base64
  const pad = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return atob(base64);
  }
}

export function parseJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(b64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

export function getRole() {
  const payload = parseJwt(getToken());
  return payload?.role || "user";
}

export function getUserId() {
  const payload = parseJwt(getToken());
  return payload?.sub || payload?.id || null;
}

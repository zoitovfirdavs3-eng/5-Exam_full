import React from "react";
import { api, setAuth } from "../api";

export function useAuth() {
  const [user, setUser] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [token, setToken] = React.useState(
    () => localStorage.getItem("accessToken") || ""
  );

  React.useEffect(() => {
    setAuth(token);
  }, [token]);

  const loginWithToken = (accessToken, userObj) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userObj));
    setToken(accessToken);
    setUser(userObj);
    setAuth(accessToken);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setAuth("");
  };

  return { user, token, setUser, loginWithToken, logout };
}

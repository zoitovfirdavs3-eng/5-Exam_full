import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getRole, logout } from "../lib/auth";

function useTitleFromPath(pathname) {
  if (pathname.startsWith("/categories")) return "Kategoriyalar";
  if (pathname.startsWith("/cars")) return "Mashinalar";
  return "Dashboard";
}

export default function Layout() {
  const role = getRole();
  const loc = useLocation();
  const nav = useNavigate();
  const title = useTitleFromPath(loc.pathname);

  function onLogout() {
    logout();
    nav("/login");
  }

  return (
    <div className="container">
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="logo">🚗</div>
            <div className="title">
              <b>Mashina bozori</b>
              <span>Role: {role}</span>
            </div>
          </div>

          <nav className="menu">
            <NavLink to="/categories" className={({ isActive }) => (isActive ? "active" : "")}>
              Categories
            </NavLink>
            <NavLink to="/cars" className={({ isActive }) => (isActive ? "active" : "")}>
              Cars
            </NavLink>
          </nav>

          <div className="spacer" />

          <button className="btn ghost" onClick={onLogout}>
            Logout
          </button>
        </aside>

        <main style={{ display: "grid", gap: 14 }}>
          <div className="topbar">
            <div className="breadcrumb">
              <b>{title}</b>
              <span>Bosh sahifa / {title}</span>
            </div>
            <div className="avatar">U</div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

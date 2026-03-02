
import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

export default function Layout({ user, onLogout, theme, toggleTheme, children }) {
  const nav = useNavigate();
  const isAdmin = (user?.role || "").toLowerCase() === "admin";

  return (
    <div className="container">
      <div className="navbar glass">
        <div className="row">
          <Link to="/" className="brand">
            <div className="logo">A</div>
            <div className="t">
              <b>Auto Market</b>
              <span>Real marketplace vibe</span>
            </div>
          </Link>

          <div className="navlinks">
            <NavLink to="/" className={({ isActive }) => "pill" + (isActive ? " active" : "")}>
              Home
            </NavLink>

            {/* 🔒 Protected links: show ONLY after login */}
            {user ? (
              <>
                <NavLink to="/cars" className={({ isActive }) => "pill" + (isActive ? " active" : "")}>
                  Cars
                </NavLink>
                <NavLink to="/sell" className={({ isActive }) => "pill" + (isActive ? " active" : "")}>
                  Sell
                </NavLink>

                {/* ✅ Admin-only */}
                {isAdmin ? (
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) => "pill" + (isActive ? " active" : "")}
                    title="Admin panel (categories & cars)"
                  >
                    + Category
                  </NavLink>
                ) : null}

                <NavLink to="/wishlist" className={({ isActive }) => "pill" + (isActive ? " active" : "")}>
                  Wishlist
                </NavLink>
                <NavLink to="/chat" className={({ isActive }) => "pill" + (isActive ? " active" : "")}>
                  Chat
                </NavLink>
                <NavLink to="/account" className={({ isActive }) => "pill" + (isActive ? " active" : "")}>
                  My Account
                </NavLink>
                <NavLink to="/my-listings" className={({ isActive }) => "pill" + (isActive ? " active" : "")}>
                  My listings
                </NavLink>
              </>
            ) : null}
          </div>

          <div className="right">
            {/* Theme Toggle */}
            <button 
              className="btn" 
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            
            {user ? (
              <>
                <button className="btn" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn" onClick={() => nav("/login")}>Login</button>
                <button className="btn primary" onClick={() => nav("/register")}>Register</button>
              </>
            )}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const nav = useNavigate();

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    nav("/login");
  }

  return (
    <>
      <div className="brand">
        <div className="brandLogo">AE</div>
        <div className="brandText">
          <b>Avto Panel</b>
          <span>Exam project UI</span>
        </div>
      </div>

      <div className="nav">
        <NavLink end to="/app" className={({ isActive }) => (isActive ? "active" : "")}>
          🏠 Dashboard
        </NavLink>
        <NavLink to="/app/cars" className={({ isActive }) => (isActive ? "active" : "")}>
          🚗 Cars
        </NavLink>
        <NavLink to="/app/categories" className={({ isActive }) => (isActive ? "active" : "")}>
          🧩 Categories
        </NavLink>
      </div>

      <div className="sidebarSpacer" />

      <div className="sidebarFooter">
        <button className="btn btnGhost btnBlock" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </>
  );
}
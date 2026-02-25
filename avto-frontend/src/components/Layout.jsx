import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout() {
  const loc = useLocation();

  const titleMap = {
    "/app": ["Dashboard", "Umumiy statistika"],
    "/app/cars": ["Cars", "Mashinalar ro‘yxati"],
    "/app/categories": ["Categories", "Kategoriyalar boshqaruvi"],
  };

  const [title, sub] = titleMap[loc.pathname] || ["Panel", ""];

  return (
    <div className="container">
      <div className="appShell">
        <aside className="sidebar surface">
          <Sidebar />
        </aside>

        <main className="mainCol">
          <div className="topbar surface">
            <Topbar title={title} sub={sub} />
          </div>

          <div className="mt16">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
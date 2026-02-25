import { useEffect, useState } from "react";
import { http } from "../api/http.js";

export default function Dashboard() {
  const [stats, setStats] = useState({ cars: 0, categories: 0 });
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [cars, categories] = await Promise.all([
          http.get("/api/cars"),
          http.get("/api/categories"),
        ]);
        setStats({
          cars: Array.isArray(cars) ? cars.length : (cars?.data?.length || 0),
          categories: Array.isArray(categories) ? categories.length : (categories?.data?.length || 0),
        });
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div className="card">
      <h1 className="h1">Dashboard</h1>
      <p className="p">Cars va Categories bo‘yicha tezkor ko‘rsatkichlar</p>

      {err ? <div className="alert alertError mt12">{err}</div> : null}

      <div className="mt16" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        <div className="card">
          <div className="kicker">🚗 Cars</div>
          <div style={{ fontSize: 34, fontWeight: 1000, marginTop: 10 }}>{stats.cars}</div>
        </div>
        <div className="card">
          <div className="kicker">🧩 Categories</div>
          <div style={{ fontSize: 34, fontWeight: 1000, marginTop: 10 }}>{stats.categories}</div>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

function imgUrl(u) {
  if (!u) return "";
  const s = String(u);
  if (s.startsWith("http")) return s;
  // /uploads/... path - vite proxy orqali yoki VITE_ASSET_BASE_URL bilan
  const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL || "";
  const imagePath = s.startsWith("/") ? s : "/" + s;
  return assetBaseUrl + imagePath;
}

function money(n) {
  return Number(n || 0).toLocaleString("en-US");
}

export default function CarDetails({ user, wishlist, toggleWish }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [car, setCar] = React.useState(null);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    api
      .get("/cars")
      .then((r) => {
        const found = (r.data.data || []).find((x) => x._id === id);
        if (!found) setErr("Mashina topilmadi");
        else setCar(found);
      })
      .catch((e) => {
        setErr(e?.response?.data?.message || "Yuklashda xatolik");
      });
  }, [id]);

  if (err) return <div className="notice">{err}</div>;
  if (!car) return <div className="muted">Yuklanmoqda...</div>;

  const wished = wishlist.includes(car._id);

  return (
    <div className="glass card" style={{ padding: 22 }}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1.2fr", gap: 18 }}>
        <div className="glass" style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.10)" }}>
          <div style={{ height: 320, background: "rgba(255,255,255,.04)" }}>
            {car.car_image ? (
              <img
                src={imgUrl(car.car_image)}
                alt={car.car_name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted)">Rasm yo\'q</div>';
                }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)" }}>
                Rasm yo'q
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="muted" style={{ textTransform: "capitalize" }}>
            {car?.car_category?.name || "Kategoriya"}
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 4 }}>{car.car_name}</div>
          <div className="price" style={{ fontSize: 34, marginTop: 10 }}>${money(car.car_price)}</div>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <div className="glass card"><div className="muted">Yil</div><b>{car.car_year}</b></div>
            <div className="glass card"><div className="muted">Yurish</div><b>{car.car_distance}</b></div>
            <div className="glass card"><div className="muted">Tonirovka</div><b>{car.car_tonirovka ? "Bor" : "Yo'q"}</b></div>
            <div className="glass card"><div className="muted">Uzatmalar</div><b>{car.car_gearbook || "-"}</b></div>
            <div className="glass card"><div className="muted">Motor</div><b>{car.car_motor}</b></div>
            <div className="glass card"><div className="muted">Rang</div><b>{car.car_color}</b></div>
          </div>

          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => { if (!user) return nav("/login"); toggleWish(car._id); }}>
              {wished ? "♥ Saqlangan" : "♡ Saqlash"}
            </button>
            <button className="btn primary" onClick={() => { if (!user) return nav("/login"); nav(`/chat?car=${car._id}`); }}>
              Sotuvchi bilan chat
            </button>
            <button className="btn" onClick={() => nav(-1)}>Orqaga</button>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="muted" style={{ marginBottom: 6 }}>Tavsif</div>
            <div className="muted" style={{ lineHeight: 1.6 }}>{car.car_description}</div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="muted" style={{ marginBottom: 6 }}>Sotuvchi</div>
            <div className="glass card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <b>{car?.owner?.first_name || "Foydalanuvchi"} {car?.owner?.last_name || ""}</b>
                <div className="muted">@{(car?.owner?.email || "").split("@")[0]}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home({ user }) {
  const nav = useNavigate();

  return (
    <div className="glass card" style={{ padding: 24 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 18, alignItems: "start" }}>
          <div>
            <div className="badge" style={{ display: "inline-flex", marginBottom: 10 }}>Auto Market</div>
            <h1 className="h1" style={{ marginBottom: 10, fontSize: 38 }}>
              Mashina sotish va sotib olish —
              <span style={{ display: "block" }}>oddiy, tez va ishonchli.</span>
            </h1>
            <p className="muted" style={{ lineHeight: 1.7, fontSize: 15 }}>
              Bu platformada siz mashina e’lon joylaysiz, filtrlab qidirasiz va chat orqali to‘g‘ridan-to‘g‘ri
              sotuvchi yoki admin bilan bog‘lanasiz.
              <br />
              <b>Support chat</b>: user muammosini yozadi, admin javob beradi.
              <br />
              <b>Car chat</b>: xaridor ↔ sotuvchi o‘zaro yozishadi.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              {user ? (
                <>
                  <button className="btn primary" onClick={() => nav("/cars")}>Marketplace</button>
                  <button className="btn" onClick={() => nav("/chat")}>Chat</button>
                </>
              ) : (
                <>
                  <button className="btn primary" onClick={() => nav("/login")}>Login</button>
                  <button className="btn" onClick={() => nav("/register")}>Register</button>
                </>
              )}
            </div>
          </div>

          <div className="glass" style={{ borderRadius: 18, padding: 16, border: "1px solid rgba(255,255,255,.10)" }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Nimalar bor?</div>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
              <li>Register / login + refresh token</li>
              <li>OTP send + resend + forgot password</li>
              <li>Admin: category boshqaruvi</li>
              <li>User: e’lon (car) yaratish + rasm upload</li>
              <li>Chat: support va buyer↔seller</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

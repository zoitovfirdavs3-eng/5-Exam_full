import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Verify() {
  const nav = useNavigate();
  const pendingEmail = localStorage.getItem("pendingEmail") || "";

  const [email, setEmail] = useState(pendingEmail);
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setOk("");
    try {
      await api("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          otp: Number(otp),
        }),
      });
      setOk("✅ Profil tasdiqlandi. Endi login qiling.");
      nav("/login");
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function resend() {
    setMsg("");
    setOk("");
    try {
      await api("/api/auth/resend/otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setOk("✅ OTP qayta yuborildi.");
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <div className="pill" style={{ marginBottom: 10 }}>Mashina bozori</div>
        <h1>Verify OTP</h1>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div className="muted" style={{ fontSize: 12 }}>email</div>
            <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="example@gmail.com" />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div className="muted" style={{ fontSize: 12 }}>otp (number)</div>
            <input className="input" value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder="6 xonali kod" />
          </div>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <button className="btn" type="submit">Verify</button>
            <button className="btn secondary" type="button" onClick={resend}>Resend OTP</button>
          </div>

          {msg && <div className="error">{msg}</div>}
          {ok && <div className="ok">{ok}</div>}

          <div className="muted" style={{ fontSize: 13 }}>
            Login sahifasi: <Link className="smallLink" to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

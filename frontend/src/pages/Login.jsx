import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem("pendingEmail") || "");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!data?.accessToken) throw new Error("Access token topilmadi");
      setToken(data.accessToken);
      nav("/cars");
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <div className="pill" style={{ marginBottom: 10 }}>Mashina bozori</div>
        <h1>Login</h1>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div className="muted" style={{ fontSize: 12 }}>email</div>
            <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="example@gmail.com" />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div className="muted" style={{ fontSize: 12 }}>password</div>
            <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="******" />
          </div>

          <button className="btn" type="submit">Login</button>

          {msg && <div className="error">{msg}</div>}

          <div className="muted" style={{ fontSize: 13 }}>
            Account yo‘qmi? <Link className="smallLink" to="/register">Register</Link>
            {" "}·{" "}
            OTP? <Link className="smallLink" to="/verify">Verify</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

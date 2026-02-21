import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    age: 18,
    email: "",
    password: "",
  });
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState("");

  function setValue(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setOk("");
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          age: Number(form.age),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      localStorage.setItem("pendingEmail", form.email.trim());
      setOk("✅ Kod emailga yuborildi. OTP ni kiriting.");
      nav("/verify");
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <div className="pill" style={{ marginBottom: 10 }}>Mashina bozori</div>
        <h1>Register</h1>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div className="muted" style={{ fontSize: 12 }}>first_name (string)</div>
            <input className="input" value={form.first_name} onChange={(e)=>setValue("first_name", e.target.value)} placeholder="Ism" />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div className="muted" style={{ fontSize: 12 }}>last_name (string)</div>
            <input className="input" value={form.last_name} onChange={(e)=>setValue("last_name", e.target.value)} placeholder="Familiya" />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div className="muted" style={{ fontSize: 12 }}>age (number, 12-100)</div>
            <input className="input" type="number" value={form.age} onChange={(e)=>setValue("age", e.target.value)} />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div className="muted" style={{ fontSize: 12 }}>email (string)</div>
            <input className="input" value={form.email} onChange={(e)=>setValue("email", e.target.value)} placeholder="example@gmail.com" />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div className="muted" style={{ fontSize: 12 }}>password (min 6)</div>
            <input className="input" type="password" value={form.password} onChange={(e)=>setValue("password", e.target.value)} placeholder="******" />
          </div>

          <button className="btn" type="submit">Register</button>

          {msg && <div className="error">{msg}</div>}
          {ok && <div className="ok">{ok}</div>}

          <div className="muted" style={{ fontSize: 13 }}>
            Account bormi? <Link className="smallLink" to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

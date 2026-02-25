import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http.js";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const data = await http.post("/api/auth/register", form);
      setMsg(data?.message || "Registered. Verify OTP now.");
      localStorage.setItem("userEmail", form.email);
      nav("/verify");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard surface">
        <div className="authHead">
          <h1 className="authTitle">Register</h1>
          <p className="authSub">Akkaunt yarating va OTP bilan tasdiqlang</p>
        </div>

        {err ? <div className="alert alertError">{err}</div> : null}
        {msg ? <div className="alert alertOk">{msg}</div> : null}

        <form className="form mt12" onSubmit={submit}>
          <div>
            <label className="label">Name</label>
            <input className="input" name="name" value={form.name} onChange={onChange} placeholder="Firdavs" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" name="email" value={form.email} onChange={onChange} placeholder="you@gmail.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={onChange} placeholder="********" />
          </div>

          <button className="btn btnPrimary btnBlock btnLg" disabled={loading}>
            {loading ? "Loading..." : "Create account"}
          </button>

          <div className="authActions">
            <span className="muted">Akkauntingiz bormi?</span>
            <Link className="smallLink" to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
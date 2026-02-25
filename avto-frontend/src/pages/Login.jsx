import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http.js";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const data = await http.post("/api/auth/login", form);

      // backend har xil qaytarishi mumkin: accessToken yoki token
      const token = data?.accessToken || data?.token;
      if (!token) throw new Error("Token kelmadi. Backend response tekshiring.");

      localStorage.setItem("accessToken", token);
      localStorage.setItem("userEmail", form.email);

      nav("/app");
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
          <h1 className="authTitle">Login</h1>
          <p className="authSub">Akkauntingizga kiring</p>
        </div>

        {err ? <div className="alert alertError">{err}</div> : null}

        <form className="form mt12" onSubmit={submit}>
          <div>
            <label className="label">Email</label>
            <input className="input" name="email" value={form.email} onChange={onChange} placeholder="you@gmail.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={onChange} placeholder="********" />
          </div>

          <button className="btn btnPrimary btnBlock btnLg" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>

          <div className="authActions">
            <Link className="smallLink" to="/forgot">Forgot password?</Link>
            <span className="muted">|</span>
            <Link className="smallLink" to="/register">Register</Link>
          </div>

          <div className="authActions">
            <span className="muted">OTP tasdiqlanmaganmi?</span>
            <Link className="smallLink" to="/verify">Verify</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
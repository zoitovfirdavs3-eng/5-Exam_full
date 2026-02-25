import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http.js";

export default function Forgot() {
  const nav = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const data = await http.post("/api/auth/forgot/password", { email });
      setMsg(data?.message || "OTP sent. Now change password.");
      localStorage.setItem("userEmail", email);
      nav("/change-password");
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
          <h1 className="authTitle">Forgot password</h1>
          <p className="authSub">Email kiriting, OTP yuboriladi</p>
        </div>

        {err ? <div className="alert alertError">{err}</div> : null}
        {msg ? <div className="alert alertOk">{msg}</div> : null}

        <form className="form mt12" onSubmit={submit}>
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" />
          </div>

          <button className="btn btnPrimary btnBlock btnLg" disabled={loading}>
            {loading ? "Loading..." : "Send OTP"}
          </button>

          <div className="authActions">
            <Link className="smallLink" to="/login">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
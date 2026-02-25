import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http.js";

export default function Verify() {
  const nav = useNavigate();
  const savedEmail = localStorage.getItem("userEmail") || "";
  const [email, setEmail] = useState(savedEmail);
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function verify(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const data = await http.post("/api/auth/verify", { email, otp });
      setMsg(data?.message || "Verified!");
      nav("/login");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setErr(""); setMsg(""); setLoading(true);
    try {
      const data = await http.post("/api/auth/resend/otp", { email });
      setMsg(data?.message || "OTP resent!");
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
          <h1 className="authTitle">Verify OTP</h1>
          <p className="authSub">Emailga kelgan kodni kiriting</p>
        </div>

        {err ? <div className="alert alertError">{err}</div> : null}
        {msg ? <div className="alert alertOk">{msg}</div> : null}

        <form className="form mt12" onSubmit={verify}>
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" />
          </div>
          <div>
            <label className="label">OTP</label>
            <input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
            <div className="help">6 xonali kod</div>
          </div>

          <button className="btn btnPrimary btnBlock btnLg" disabled={loading}>
            {loading ? "Loading..." : "Verify"}
          </button>

          <div className="authActions">
            <button type="button" className="btn btnSoft btnSm" onClick={resend} disabled={loading}>
              Resend OTP
            </button>
            <Link className="smallLink" to="/login">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
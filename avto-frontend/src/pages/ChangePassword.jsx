import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http.js";

export default function ChangePassword() {
  const nav = useNavigate();
  const savedEmail = localStorage.getItem("userEmail") || "";
  const [email, setEmail] = useState(savedEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const data = await http.post("/api/auth/change/password", {
        email,
        otp,
        new_password: newPassword,
        password: newPassword, // backend boshqa nom kutsa ham ishlasin
      });
      setMsg(data?.message || "Password changed!");
      nav("/login");
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
          <h1 className="authTitle">Change password</h1>
          <p className="authSub">OTP + yangi parol</p>
        </div>

        {err ? <div className="alert alertError">{err}</div> : null}
        {msg ? <div className="alert alertOk">{msg}</div> : null}

        <form className="form mt12" onSubmit={submit}>
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">OTP</label>
            <input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>

          <button className="btn btnPrimary btnBlock btnLg" disabled={loading}>
            {loading ? "Loading..." : "Change password"}
          </button>

          <div className="authActions">
            <Link className="smallLink" to="/login">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
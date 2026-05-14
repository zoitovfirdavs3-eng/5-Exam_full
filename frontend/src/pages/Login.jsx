import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuth } from "../api";

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export default function Login({ onLogin }) {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Allaqachon kirgan bo'lsa yo'naltir
  React.useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    if (token && user) {
      nav("/cars");
    }
  }, [nav]);

  const getErrorMessage = (err) => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message;
    if (status === 401) return "Email yoki parol noto'g'ri";
    if (status === 400) return message || "Ma'lumotlar to'liq emas";
    if (status >= 500) return "Serverda xatolik. Keyinroq urinib ko'ring";
    if (!err?.response) return "Serverga ulanib bo'lmadi";
    return message || "Kirishda xatolik yuz berdi";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email va parol kiritilishi shart");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // Token va userni saqlash
      setAuth(data.accessToken);
      onLogin(data.accessToken, data.user);
      nav("/cars");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass login-card">
        <div className="login-header">
          <h1 className="login-title">Kirish</h1>
          <p className="login-subtitle">Hisobingizga kiring</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Emailingizni kiriting"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Parolingizni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>

        {error && (
          <div className="error-alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="login-footer">
          <p className="footer-text">
            Hisobingiz yo'qmi?{" "}
            <Link to="/register" className="footer-link">
              Ro'yxatdan o'tish
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background:
            radial-gradient(900px 520px at 14% 12%, rgba(47,107,255,.22), transparent 55%),
            radial-gradient(900px 520px at 85% 20%, rgba(146,72,255,.18), transparent 55%),
            radial-gradient(900px 520px at 50% 85%, rgba(47,107,255,.10), transparent 55%),
            linear-gradient(180deg, #060a16, #0a1230);
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 32px;
          border-radius: 20px;
          box-shadow: 0 18px 60px rgba(0,0,0,.55);
          backdrop-filter: blur(14px);
        }
        .login-header { text-align: center; margin-bottom: 32px; }
        .login-title { font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #e7eeff; }
        .login-subtitle { color: rgba(231,238,255,.70); font-size: 14px; margin: 0; }
        .login-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 13px; font-weight: 600; color: rgba(231,238,255,.70); }
        .form-input {
          width: 100%; padding: 14px 16px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,.10); background: rgba(10,18,48,.55);
          color: #e7eeff; font-size: 15px; transition: all 0.2s ease; outline: none; box-sizing: border-box;
        }
        .form-input:focus { border-color: rgba(47,107,255,.40); box-shadow: 0 0 0 3px rgba(47,107,255,.15); }
        .form-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .password-input-wrapper { position: relative; }
        .password-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: rgba(231,238,255,.70); cursor: pointer;
          padding: 4px; border-radius: 4px;
        }
        .login-button {
          padding: 14px 20px; border-radius: 12px; border: 1px solid rgba(47,107,255,.35);
          background: linear-gradient(180deg, rgba(47,107,255,.95), rgba(31,75,214,.95));
          color: white; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 8px;
        }
        .login-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .error-alert {
          margin-top: 20px; padding: 12px 16px; border-radius: 12px;
          border: 1px solid rgba(255,77,77,.30); background: rgba(255,77,77,.15);
          color: #ff4d4d; font-size: 14px; display: flex; align-items: center; gap: 8px;
        }
        .login-footer { margin-top: 24px; text-align: center; }
        .footer-text { color: rgba(231,238,255,.70); font-size: 14px; margin: 0; }
        .footer-link { color: #2f6bff; text-decoration: none; font-weight: 600; }
      `}</style>
    </div>
  );
}


import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

// Icon components
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

const LoadingSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 11-6.219-8.56"></path>
  </svg>
);

export default function Login({ onLogin }) {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Redirect if already logged in
  React.useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    if (token && user) {
      nav("/cars");
    }
  }, [nav]);

  const getErrorMessage = (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    
    if (status === 401) {
      return "Email yoki parol noto'g'ri";
    } else if (status === 403) {
      return "Avval emailingizni tasdiqlang";
    } else if (status === 400) {
      return message || "Ma'lumotlar to'liq emas";
    } else if (status >= 500) {
      return "Serverda xatolik. Iltimos, keyinroq urinib ko'ring";
    } else {
      return message || "Kirishda xatolik yuz berdi";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError("Email va parol kiritilishi shart");
      return;
    }

    setLoading(true);
    
    try {
      // Debug: Log request details (without password)
      console.log("🔍 Login Debug:", {
        url: api.defaults.baseURL + "/auth/login",
        email: email.trim().toLowerCase(),
        hasPassword: !!password.trim(),
        withCredentials: api.defaults.withCredentials
      });

      const { data } = await api.post("/auth/login", { 
        email: email.trim().toLowerCase(), 
        password: password.trim() 
      });
      
      // Debug: Log response details
      console.log("✅ Login Response:", {
        status: data.status,
        hasAccessToken: !!data.accessToken,
        hasUser: !!data.user,
        userKeys: data.user ? Object.keys(data.user) : []
      });
      
      // Store user data and token
      onLogin(data.accessToken, data.user);
      
      // Redirect to cars page
      nav("/cars");
    } catch (err) {
      // Debug: Log error details
      console.error("❌ Login Error Debug:", {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        message: err?.response?.data?.message,
        url: err?.config?.url,
        baseURL: err?.config?.baseURL,
        withCredentials: err?.config?.withCredentials,
        hasResponse: !!err?.response,
        isNetworkError: !err?.response
      });
      
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
          <p className="login-subtitle">Tasdiqlangan hisobingizdan foydalaning</p>
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
                title={showPassword ? "Parolni yashirish" : "Parolni ko'rsat"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Kirilmoqda...</span>
              </>
            ) : (
              "Kirish"
            )}
          </button>
        </form>

        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
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
          <p className="footer-subtext">
            Agar ro'yxatdan o'tgan bo'lsangiz,{" "}
            <Link to="/register" className="footer-link">
              Ro'yxatdan o'tish
            </Link>{" "}
            sahifasiga o'ting.
          </p>
        </div>
      </div>

      <style jsx>{`
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

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px;
          color: #e7eeff;
        }

        .login-subtitle {
          color: rgba(231,238,255,.70);
          font-size: 14px;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(231,238,255,.70);
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(10,18,48,.55);
          color: #e7eeff;
          font-size: 15px;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: rgba(47,107,255,.40);
          box-shadow: 0 0 0 3px rgba(47,107,255,.15);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(231,238,255,.70);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .password-toggle:hover:not(:disabled) {
          color: #e7eeff;
          background: rgba(255,255,255,.05);
        }

        .password-toggle:disabled {
          cursor: not-allowed;
        }

        .login-button {
          padding: 14px 20px;
          border-radius: 12px;
          border: 1px solid rgba(47,107,255,.35);
          background: linear-gradient(180deg, rgba(47,107,255,.95), rgba(31,75,214,.95));
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        .login-button:hover:not(:disabled) {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-button svg {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-alert {
          margin-top: 20px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,77,77,.30);
          background: rgba(255,77,77,.15);
          color: #ff4d4d;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(-8px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .error-icon {
          font-size: 16px;
        }

        .login-footer {
          margin-top: 24px;
          text-align: center;
        }

        .footer-text {
          color: rgba(231,238,255,.70);
          font-size: 14px;
          margin: 0 0 8px;
        }

        .footer-subtext {
          color: rgba(231,238,255,.50);
          font-size: 12px;
          margin: 0;
        }

        .footer-link {
          color: #2f6bff;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: #1f4bd6;
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
          .login-container {
            padding: 12px;
          }
          
          .login-card {
            padding: 24px;
          }
          
          .login-title {
            font-size: 24px;
          }
          
          .form-input {
            padding: 12px 14px;
            font-size: 14px;
          }
          
          .login-button {
            padding: 12px 16px;
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}

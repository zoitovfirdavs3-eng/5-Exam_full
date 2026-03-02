import React from "react";
import { api } from "../api";
import "../styles/account.css";

// Simple icon components
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M20.46 14.04l-4.24-4.24M7.78 18.36L3.54 22.6"></path>
  </svg>
);

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

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

// Helper function to build image URLs
function imgUrl(u) {
  if (!u) return "";
  const s = String(u);
  if (s.startsWith("http")) return s;
  
  // Use API_ORIGIN for static files (not API_URL)
  const apiOrigin = import.meta.env.VITE_API_ORIGIN || "http://localhost:3002";
  
  // Ensure proper path joining
  const imagePath = s.startsWith("/") ? s : "/" + s;
  return apiOrigin + imagePath;
}

// Toast component
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
};

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="loading-skeleton skeleton-card" style={{ height: "200px" }}></div>
);

// Empty state
const EmptyState = ({ icon, title, text }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <div className="empty-title">{title}</div>
    <div className="empty-text">{text}</div>
  </div>
);

export default function MyAccount({ user, theme, toggleTheme }) {
  const [activeTab, setActiveTab] = React.useState("profile");
  const [profile, setProfile] = React.useState(null);
  const [myListings, setMyListings] = React.useState([]);
  const [wishlist, setWishlist] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [toast, setToast] = React.useState(null);

  // Form states
  const [profileForm, setProfileForm] = React.useState({
    first_name: "",
    last_name: "",
    age: ""
  });

  const [passwordForm, setPasswordForm] = React.useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPasswords, setShowPasswords] = React.useState({
    old: false,
    new: false,
    confirm: false
  });

  const [formErrors, setFormErrors] = React.useState({});

  React.useEffect(() => {
    loadProfile();
  }, []);

  React.useEffect(() => {
    if (activeTab === "listings") loadMyListings();
    if (activeTab === "wishlist") loadWishlist();
  }, [activeTab]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const r = await api.get("/me");
      setProfile(r.data.data);
      setProfileForm({
        first_name: r.data.data.first_name,
        last_name: r.data.data.last_name,
        age: r.data.data.age
      });
    } catch (e) {
      setError(e?.response?.data?.message || "Profilni yuklashda xatolik");
      showToast("Profilni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadMyListings = async () => {
    try {
      setLoading(true);
      const r = await api.get("/me/cars");
      setMyListings(r.data.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "E'lonlarni yuklashda xatolik");
      showToast("E'lonlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const r = await api.get("/me/wishlist");
      setWishlist(r.data.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Saralanganlarni yuklashda xatolik");
      showToast("Saralanganlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateProfileForm = () => {
    const errors = {};
    if (!profileForm.first_name.trim()) errors.first_name = "Ism kiritilishi shart";
    if (!profileForm.last_name.trim()) errors.last_name = "Familiya kiritilishi shart";
    if (!profileForm.age || profileForm.age < 12 || profileForm.age > 100) {
      errors.age = "Yosh 12 dan 100 gacha bo'lishi kerak";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.oldPassword) errors.oldPassword = "Eski parol kiritilishi shart";
    if (!passwordForm.newPassword) errors.newPassword = "Yangi parol kiritilishi shart";
    if (passwordForm.newPassword.length < 6) errors.newPassword = "Parol kamida 6 ta belgidan iborat bo'lishi kerak";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Parollar mos kelmadi";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    try {
      setLoading(true);
      await api.put("/me", profileForm);
      showToast("Profil muvaffaqiyatli yangilandi");
      loadProfile();
    } catch (e) {
      const message = e?.response?.data?.message || "Profilni yangilashda xatolik";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      setLoading(true);
      await api.put("/me/password", passwordForm);
      showToast("Parol muvaffaqiyatli o'zgartirildi");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setFormErrors({});
    } catch (e) {
      const message = e?.response?.data?.message || "Parolni o'zgartirishda xatolik";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (carId) => {
    try {
      await api.delete(`/me/wishlist/${carId}`);
      setWishlist(prev => prev.filter(car => car._id !== carId));
      showToast("Saralanganlardan o'chirildi");
    } catch (e) {
      const message = e?.response?.data?.message || "O'chirishda xatolik";
      showToast(message, "error");
    }
  };

  const deleteListing = async (carId) => {
    if (!confirm("Ushbu e'lonni o'chirishni tasdiqlaysizmi?")) return;
    
    try {
      await api.delete(`/cars/${carId}`);
      setMyListings(prev => prev.filter(car => car._id !== carId));
      showToast("E'lon o'chirildi");
    } catch (e) {
      const message = e?.response?.data?.message || "O'chirishda xatolik";
      showToast(message, "error");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: <UserIcon /> },
    { id: "security", label: "Xavfsizlik", icon: <LockIcon /> },
    { id: "listings", label: "E'lonlarim", icon: <CarIcon /> },
    { id: "wishlist", label: "Saralanganlar", icon: <HeartIcon /> },
    { id: "settings", label: "Sozlamalar", icon: <SettingsIcon /> }
  ];

  if (!profile) {
    return (
      <div className="account-container">
        <div className="glass card" style={{ padding: 60, textAlign: "center" }}>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="account-layout">
        {/* Sidebar */}
        <div className="account-sidebar">
          <div className="glass card profile-summary">
            <div className="profile-avatar">
              {getInitials(profile.first_name, profile.last_name)}
            </div>
            <h2 className="profile-name">
              {profile.first_name} {profile.last_name}
            </h2>
            <div className="profile-email">{profile.email}</div>
            <div className="profile-badges">
              <span className="badge verified">✓ Tasdiqlangan</span>
              <span className="badge role">
                {profile.role === "admin" ? "Admin" : "Foydalanuvchi"}
              </span>
            </div>
            <div className="profile-meta">
              Ro'yxatdan o'tgan: {formatDate(profile.createdAt)}
            </div>
          </div>

          <div className="account-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="account-content">
          <div className="glass card" style={{ padding: 32 }}>
            
            {/* Profile Tab */}
            <div className={`content-section ${activeTab === "profile" ? "active" : ""}`}>
              <div className="section-header">
                <h1 className="section-title">Profil ma'lumotlari</h1>
                <p className="section-subtitle">Shaxsiy ma'lumotlaringizni boshqaring</p>
              </div>

              <form onSubmit={updateProfile}>
                <div className="form-section">
                  <h3>Asosiy ma'lumotlar</h3>
                  <div className="form-row two-col">
                    <div className="form-group">
                      <label className="form-label">Ism</label>
                      <input
                        type="text"
                        className={`form-input ${formErrors.first_name ? "error" : ""}`}
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                        placeholder="Ismingiz"
                      />
                      {formErrors.first_name && <div className="form-error">{formErrors.first_name}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Familiya</label>
                      <input
                        type="text"
                        className={`form-input ${formErrors.last_name ? "error" : ""}`}
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                        placeholder="Familiyangiz"
                      />
                      {formErrors.last_name && <div className="form-error">{formErrors.last_name}</div>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Yosh</label>
                      <input
                        type="number"
                        className={`form-input ${formErrors.age ? "error" : ""}`}
                        value={profileForm.age}
                        onChange={(e) => setProfileForm({...profileForm, age: e.target.value})}
                        placeholder="Yoshingiz"
                        min="12"
                        max="100"
                      />
                      {formErrors.age && <div className="form-error">{formErrors.age}</div>}
                    </div>
                  </div>
                </div>

                <div className="btn-group">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Tab */}
            <div className={`content-section ${activeTab === "security" ? "active" : ""}`}>
              <div className="section-header">
                <h1 className="section-title">Xavfsizlik</h1>
                <p className="section-subtitle">Parolni o'zgartiring</p>
              </div>

              <form onSubmit={changePassword}>
                <div className="form-section">
                  <h3>Parolni o'zgartirish</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Joriy parol</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.old ? "text" : "password"}
                          className={`form-input ${formErrors.oldPassword ? "error" : ""}`}
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                          placeholder="Joriy parolingiz"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                        >
                          {showPasswords.old ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {formErrors.oldPassword && <div className="form-error">{formErrors.oldPassword}</div>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Yangi parol</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          className={`form-input ${formErrors.newPassword ? "error" : ""}`}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          placeholder="Yangi parol"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        >
                          {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {formErrors.newPassword && <div className="form-error">{formErrors.newPassword}</div>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Yangi parolni tasdiqlang</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          className={`form-input ${formErrors.confirmPassword ? "error" : ""}`}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          placeholder="Yangi parolni qayta kiriting"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        >
                          {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {formErrors.confirmPassword && <div className="form-error">{formErrors.confirmPassword}</div>}
                    </div>
                  </div>
                </div>

                <div className="btn-group">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? "O'zgarilmoqda..." : "Parolni o'zgartirish"}
                  </button>
                </div>
              </form>
            </div>

            {/* My Listings Tab */}
            <div className={`content-section ${activeTab === "listings" ? "active" : ""}`}>
              <div className="section-header">
                <h1 className="section-title">E'lonlarim</h1>
                <p className="section-subtitle">Mashinalaringizni boshqaring</p>
              </div>

              {loading ? (
                <div>
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                </div>
              ) : myListings.length === 0 ? (
                <EmptyState
                  icon="🚗"
                  title="E'lonlar yo'q"
                  text="Hali hech qanday mashina qo'shmadingiz"
                />
              ) : (
                <div className="car-grid">
                  {myListings.map(car => (
                    <div key={car._id} className="car-card">
                      <div className="car-image">
                        {car.car_image ? (
                          <img 
                            src={imgUrl(car.car_image)} 
                            alt={car.car_name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <div className="muted" style={{ display: car.car_image ? 'none' : 'block', textAlign: 'center', padding: '20px' }}>Rasm yo'q</div>
                      </div>
                      <div className="car-details">
                        <h3 className="car-name">{car.car_name}</h3>
                        <div className="car-meta">
                          <span className="car-meta-item">📅 {car.car_year}</span>
                          <span className="car-meta-item">🛣 {car.car_distance}</span>
                        </div>
                        <div className="car-price">${car.car_price?.toLocaleString()}</div>
                        <div className="car-actions">
                          <button className="btn btn-primary" style={{ fontSize: 12 }}>
                            <EditIcon /> Tahrirlash
                          </button>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => deleteListing(car._id)}
                            style={{ fontSize: 12 }}
                          >
                            <TrashIcon /> O'chirish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist Tab */}
            <div className={`content-section ${activeTab === "wishlist" ? "active" : ""}`}>
              <div className="section-header">
                <h1 className="section-title">Saralanganlar</h1>
                <p className="section-subtitle">Saralangan mashinalaringiz</p>
              </div>

              {loading ? (
                <div>
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                </div>
              ) : wishlist.length === 0 ? (
                <EmptyState
                  icon="❤️"
                  title="Saralanganlar yo'q"
                  text="Mashinalarni saralang va ular shu yerda ko'rinadi"
                />
              ) : (
                <div className="car-grid">
                  {wishlist.map(car => (
                    <div key={car._id} className="car-card">
                      <div className="car-image">
                        {car.car_image ? (
                          <img 
                            src={imgUrl(car.car_image)} 
                            alt={car.car_name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <div className="muted" style={{ display: car.car_image ? 'none' : 'block', textAlign: 'center', padding: '20px' }}>Rasm yo'q</div>
                      </div>
                      <div className="car-details">
                        <h3 className="car-name">{car.car_name}</h3>
                        <div className="car-meta">
                          <span className="car-meta-item">📅 {car.car_year}</span>
                          <span className="car-meta-item">🛣 {car.car_distance}</span>
                        </div>
                        <div className="car-price">${car.car_price?.toLocaleString()}</div>
                        <div className="car-actions">
                          <button 
                            className="btn btn-danger" 
                            onClick={() => removeFromWishlist(car._id)}
                            style={{ fontSize: 12 }}
                          >
                            <TrashIcon /> Olib tashlash
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Tab */}
            <div className={`content-section ${activeTab === "settings" ? "active" : ""}`}>
              <div className="section-header">
                <h1 className="section-title">Sozlamalar</h1>
                <p className="section-subtitle">Ilova sozlamalari</p>
              </div>

              <div className="form-section">
                <h3>Til va ko'rinish</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Interfeys tili</label>
                    <select className="form-input" defaultValue="uz">
                      <option value="uz">O'zbekcha</option>
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Mavzu</label>
                    <select 
                      className="form-input" 
                      value={theme}
                      onChange={(e) => toggleTheme()}
                    >
                      <option value="dark">Qora (Dark)</option>
                      <option value="light">Yorqin (Light)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Bildirishnomalar</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="checkbox" defaultChecked />
                      <span>Email bildirishnomalari</span>
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="checkbox" defaultChecked />
                      <span>Chat xabarlari</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="btn-group">
                <button className="btn-save">Sozlamalarni saqlash</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

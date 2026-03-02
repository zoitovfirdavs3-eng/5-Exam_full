
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./components/useAuth";
import Cars from "./pages/Cars";
import Sell from "./pages/Sell";
import MyListings from "./pages/MyListings";
import CarDetails from "./pages/CarDetails";
import Wishlist from "./pages/Wishlist";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyAccount from "./pages/MyAccount";
import Home from "./pages/Home";

function useTheme() {
  const [theme, setTheme] = React.useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      return saved || "dark";
    } catch {
      return "dark";
    }
  });

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return { theme, toggleTheme };
}

function useWishlist(){
  const [wishlist, setWishlist] = React.useState(()=>{
    try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); } catch { return []; }
  });
  const toggleWish = (id)=>{
    setWishlist(prev=>{
      const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id];
      localStorage.setItem("wishlist", JSON.stringify(next));
      return next;
    });
  };
  return { wishlist, toggleWish };
}

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ user, children }) {
  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/cars" replace />;
  return children;
}

export default function App() {
  const auth = useAuth();
  const { wishlist, toggleWish } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  return (
    <Layout user={auth.user} onLogout={auth.logout} theme={theme} toggleTheme={toggleTheme}>
      <Routes>
        <Route path="/" element={<Home user={auth.user} />} />

        {/* 🔒 Marketplace is available only after login */}
        <Route
          path="/cars"
          element={
            <RequireAuth user={auth.user}>
              <Cars user={auth.user} wishlist={wishlist} toggleWish={toggleWish} />
            </RequireAuth>
          }
        />
        <Route
          path="/cars/:id"
          element={
            <RequireAuth user={auth.user}>
              <CarDetails user={auth.user} wishlist={wishlist} toggleWish={toggleWish} />
            </RequireAuth>
          }
        />

        {/* 🔒 Protected pages */}
        <Route
          path="/sell"
          element={
            <RequireAuth user={auth.user}>
              <Sell user={auth.user} />
            </RequireAuth>
          }
        />
        <Route
          path="/my-listings"
          element={
            <RequireAuth user={auth.user}>
              <MyListings user={auth.user} />
            </RequireAuth>
          }
        />
        <Route
          path="/wishlist"
          element={
            <RequireAuth user={auth.user}>
              <Wishlist user={auth.user} wishlist={wishlist} toggleWish={toggleWish} />
            </RequireAuth>
          }
        />
        <Route
          path="/chat"
          element={
            <RequireAuth user={auth.user}>
              <Chat user={auth.user} />
            </RequireAuth>
          }
        />

        {/* 🔐 User Account */}
        <Route
          path="/account"
          element={
            <RequireAuth user={auth.user}>
              <MyAccount user={auth.user} theme={theme} toggleTheme={toggleTheme} />
            </RequireAuth>
          }
        />

        {/* 🔐 Admin-only */}
        <Route
          path="/dashboard"
          element={
            <RequireAdmin user={auth.user}>
              <Dashboard user={auth.user} token={auth.token} setToken={(t)=>auth.loginWithToken(t, auth.user)} />
            </RequireAdmin>
          }
        />
        <Route path="/login" element={<Login onLogin={auth.loginWithToken} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

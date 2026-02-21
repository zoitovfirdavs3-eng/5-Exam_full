import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Verify from "./pages/Verify.jsx";
import Categories from "./pages/Categories.jsx";
import Cars from "./pages/Cars.jsx";
import Layout from "./components/Layout.jsx";
import { isAuthed } from "./lib/auth";

function Protected({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cars" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />

      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/categories" element={<Categories />} />
        <Route path="/cars" element={<Cars />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

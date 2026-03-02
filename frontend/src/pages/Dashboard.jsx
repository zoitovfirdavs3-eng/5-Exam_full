import React from "react";
import { api } from "../api";

export default function Dashboard({ user, token, setToken }) {
  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  const canManageCar = (x) => {
    if (isAdmin) return true;
    const uid = String(user?.id || user?._id || "");
    const owner = x?.owner?._id ? String(x.owner._id) : String(x?.owner || "");
    return uid && owner && uid === owner;
  };

  const [categories, setCategories] = React.useState([]);
  const [cars, setCars] = React.useState([]);
  const [err, setErr] = React.useState("");
  const [catName, setCatName] = React.useState("");
  const [editId, setEditId] = React.useState(null);

  const [car, setCar] = React.useState({
    car_name: "",
    car_category: "",
    car_motor: "4.0",
    car_year: 2024,
    car_color: "Black",
    car_distance: "0 km",
    car_description: "New car",
    car_price: 100000,
    car_tonirovka: false,
    car_gearbook: "avtomat",
    car_image: ""
  });

  const load = async () => {
    setErr("");
    try {
      const [c1, c2] = await Promise.all([api.get("/categories"), api.get("/cars")]);
      setCategories(c1.data.data);
      setCars(c2.data.data);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  };

  React.useEffect(() => { load(); }, []);

  const refresh = async () => {
    try {
      const { data } = await api.get("/auth/refresh");
      setToken(data.accessToken);
      alert("Access token yangilandi ✅");
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  const addCategory = async () => {
    try {
      await api.post("/categories", { name: catName, image: "" });
      setCatName("");
      load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

const delCategory = async (id) => {
  if (!confirm("Delete category?")) return;
  try {
    await api.delete(`/categories/${id}`);
    load();
  } catch (e) {
    alert(e?.response?.data?.message || e.message);
  }
};


  const addCar = async () => {
    try {
      if (editId) {
        await api.put(`/cars/${editId}`, car);
        setEditId(null);
      } else {
        await api.post("/cars", car);
      }
      setCar({ ...car, car_name: "", car_description: "New car" });
      load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

const delCar = async (id) => {
  if (!confirm("Delete car?")) return;
  try {
    await api.delete(`/cars/${id}`);
    load();
  } catch (e) {
    alert(e?.response?.data?.message || e.message);
  }
};

const startEditCar = (x) => {
  setEditId(x._id);
  setCar({
    car_name: x.car_name || "",
    car_category: x.car_category?._id || x.car_category || "",
    car_motor: x.car_motor || "",
    car_year: x.car_year || 2024,
    car_color: x.car_color || "",
    car_distance: x.car_distance || "",
    car_description: x.car_description || "",
    car_price: Number(x.car_price || 0),
    car_tonirovka: !!x.car_tonirovka,
    car_gearbook: x.car_gearbook || "",
    car_image: x.car_image || ""
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
};


  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="glass card">
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="badge">AccessToken: {token ? "bor ✅" : "yo'q ❌"}</span>
          <button className="btn ghost" onClick={refresh}>Refresh token</button>
        </div>
        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      </div>

      <div className="glass card">
        <h3 style={{ marginTop: 0 }}>Categories</h3>

        {isAdmin ? (
          <div className="row" style={{ display:"flex", gap:10, alignItems:"center" }}>
            <input className="input" placeholder="Category name" value={catName} onChange={(e)=>setCatName(e.target.value)} />
            <button className="btn primary" onClick={addCategory} disabled={!catName.trim()}>Add</button>
          </div>
        ) : (
          <small className="muted">Category qo'shish faqat admin</small>
        )}
        <hr />
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {categories.map(c => (
            <div key={c._id} className="glass card" style={{ boxShadow: "none" }}>
              <b>{c?.name || "(No name)"}</b><br />
              <small className="muted">{c._id}</small>
              {isAdmin ? (
                <div className="row" style={{ marginTop: 10, gap: 8 }}>
                  <button className="btn danger" onClick={() => delCategory(c._id)}>Delete</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="glass card">
        <h3 style={{ marginTop: 0 }}>Cars</h3>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input className="input" placeholder="Car name" value={car.car_name} onChange={(e)=>setCar({...car, car_name:e.target.value})} />
          <select className="input" value={car.car_category} onChange={(e)=>setCar({...car, car_category:e.target.value})}>
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c?.name || "(No name)"}</option>
            ))}
          </select>
          <input className="input" placeholder="Motor" value={car.car_motor} onChange={(e)=>setCar({...car, car_motor:e.target.value})} />
          <input className="input" type="number" placeholder="Year" value={car.car_year} onChange={(e)=>setCar({...car, car_year:Number(e.target.value)})} />
          <input className="input" placeholder="Color" value={car.car_color} onChange={(e)=>setCar({...car, car_color:e.target.value})} />
          <input className="input" placeholder="Distance" value={car.car_distance} onChange={(e)=>setCar({...car, car_distance:e.target.value})} />
          <select className="input" value={car.car_gearbook} onChange={(e)=>setCar({...car, car_gearbook:e.target.value})}>
            <option value="avtomat">Automatic</option>
            <option value="mexanika">Manual</option>
          </select>
          <input className="input" placeholder="Price" type="number" value={car.car_price} onChange={(e)=>setCar({...car, car_price:Number(e.target.value)})} />
          <input className="input" placeholder="Image URL" value={car.car_image} onChange={(e)=>setCar({...car, car_image:e.target.value})} />
          <label className="row" style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="checkbox" checked={car.car_tonirovka} onChange={(e)=>setCar({...car, car_tonirovka:e.target.checked})} />
            Tonirovka
          </label>
          <textarea className="input" style={{ minHeight: 44 }} placeholder="Description" value={car.car_description} onChange={(e)=>setCar({...car, car_description:e.target.value})} />
          <button className="btn primary" onClick={addCar} disabled={!car.car_name.trim() || !car.car_category}>{editId ? "Save car" : "Add car"}</button>
        </div>
        
        <hr />
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {cars.map(x => (
            <div key={x._id} className="glass card" style={{ boxShadow: "none" }}>
              <b>{x.car_name}</b> <span className="badge">{x.car_year}</span><br/>
              <small className="muted">{x.car_category?.name || "No category"}</small>
              <div style={{ marginTop: 8 }}>
                <small>Motor: {x.car_motor} • {x.car_color} • {x.car_distance}</small><br/>
                <small>Price: ${x.car_price}</small>
              </div>
              {canManageCar(x) ? (
                <div className="row" style={{ marginTop: 10, gap: 8 }}>
                  <button className="btn" onClick={() => startEditCar(x)}>Edit</button>
                  <button className="btn danger" onClick={() => delCar(x._id)}>Delete</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

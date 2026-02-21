import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { getRole } from "../lib/auth";

function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      {children}
    </div>
  );
}

export default function Cars() {
  const role = getRole();
  const isAdmin = role === "admin";

  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState("");

  const [carImage, setCarImage] = useState(null);

  const [form, setForm] = useState({
    car_name: "",
    car_category: "",
    car_tonirovka: "yo'q",
    car_motor: "",
    car_year: 2016,
    car_color: "",
    car_distance: 0,
    car_gearbook: "avtomat",
    car_description: "",
    car_price: 0,
  });

  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({
    car_name: "",
    car_tonirovka: "yo'q",
    car_motor: "",
    car_year: 2016,
    car_color: "",
    car_distance: 0,
    car_gearbook: "avtomat",
    car_description: "",
    car_price: 0,
  });

  const catOptions = useMemo(() => {
    const arr = Array.isArray(categories) ? categories : [];
    return arr
      .map((c) => ({ id: c?._id, name: c?.category_name }))
      .filter((x) => x.id && x.name);
  }, [categories]);

  async function loadAll() {
    setLoading(true);
    setMsg(""); setOk("");
    try {
      const catRes = await api("/api/category/all");
      setCategories(Array.isArray(catRes) ? catRes : []);

      const carRes = await api("/api/car/all");
      setCars(Array.isArray(carRes) ? carRes : []);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (!form.car_category && catOptions.length) {
      setForm((p) => ({ ...p, car_category: catOptions[0].id }));
    }
  }, [catOptions]); // eslint-disable-line

  function setValue(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function createCar(e) {
    e.preventDefault();
    setMsg(""); setOk("");

    if (!form.car_name.trim()) return setMsg("car_name majburiy");
    if (!form.car_category) return setMsg("car_category majburiy");
    if (!form.car_motor.trim()) return setMsg("car_motor majburiy");
    if (!form.car_color.trim()) return setMsg("car_color majburiy");
    if (!form.car_description.trim() || form.car_description.trim().length < 10)
      return setMsg("car_description kamida 10 ta belgi bo‘lsin");
    if (!carImage) return setMsg("car_image (file) majburiy");

    try {
      const fd = new FormData();
      fd.append("car_name", form.car_name.trim());
      fd.append("car_category", form.car_category);
      fd.append("car_tonirovka", form.car_tonirovka);
      fd.append("car_motor", form.car_motor.trim());
      fd.append("car_year", String(Number(form.car_year)));
      fd.append("car_color", form.car_color.trim());
      fd.append("car_distance", String(Number(form.car_distance)));
      fd.append("car_gearbook", form.car_gearbook);
      fd.append("car_description", form.car_description.trim());
      fd.append("car_price", String(Number(form.car_price)));
      fd.append("car_image", carImage); // ✅ guard shu nomni kutadi

      await api("/api/car/create", { method: "POST", body: fd });

      setOk("✅ Car created");
      setCarImage(null);
      setForm((p) => ({
        ...p,
        car_name: "",
        car_tonirovka: "yo'q",
        car_motor: "",
        car_year: 2016,
        car_color: "",
        car_distance: 0,
        car_gearbook: "avtomat",
        car_description: "",
        car_price: 0,
      }));
      await loadAll();
    } catch (err) {
      setMsg(err.message);
    }
  }

  function startEdit(c) {
    setEditId(c._id);
    setEdit({
      car_name: c.car_name || "",
      car_tonirovka: c.car_tonirovka || "yo'q",
      car_motor: c.car_motor || "",
      car_year: c.car_year || 2016,
      car_color: c.car_color || "",
      car_distance: c.car_distance || 0,
      car_gearbook: c.car_gearbook || "avtomat",
      car_description: c.car_description || "",
      car_price: c.car_price || 0,
    });
  }

  async function saveEdit() {
    if (!editId) return;
    setMsg(""); setOk("");
    try {
      await api(`/api/car/${editId}`, {
        method: "PUT",
        body: JSON.stringify(edit),
      });
      setEditId(null);
      setOk("✅ Car updated");
      await loadAll();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function delCar(id) {
    if (!confirm("Delete qilinsinmi?")) return;
    setMsg(""); setOk("");
    try {
      await api(`/api/car/${id}`, { method: "DELETE" });
      setOk("✅ Car deleted");
      await loadAll();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="card">
        <div className="h1">Mashinalar</div>
        <div className="muted">Create: /api/car/create (car_image majburiy)</div>

        <form onSubmit={createCar} style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="car_name (string)">
              <input className="input" value={form.car_name} onChange={(e)=>setValue("car_name", e.target.value)} placeholder="Masalan: Malibu" />
            </Field>

            <Field label="car_category (ObjectId) — Category tanlang">
              <select className="input" value={form.car_category} onChange={(e)=>setValue("car_category", e.target.value)}>
                {!catOptions.length ? (
                  <option value="">Category yo‘q</option>
                ) : (
                  catOptions.map((c)=>(
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                )}
              </select>
            </Field>

            <Field label="car_tonirovka (bor / yo'q)">
              <select className="input" value={form.car_tonirovka} onChange={(e)=>setValue("car_tonirovka", e.target.value)}>
                <option value="yo'q">yo'q</option>
                <option value="bor">bor</option>
              </select>
            </Field>

            <Field label="car_motor (string)">
              <input className="input" value={form.car_motor} onChange={(e)=>setValue("car_motor", e.target.value)} placeholder="Masalan: 1.6" />
            </Field>

            <Field label="car_year (number)">
              <input className="input" type="number" value={form.car_year} onChange={(e)=>setValue("car_year", e.target.value)} />
            </Field>

            <Field label="car_color (string)">
              <input className="input" value={form.car_color} onChange={(e)=>setValue("car_color", e.target.value)} placeholder="Masalan: Oq" />
            </Field>

            <Field label="car_distance (number)">
              <input className="input" type="number" value={form.car_distance} onChange={(e)=>setValue("car_distance", e.target.value)} placeholder="Masalan: 3000" />
            </Field>

            <Field label="car_gearbook (avtomat / mexanik)">
              <select className="input" value={form.car_gearbook} onChange={(e)=>setValue("car_gearbook", e.target.value)}>
                <option value="avtomat">avtomat</option>
                <option value="mexanik">mexanik</option>
              </select>
            </Field>
          </div>

          <Field label="car_description (min 10)">
            <textarea value={form.car_description} onChange={(e)=>setValue("car_description", e.target.value)} placeholder="Tavsif..." />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="car_price (number)">
              <input className="input" type="number" value={form.car_price} onChange={(e)=>setValue("car_price", e.target.value)} placeholder="Masalan: 15000" />
            </Field>

            <Field label="car_image (file)">
              <input className="input" type="file" accept="image/*" onChange={(e)=>setCarImage(e.target.files?.[0] || null)} />
            </Field>
          </div>

          <button className="btn" type="submit" disabled={!catOptions.length}>
            Create Car
          </button>

          {msg && <div className="error">{msg}</div>}
          {ok && <div className="ok">{ok}</div>}
        </form>
      </div>

      <div className="card">
        {loading ? (
          <div className="muted">Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Photo</th>
                <th>Car</th>
                <th>Category</th>
                <th style={{ width: 90 }}>Year</th>
                <th style={{ width: 120 }}>Price</th>
                <th style={{ width: 260 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((c) => {
                const id = c._id;
                const catName = c?.car_category?.category_name || "—";
                const photo = c?.car_image ? `/car/photos/${c.car_image}` : "";
                const editing = editId === id;

                return (
                  <tr key={id}>
                    <td>
                      {photo ? (
                        <img src={photo} alt="car" style={{ width: 90, height: 60, objectFit: "cover", borderRadius: 12, border: "1px solid #e5e7eb" }} />
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>

                    <td>
                      {editing ? (
                        <input className="input" value={edit.car_name} onChange={(e)=>setEdit((p)=>({...p, car_name:e.target.value}))} />
                      ) : (
                        c.car_name
                      )}
                    </td>

                    <td className="muted">{catName}</td>

                    <td>
                      {editing ? (
                        <input className="input" type="number" value={edit.car_year} onChange={(e)=>setEdit((p)=>({...p, car_year:Number(e.target.value)}))} />
                      ) : (
                        c.car_year
                      )}
                    </td>

                    <td>
                      {editing ? (
                        <input className="input" type="number" value={edit.car_price} onChange={(e)=>setEdit((p)=>({...p, car_price:Number(e.target.value)}))} />
                      ) : (
                        c.car_price
                      )}
                    </td>

                    <td>
                      {isAdmin ? (
                        <div className="row">
                          {editing ? (
                            <>
                              <button className="btn" type="button" onClick={saveEdit}>Save</button>
                              <button className="btn secondary" type="button" onClick={()=>setEditId(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="btn secondary" type="button" onClick={()=>startEdit(c)}>Edit</button>
                              <button className="btn secondary" type="button" onClick={()=>delCar(id)}>Delete</button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!cars.length && (
                <tr><td colSpan="6" className="muted">No cars</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { http } from "../api/http.js";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [cats, setCats] = useState([]);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const [form, setForm] = useState({
    car_name: "",
    car_category: "",
    car_motor: "",
    car_year: "",
    car_color: "",
    car_distance: "",
    car_gearbook: "",
    car_description: "",
    car_price: "",
    car_tonirovka: false,
    car_image: "",
  });

  async function loadAll() {
    setErr(""); setOk("");
    try {
      const [c1, c2] = await Promise.all([
        http.get("/api/cars"),
        http.get("/api/categories"),
      ]);

      const arrCars = Array.isArray(c1) ? c1 : (c1?.data || []);
      const arrCats = Array.isArray(c2) ? c2 : (c2?.data || []);

      setCars(arrCars);
      setCats(arrCats);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const filtered = cars.filter((x) => {
    const name = (x.car_name || x.name || "").toLowerCase();
    const okQ = q ? name.includes(q.toLowerCase()) : true;
    const okC = cat ? (String(x.car_category) === String(cat) || x.car_category?._id === cat) : true;
    return okQ && okC;
  });

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  async function create(e) {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      const body = { ...form };

      // car_category int bo‘lsa ham string bo‘lsa ham yuboramiz
      if (!body.car_category) body.car_category = cat || "";

      const data = await http.post("/api/cars", body);
      setOk(data?.message || "Car created!");
      setForm({
        car_name: "",
        car_category: "",
        car_motor: "",
        car_year: "",
        car_color: "",
        car_distance: "",
        car_gearbook: "",
        car_description: "",
        car_price: "",
        car_tonirovka: false,
        car_image: "",
      });
      loadAll();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function remove(id) {
    setErr(""); setOk("");
    try {
      const data = await http.del(`/api/cars/${id}`);
      setOk(data?.message || "Deleted!");
      loadAll();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="card">
      <div className="flex between center wrap gap10">
        <div>
          <h2 className="h2">Cars</h2>
          <p className="p">Mashinalar ro‘yxati va yangi mashina qo‘shish</p>
        </div>
        <button className="btn btnGhost" onClick={loadAll}>🔄 Refresh</button>
      </div>

      {err ? <div className="alert alertError mt12">{err}</div> : null}
      {ok ? <div className="alert alertOk mt12">{ok}</div> : null}

      {/* Filters */}
      <div className="card mt16 filters">
        <div className="filterBar">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search car name..." />
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {cats.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create form */}
      <div className="card mt16">
        <div className="kicker">➕ Add new car</div>
        <form className="form mt12" onSubmit={create}>
          <div className="formRow">
            <div>
              <label className="label">Car name</label>
              <input className="input" name="car_name" value={form.car_name} onChange={onChange} />
            </div>
            <div>
              <label className="label">Category</label>
              <select name="car_category" value={form.car_category} onChange={onChange}>
                <option value="">Select</option>
                {cats.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="help">Agar sizning backend category int bo‘lsa ham ishlashi mumkin</div>
            </div>
          </div>

          <div className="formRow">
            <div>
              <label className="label">Motor</label>
              <input className="input" name="car_motor" value={form.car_motor} onChange={onChange} placeholder="2.0 Turbo" />
            </div>
            <div>
              <label className="label">Year</label>
              <input className="input" name="car_year" value={form.car_year} onChange={onChange} placeholder="2022" />
            </div>
          </div>

          <div className="formRow">
            <div>
              <label className="label">Color</label>
              <input className="input" name="car_color" value={form.car_color} onChange={onChange} placeholder="Black" />
            </div>
            <div>
              <label className="label">Distance</label>
              <input className="input" name="car_distance" value={form.car_distance} onChange={onChange} placeholder="45 000 km" />
            </div>
          </div>

          <div className="formRow">
            <div>
              <label className="label">Gearbox</label>
              <input className="input" name="car_gearbook" value={form.car_gearbook} onChange={onChange} placeholder="Automatic" />
            </div>
            <div>
              <label className="label">Price</label>
              <input className="input" name="car_price" value={form.car_price} onChange={onChange} placeholder="85000" />
            </div>
          </div>

          <div>
            <label className="label">Image URL (ixtiyoriy)</label>
            <input className="input" name="car_image" value={form.car_image} onChange={onChange} placeholder="https://..." />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea name="car_description" value={form.car_description} onChange={onChange} />
          </div>

          <div className="flex center gap10 wrap">
            <label className="kicker" style={{ cursor: "pointer" }}>
              <input type="checkbox" name="car_tonirovka" checked={form.car_tonirovka} onChange={onChange} />
              Tonirovka
            </label>

            <button className="btn btnPrimary btnLg">Save</button>
          </div>
        </form>
      </div>

      {/* Cars grid */}
      <div className="mt16 gridCars">
        {filtered.map((c, i) => (
          <div className="carCard" key={c._id || c.id || i}>
            <div className="carThumb">
              {c.car_image || c.image ? (
                <img src={c.car_image || c.image} alt="" />
              ) : (
                <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#64748b", fontWeight: 800 }}>
                  No image
                </div>
              )}
              <div className="badgeTop">TOP</div>
            </div>
            <div className="carBody">
              <div className="carTitle">{c.car_name || c.name}</div>
              <div className="carPrice">{c.car_price ? `$${c.car_price}` : "—"}</div>

              <div className="carMeta">
                <span className="metaPill">🛠 {c.car_motor || "—"}</span>
                <span className="metaPill">📅 {c.car_year || "—"}</span>
                <span className="metaPill">🎨 {c.car_color || "—"}</span>
              </div>

              <div className="carActions">
                <button className="btn btnDanger btnSm" onClick={() => remove(c._id || c.id)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {!filtered.length ? (
          <div className="empty" style={{ gridColumn: "1 / -1" }}>
            <b>Mashina topilmadi</b>
            <span>Filterlarni o‘zgartiring yoki yangi mashina qo‘shing</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
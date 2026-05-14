import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import CarCard from "../components/CarCard";

export default function Cars({ user, wishlist, toggleWish }) {
  const nav = useNavigate();
  const [cars, setCars] = React.useState([]);
  const [cats, setCats] = React.useState([]);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("");
  const [sort, setSort] = React.useState("new");
  const [min, setMin] = React.useState("");
  const [max, setMax] = React.useState("");
  const [gear, setGear] = React.useState("");
  const [err, setErr] = React.useState("");

  const load = async () => {
    setErr("");
    try {
      const [c1, c2] = await Promise.all([
        api.get("/cars"),
        api.get("/categories"),
      ]);
      setCars(c1.data.data || []);
      setCats(c2.data.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Ma'lumotlarni yuklashda xatolik");
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const filtered = React.useMemo(() => {
    let arr = [...cars];
    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter(
        (x) =>
          (x.car_name || "").toLowerCase().includes(s) ||
          (x.car_description || "").toLowerCase().includes(s)
      );
    }
    if (cat)
      arr = arr.filter(
        (x) => String(x?.car_category?._id || x.car_category) === String(cat)
      );
    if (gear)
      arr = arr.filter((x) =>
        (x.car_gearbook || "").toLowerCase().includes(gear.toLowerCase())
      );
    const minN = min === "" ? null : Number(min);
    const maxN = max === "" ? null : Number(max);
    if (minN !== null && !Number.isNaN(minN))
      arr = arr.filter((x) => Number(x.car_price) >= minN);
    if (maxN !== null && !Number.isNaN(maxN))
      arr = arr.filter((x) => Number(x.car_price) <= maxN);

    if (sort === "price_up")
      arr.sort((a, b) => Number(a.car_price) - Number(b.car_price));
    if (sort === "price_down")
      arr.sort((a, b) => Number(b.car_price) - Number(a.car_price));
    if (sort === "new")
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return arr;
  }, [cars, q, cat, sort, min, max, gear]);

  const reset = () => {
    setQ("");
    setCat("");
    setSort("new");
    setMin("");
    setMax("");
    setGear("");
  };

  return (
    <>
      <div className="glass toolbar">
        <div className="top">
          <input
            className="input"
            placeholder="Qidirish..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">Barcha kategoriyalar</option>
            {cats.map((c) => (
              <option key={c._id} value={c._id}>
                {c?.name || "(Nomsiz)"}
              </option>
            ))}
          </select>
          <select value={gear} onChange={(e) => setGear(e.target.value)}>
            <option value="">Uzatmalar</option>
            <option value="avtomat">Avtomat</option>
            <option value="mexanika">Mexanik</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Yangi</option>
            <option value="price_up">Narx: pastdan</option>
            <option value="price_down">Narx: yuqoridan</option>
          </select>
        </div>

        <div className="bottom">
          <input
            className="input"
            placeholder="Min narx"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
          <input
            className="input"
            placeholder="Max narx"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
          <div />
          <button className="btn" onClick={reset}>
            Tozalash
          </button>
        </div>

        {err ? <div className="notice">{err}</div> : null}
      </div>

      <div
        className="grid cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          padding: "24px 0",
        }}
      >
        {filtered.length === 0 && !err ? (
          <div className="muted" style={{ gridColumn: "1/-1", textAlign: "center", padding: 40 }}>
            Mashina topilmadi
          </div>
        ) : null}
        {filtered.map((x) => (
          <CarCard
            key={x._id}
            car={x}
            wishlist={wishlist}
            toggleWish={toggleWish}
            user={user}
          />
        ))}
      </div>
    </>
  );
}

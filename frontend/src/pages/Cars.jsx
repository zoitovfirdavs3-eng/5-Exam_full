
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

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

function money(n){
  const x = Number(n||0);
  return x.toLocaleString("en-US");
}

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
    try{
      const [c1, c2] = await Promise.all([ api.get("/cars"), api.get("/categories") ]);
      setCars(c1.data.data || []);
      setCats(c2.data.data || []);
    }catch(e){
      setErr(e?.response?.data?.message || "Failed to load");
    }
  };

  React.useEffect(()=>{ load(); }, []);

  const filtered = React.useMemo(()=>{
    let arr = [...cars];
    if(q.trim()){
      const s=q.toLowerCase();
      arr = arr.filter(x => (x.car_name||"").toLowerCase().includes(s) || (x.car_description||"").toLowerCase().includes(s));
    }
    if(cat) arr = arr.filter(x => String(x?.car_category?._id || x.car_category) === String(cat));
    if(gear) arr = arr.filter(x => (x.car_gearbook||"").toLowerCase().includes(gear.toLowerCase()));
    const minN = min===""? null : Number(min);
    const maxN = max===""? null : Number(max);
    if(minN!==null && !Number.isNaN(minN)) arr = arr.filter(x => Number(x.car_price) >= minN);
    if(maxN!==null && !Number.isNaN(maxN)) arr = arr.filter(x => Number(x.car_price) <= maxN);

    if(sort==="price_up") arr.sort((a,b)=>Number(a.car_price)-Number(b.car_price));
    if(sort==="price_down") arr.sort((a,b)=>Number(b.car_price)-Number(a.car_price));
    if(sort==="new") arr.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    return arr;
  },[cars,q,cat,sort,min,max,gear]);

  const reset = ()=>{
    setQ(""); setCat(""); setSort("new"); setMin(""); setMax(""); setGear("");
  };

  return (
    <>
      <div className="glass toolbar">
        <div className="top">
          <input className="input" placeholder="Search..." value={q} onChange={(e)=>setQ(e.target.value)} />
          <select value={cat} onChange={(e)=>setCat(e.target.value)}>
            <option value="">All categories</option>
            {cats.map(c => <option key={c._id} value={c._id}>{c?.name || "(No name)"}</option>)}
          </select>
          <select value={gear} onChange={(e)=>setGear(e.target.value)}>
            <option value="">Transmission</option>
            <option value="avtomat">Automatic</option>
            <option value="mexanika">Manual</option>
          </select>
          <select value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="new">Newest</option>
            <option value="price_up">Price: low to high</option>
            <option value="price_down">Price: high to low</option>
          </select>
        </div>

        <div className="bottom">
          <input className="input" placeholder="Min price" value={min} onChange={(e)=>setMin(e.target.value)} />
          <input className="input" placeholder="Max price" value={max} onChange={(e)=>setMax(e.target.value)} />
          <div />
          <button className="btn" onClick={reset}>Reset</button>
        </div>

        {err ? <div className="notice">{err}</div> : null}
      </div>

      <div className="grid cards">
        {filtered.map(x => {
          const wished = wishlist.includes(x._id);
          return (
            <div key={x._id} className="glass car">
              <div className="img">
                {x.car_image ? (
                  <img 
                    src={imgUrl(x.car_image)} 
                    alt={x.car_name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div className="muted" style={{ display: x.car_image ? 'none' : 'block' }}>No image</div>
              </div>

              <div className="body">
                <div className="price">${money(x.car_price)}</div>
                <div className="title">{x.car_name}</div>
                <div className="tag">{x?.car_category?.name || "Category"}</div>

                <div className="meta">
                  <span>📅 {x.car_year}</span>
                  <span>🛣 {x.car_distance}</span>
                  <span>⚙ {x.car_gearbook || "-"}</span>
                </div>

                <div className="actions">
                  <Link className="btn primary" to={`/cars/${x._id}`}>View details</Link>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!user) return nav("/login");
                      toggleWish(x._id);
                    }}
                    title={user ? "Wishlist" : "Login to use wishlist"}
                  >
                    {wished ? "♥" : "♡"}
                  </button>
                </div>

                <div className="muted" style={{ marginTop:10, fontSize:12 }}>
                  Seller: {x?.owner?.first_name || "User"} • @{(x?.owner?.email || "").split("@")[0]}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

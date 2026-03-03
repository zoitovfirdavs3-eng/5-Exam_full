
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

function imgUrl(u) {
  if (!u) return "";
  const s = String(u);
  if (s.startsWith("http")) return s;
  
  // Use VITE_ASSET_BASE_URL for static files
  const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL || "http://localhost:3000";
  
  // Ensure proper path joining
  const imagePath = s.startsWith("/") ? s : "/" + s;
  const fullUrl = assetBaseUrl + imagePath;
  
  // Debug logging
  console.log("🔍 CarDetails Image URL Debug:", {
    original: u,
    assetBaseUrl,
    imagePath,
    fullUrl
  });
  
  return fullUrl;
}

function money(n){
  const x = Number(n||0);
  return x.toLocaleString("en-US");
}

export default function CarDetails({ user, wishlist, toggleWish }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [car, setCar] = React.useState(null);
  const [err, setErr] = React.useState("");

  React.useEffect(()=>{
    api.get("/cars").then(r=>{
      const found = (r.data.data||[]).find(x=>x._id===id);
      setCar(found || null);
    }).catch(e=>{
      setErr(e?.response?.data?.message || "Failed to load");
    });
  },[id]);

  if(err) return <div className="notice">{err}</div>;
  if(!car) return <div className="muted">Loading...</div>;

  const wished = wishlist.includes(car._id);

  return (
    <div className="glass card" style={{ padding:22 }}>
      <div className="grid" style={{ gridTemplateColumns:"1fr 1.2fr", gap:18 }}>
        <div className="glass" style={{ borderRadius:18, overflow:"hidden", border:"1px solid rgba(255,255,255,.10)" }}>
          <div style={{ height:320, background:"rgba(255,255,255,.04)" }}>
            {car.car_image ? (
              <img 
                src={imgUrl(car.car_image)} 
                alt={car.car_name} 
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted)">No image</div>';
                }}
              />
            ) : (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--muted)" }}>No image</div>
            )}
          </div>
        </div>

        <div>
          <div className="muted" style={{ textTransform:"capitalize" }}>{car?.car_category?.name || "Category"}</div>
          <div style={{ fontSize:34, fontWeight:900, marginTop:4 }}>{car.car_name}</div>
          <div className="price" style={{ fontSize:34, marginTop:10 }}>${money(car.car_price)}</div>

          <div className="grid" style={{ gridTemplateColumns:"1fr 1fr", gap:10, marginTop:14 }}>
            <div className="glass card"><div className="muted">Year</div><b>{car.car_year}</b></div>
            <div className="glass card"><div className="muted">Mileage</div><b>{car.car_distance}</b></div>
            <div className="glass card"><div className="muted">Fuel</div><b>{car.car_tonirovka ? "bor" : "yo'q"}</b></div>
            <div className="glass card"><div className="muted">Transmission</div><b>{car.car_gearbook || "-"}</b></div>
            <div className="glass card"><div className="muted">Engine</div><b>{car.car_motor}</b></div>
            <div className="glass card"><div className="muted">Color</div><b>{car.car_color}</b></div>
          </div>

          <div className="actions" style={{ marginTop:16 }}>
            <button
              className="btn"
              onClick={() => {
                if (!user) return nav("/login");
                toggleWish(car._id);
              }}
            >
              {wished ? "♥ Saved" : "♡ Save"}
            </button>
            <button
              className="btn primary"
              onClick={() => {
                if (!user) return nav("/login");
                nav(`/chat?car=${car._id}`);
              }}
            >
              Chat seller
            </button>
            <button className="btn" onClick={()=>nav(-1)}>Back</button>
          </div>

          <div style={{ marginTop:16 }}>
            <div className="muted" style={{ marginBottom:6 }}>Description</div>
            <div className="muted" style={{ lineHeight:1.6 }}>{car.car_description}</div>
          </div>

          <div style={{ marginTop:16 }}>
            <div className="muted" style={{ marginBottom:6 }}>Seller</div>
            <div className="glass card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div>
                <b>{car?.owner?.first_name || "User"} {car?.owner?.last_name || ""}</b>
                <div className="muted">@{(car?.owner?.email || "").split("@")[0]}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

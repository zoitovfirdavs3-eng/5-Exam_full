
import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Sell({ user }) {
  const nav = useNavigate();
  const [cats, setCats] = React.useState([]);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [form, setForm] = React.useState({
    car_name:"",
    car_category:"",
    car_tonirovka:false,
    car_motor:"",
    car_year:new Date().getFullYear(),
    car_color:"",
    car_distance:"",
    car_gearbook:"avtomat",
    car_description:"",
    car_price:"",
    car_image:""
  });

  const [imageFile, setImageFile] = React.useState(null);
  const fileInputRef = React.useRef(null);

  React.useEffect(()=>{
    api.get("/categories").then(r=>setCats(r.data.data||[])).catch(()=>{});
  },[]);

  const set=(k,v)=>setForm(s=>({ ...s, [k]:v }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErr("Faqat rasm fayllarini yuklash mumkin");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErr("Rasm hajmi 5MB dan oshmasligi kerak");
        return;
      }
      setImageFile(file);
      setErr("");
    }
  };

  const handleRemoveFile = () => {
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const submit=async(e)=>{
    e.preventDefault();
    setErr(""); setOk("");
    if(!user) { setErr("Login first"); return; }
    
    // Validate file selection
    if (!imageFile) {
      setErr("Iltimos, avtomobil rasmini yuklang");
      return;
    }
    
    try{
      const fd = new FormData();
      Object.entries({
        ...form,
        car_year: Number(form.car_year),
        car_price: Number(form.car_price),
      }).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        fd.append(k, String(v));
      });

      if (imageFile) fd.append("image", imageFile);

      await api.post("/cars", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOk("Created!");
      setTimeout(()=>nav("/my-listings"), 600);
    }catch(e2){
      setErr(e2?.response?.data?.message || "Create failed");
    }
  };

  return (
    <div className="glass card">
      <h1 className="h1">Sell a car</h1>
      <div className="muted" style={{ marginBottom:14 }}>
        Create listing. Only you (owner) or admin can edit/delete.
      </div>

      <form onSubmit={submit} className="grid" style={{ gap:12 }}>
        <input className="input" placeholder="Title (e.g., Malibu 2 Turbo)" value={form.car_name} onChange={(e)=>set("car_name", e.target.value)} />

        <div className="formgrid">
          <input className="input" placeholder="Price" value={form.car_price} onChange={(e)=>set("car_price", e.target.value)} />
          <select value={form.car_category} onChange={(e)=>set("car_category", e.target.value)}>
            <option value="">Select category</option>
            {cats.map(c=> <option key={c._id} value={c._id}>{c?.name || "(No name)"}</option>)}
          </select>
        </div>

        <div className="formgrid">
          <input className="input" placeholder="Year" value={form.car_year} onChange={(e)=>set("car_year", e.target.value)} />
          <input className="input" placeholder="Mileage (e.g., 1000 km)" value={form.car_distance} onChange={(e)=>set("car_distance", e.target.value)} />
        </div>

        <div className="formgrid">
          <label className="row" style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="checkbox" checked={form.car_tonirovka} onChange={(e)=>set("car_tonirovka", e.target.checked)} />
            Tonirovka (bor/yo'q)
          </label>
          <select value={form.car_gearbook} onChange={(e)=>set("car_gearbook", e.target.value)}>
            <option value="avtomat">Automatic</option>
            <option value="mexanika">Manual</option>
          </select>
        </div>

        <div className="formgrid">
          <input className="input" placeholder="Engine (e.g., 2.0)" value={form.car_motor} onChange={(e)=>set("car_motor", e.target.value)} />
          <input className="input" placeholder="Color" value={form.car_color} onChange={(e)=>set("car_color", e.target.value)} />
        </div>

        <textarea className="input" rows={5} placeholder="Description" value={form.car_description} onChange={(e)=>set("car_description", e.target.value)} />

        <div className="glass" style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,.10)" }}>
          <div className="muted" style={{ marginBottom: 8, fontSize: 13 }}>Car image (upload)</div>
          
          <div className="file-upload-container">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
              id="car-image-upload"
            />
            <label htmlFor="car-image-upload" className="file-upload-label">
              <span className="upload-icon">📷</span>
              <span className="upload-text">
                {imageFile ? imageFile.name : "Fayl tanlash"}
              </span>
            </label>
            {imageFile && (
              <button
                type="button"
                className="file-remove-btn"
                onClick={handleRemoveFile}
                title="O'chirish"
              >
                ❌
              </button>
            )}
          </div>
          
          <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
            Link yozish shart emas — rasmni shu yerda yuklaysiz.
          </div>
        </div>

        <div className="row" style={{ display:"flex", gap:10 }}>
          <button className="btn primary" type="submit">Publish</button>
          <button className="btn" type="button" onClick={()=>nav("/cars")}>Back</button>
        </div>
      </form>

      {ok ? <div style={{ color:"#b6ffc6", marginTop:10, fontSize:13 }}>{ok}</div> : null}
      {err ? <div className="notice">{err}</div> : null}
    </div>
  );
}

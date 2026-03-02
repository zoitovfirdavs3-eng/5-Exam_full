
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function money(n){
  const x = Number(n||0);
  return x.toLocaleString("en-US");
}

export default function MyListings({ user }) {
  const nav = useNavigate();
  const [cars, setCars] = React.useState([]);
  const [err, setErr] = React.useState("");

  const load = async () => {
    setErr("");
    try{
      const { data } = await api.get("/cars");
      const all = data.data || [];
      const me = user?.id;
      const mine = me ? all.filter(x => String(x?.owner?._id || x.owner) === String(me)) : [];
      setCars(mine);
    }catch(e){
      setErr(e?.response?.data?.message || "Failed to load");
    }
  };

  React.useEffect(()=>{ load(); }, []);

  const del = async(id)=>{
    if(!confirm("Delete car?")) return;
    try{ await api.delete("/cars/"+id); load(); }
    catch(e){ alert(e?.response?.data?.message || "Delete failed"); }
  };

  if(!user){
    return (
      <div className="glass card">
        <h1 className="h1">My listings</h1>
        <div className="muted">Login to see your listings.</div>
      </div>
    );
  }

  return (
    <>
      <div className="glass card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
        <div>
          <h1 className="h1" style={{ marginBottom:2 }}>My listings</h1>
          <div className="muted">Only you can edit/delete your cars (admin can manage all).</div>
        </div>
        <button className="btn primary" onClick={()=>nav("/sell")}>+ New</button>
      </div>

      {err ? <div className="notice">{err}</div> : null}

      <div className="grid cards" style={{ marginTop:14 }}>
        {cars.map(x=>(
          <div key={x._id} className="glass card">
            <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:16 }}>{x.car_name}</div>
                <div className="muted">${money(x.car_price)} • {x.car_year}</div>
              </div>
              <div className="badge">approved</div>
            </div>

            <div className="actions" style={{ marginTop:12 }}>
              <Link className="btn" to={`/cars/${x._id}`}>View</Link>
              <button className="btn danger" onClick={()=>del(x._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

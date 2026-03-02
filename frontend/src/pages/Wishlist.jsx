
import React from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function money(n){
  const x = Number(n||0);
  return x.toLocaleString("en-US");
}

export default function Wishlist({ wishlist, toggleWish }) {
  const [cars, setCars] = React.useState([]);

  React.useEffect(()=>{
    api.get("/cars").then(r=>setCars(r.data.data||[])).catch(()=>{});
  },[]);

  const items = cars.filter(x=>wishlist.includes(x._id));

  return (
    <div className="glass card">
      <h1 className="h1">Wishlist</h1>
      <div className="muted" style={{ marginBottom:14 }}>Saved cars (local).</div>

      <div className="grid cards">
        {items.map(x=>(
          <div key={x._id} className="glass car">
            <div className="img">{x.car_image ? <img src={x.car_image} alt={x.car_name} /> : null}</div>
            <div className="body">
              <div className="price">${money(x.car_price)}</div>
              <div className="title">{x.car_name}</div>
              <div className="actions">
                <Link className="btn primary" to={`/cars/${x._id}`}>View</Link>
                <button className="btn" onClick={()=>toggleWish(x._id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        {items.length===0 ? <div className="muted">Empty.</div> : null}
      </div>
    </div>
  );
}

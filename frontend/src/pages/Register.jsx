
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = React.useState({ first_name:"", last_name:"", age:"18", email:"", password:"" });
  const [ok, setOk] = React.useState("");
  const [err, setErr] = React.useState("");

  const set = (k,v)=>setForm(s=>({ ...s, [k]:v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    try{
      console.log("🔍 Register Debug:", {
        url: api.defaults.baseURL + "/auth/register",
        email: form.email.trim().toLowerCase(),
        hasPassword: !!form.password.trim()
      });

      const { data } = await api.post("/auth/register", { 
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        age: Number(form.age),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim()
      });
      
      console.log("✅ Register Response:", {
        status: data.status,
        message: data.message
      });
      
      setOk("Ro'yxatdan o'tdingiz! Endi login qiling.");
      setTimeout(()=>nav("/login"), 2000);
    }catch(e2){
      console.error("❌ Register Error:", {
        status: e2?.response?.status,
        message: e2?.response?.data?.message,
        isDuplicate: e2?.response?.status === 409
      });
      
      const status = e2?.response?.status;
      const message = e2?.response?.data?.message;
      
      if (status === 409) {
        setErr("Bu email allaqachon ro'yxatdan o'tgan. Boshqa email kiriting.");
      } else if (status === 400) {
        setErr(message || "Ma'lumotlar to'liq emas. Barcha maydonlarni to'ldiring.");
      } else if (status >= 500) {
        setErr("Serverda xatolik yuz berdi. Iltimos, birozdan keyinroq urinib ko'ring.");
      } else {
        setErr(message || "Ro'yxatdan o'tishda xatolik yuz berdi.");
      }
    }
  };

  return (
    <div className="grid" style={{ placeItems:"center" }}>
      <div className="glass card" style={{ width:"min(560px,100%)", padding:22 }}>
        <h1 className="h1">Register</h1>
        <div className="muted" style={{ marginBottom:14 }}>Create account to sell cars.</div>

        <form onSubmit={submit} className="grid" style={{ gap:12 }}>
          <div className="formgrid">
            <input className="input" placeholder="First name" value={form.first_name} onChange={(e)=>set("first_name", e.target.value)} />
            <input className="input" placeholder="Last name" value={form.last_name} onChange={(e)=>set("last_name", e.target.value)} />
          </div>
          <div className="formgrid">
            <input className="input" placeholder="Age" value={form.age} onChange={(e)=>set("age", e.target.value)} />
            <input className="input" placeholder="Email" value={form.email} onChange={(e)=>set("email", e.target.value)} />
          </div>
          <input className="input" type="password" placeholder="Password (min 6)" value={form.password} onChange={(e)=>set("password", e.target.value)} />
          <button className="btn primary" type="submit">Register</button>
        </form>

        {ok ? <div style={{ color:"#b6ffc6", marginTop:10, fontSize:13 }}>{ok}</div> : null}
        {err ? <div className="notice">{err}</div> : null}

        <div className="muted" style={{ marginTop:14, fontSize:13 }}>
          Have account? <Link to="/login" style={{ color:"var(--primary)" }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { getRole } from "../lib/auth";

export default function Categories() {
  const role = getRole();
  const isAdmin = role === "admin";

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState("");

  const [createName, setCreateName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const filtered = useMemo(() => list, [list]);

  async function load() {
    setMsg("");
    setOk("");
    setLoading(true);
    try {
      const data = await api("/api/category/all");
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    if (!createName.trim()) return;
    setMsg(""); setOk("");
    try {
      await api("/api/category/create", {
        method: "POST",
        body: JSON.stringify({ category_name: createName.trim() }),
      });
      setCreateName("");
      setOk("✅ Category created");
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  function startEdit(c) {
    setEditId(c._id);
    setEditName(c.category_name || "");
  }

  async function saveEdit() {
    if (!editId) return;
    setMsg(""); setOk("");
    try {
      await api(`/api/category/${editId}`, {
        method: "PUT",
        body: JSON.stringify({ category_name: editName.trim() }),
      });
      setEditId(null);
      setEditName("");
      setOk("✅ Category updated");
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function del(id) {
    if (!confirm("Delete qilinsinmi?")) return;
    setMsg(""); setOk("");
    try {
      await api(`/api/category/${id}`, { method: "DELETE" });
      setOk("✅ Category deleted");
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="card">
        <div className="h1">Kategoriyalar</div>
        <div className="muted">GET: /api/category/all</div>

        {isAdmin ? (
          <form onSubmit={create} className="row" style={{ marginTop: 14 }}>
            <input
              className="input"
              style={{ flex: "1 1 320px" }}
              placeholder="category_name (masalan: Chevrolet)"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
            <button className="btn" type="submit">Create</button>
          </form>
        ) : (
          <div className="pill" style={{ marginTop: 14 }}>
            Siz admin emassiz — create/update/delete yopiq (faqat ko‘rish).
          </div>
        )}

        {msg && <div className="error" style={{ marginTop: 12 }}>{msg}</div>}
        {ok && <div className="ok" style={{ marginTop: 12 }}>{ok}</div>}
      </div>

      <div className="card">
        {loading ? (
          <div className="muted">Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 300 }}>ID</th>
                <th>Name</th>
                <th style={{ width: 240 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const id = c._id;
                const isEditing = editId === id;
                return (
                  <tr key={id}>
                    <td className="muted" style={{ fontSize: 12 }}>{id}</td>
                    <td>
                      {isEditing ? (
                        <input className="input" value={editName} onChange={(e)=>setEditName(e.target.value)} />
                      ) : (
                        c.category_name
                      )}
                    </td>
                    <td>
                      {isAdmin ? (
                        <div className="row" style={{ justifyContent: "flex-start" }}>
                          {isEditing ? (
                            <>
                              <button className="btn" type="button" onClick={saveEdit}>Save</button>
                              <button className="btn secondary" type="button" onClick={()=>{setEditId(null); setEditName("");}}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="btn secondary" type="button" onClick={()=>startEdit(c)}>Edit</button>
                              <button className="btn secondary" type="button" onClick={()=>del(id)}>Delete</button>
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
              {!filtered.length && (
                <tr><td colSpan="3" className="muted">No categories</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

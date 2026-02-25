import { useEffect, useState } from "react";
import { http } from "../api/http.js";
import Modal from "../components/Modal.jsx";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");

  async function load() {
    setErr(""); setOk("");
    try {
      const data = await http.get("/api/categories");
      const arr = Array.isArray(data) ? data : (data?.data || []);
      setItems(arr);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    setErr(""); setOk("");
    try {
      const data = await http.post("/api/categories", { name });
      setOk(data?.message || "Created!");
      setName("");
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  function openEdit(c) {
    setEditId(c._id || c.id);
    setEditName(c.name || "");
    setEditOpen(true);
  }

  async function saveEdit() {
    setErr(""); setOk("");
    try {
      const id = editId;
      const data = await http.put(`/api/categories/${id}`, { name: editName });
      setOk(data?.message || "Updated!");
      setEditOpen(false);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function remove(id) {
    setErr(""); setOk("");
    try {
      const data = await http.del(`/api/categories/${id}`);
      setOk(data?.message || "Deleted!");
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="card">
      <div className="flex between center wrap gap10">
        <div>
          <h2 className="h2">Categories</h2>
          <p className="p">Yangi kategoriya qo‘shish / tahrirlash / o‘chirish</p>
        </div>
      </div>

      {err ? <div className="alert alertError mt12">{err}</div> : null}
      {ok ? <div className="alert alertOk mt12">{ok}</div> : null}

      <div className="mt16 filterBar">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name..." />
        <button className="btn btnPrimary" onClick={create}>➕ Add</button>
        <button className="btn btnGhost" onClick={load}>🔄 Refresh</button>
      </div>

      <div className="mt16 tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c, i) => (
              <tr key={c._id || c.id || i}>
                <td>{i + 1}</td>
                <td><b>{c.name}</b></td>
                <td className="muted">{c._id || c.id}</td>
                <td>
                  <div className="tableActions">
                    <button className="btn btnSoft btnSm" onClick={() => openEdit(c)}>✏️ Edit</button>
                    <button className="btn btnDanger btnSm" onClick={() => remove(c._id || c.id)}>🗑 Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td colSpan="4">
                  <div className="empty">
                    <b>Hozircha kategoriya yo‘q</b>
                    <span>Yuqoridan “Add” qilib qo‘shing</span>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Modal
        open={editOpen}
        title="Edit Category"
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <button className="btn btnGhost" onClick={() => setEditOpen(false)}>Cancel</button>
            <button className="btn btnPrimary" onClick={saveEdit}>Save</button>
          </>
        }
      >
        <div className="form">
          <div>
            <label className="label">Name</label>
            <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
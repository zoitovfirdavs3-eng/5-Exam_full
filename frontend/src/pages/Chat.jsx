import React from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import DeleteModal from "../components/DeleteModal";

function pickTitle(conv, meId) {
  if (!conv) return "Chat";
  if (conv.type === "support") return "Support";
  const carName = conv?.car?.car_name ? ` · ${conv.car.car_name}` : "";
  const other = (conv.participants || []).find((p) => String(p?._id || p) !== String(meId));
  const otherName = other?.first_name
    ? `${other.first_name} ${other.last_name || ""}`.trim()
    : (other?.email || "User");
  return `${otherName}${carName}`;
}

export default function Chat({ user }) {
  const [sp] = useSearchParams();
  const carFromUrl = sp.get("car") || "";

  const [convs, setConvs] = React.useState([]);
  const [activeId, setActiveId] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState("");
  const [err, setErr] = React.useState("");
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState({
    isOpen: false,
    type: "message", // "message" or "conversation"
    id: null
  });

  const meId = user?._id;

  const loadConvs = React.useCallback(async () => {
    const r = await api.get("/chat/conversations");
    setConvs(r.data.data || []);
  }, []);

  const loadMessages = React.useCallback(async (convId) => {
    if (!convId) return;
    const r = await api.get(`/chat/${convId}/messages?limit=200`);
    setMessages(r.data.data || []);
    
    // Auto-scroll to bottom after loading messages
    setTimeout(() => {
      const messagesContainer = document.querySelector(".chatMessages");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }, []);

  React.useEffect(() => {
    setErr("");
    loadConvs().catch((e) => setErr(e?.response?.data?.message || "Chat load failed"));
  }, [loadConvs]);

  // If opened from car details
  React.useEffect(() => {
    if (!carFromUrl) return;
    (async () => {
      try {
        const r = await api.post(`/chat/car/${carFromUrl}`);
        const conv = r.data.data;
        await loadConvs();
        setActiveId(String(conv._id));
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to open car chat");
      }
    })();
  }, [carFromUrl, loadConvs]);

  // Auto-select first conversation
  React.useEffect(() => {
    if (activeId) return;
    if (convs.length) setActiveId(String(convs[0]._id));
  }, [convs, activeId]);

  // load messages
  React.useEffect(() => {
    setErr("");
    if (!activeId) return;
    loadMessages(activeId).catch((e) => setErr(e?.response?.data?.message || "Messages load failed"));
  }, [activeId, loadMessages]);

  // Poll messages (simple, exam-friendly)
  React.useEffect(() => {
    if (!activeId) return;
    const t = setInterval(() => {
      loadMessages(activeId).catch(() => {});
      loadConvs().catch(() => {});
    }, 2500);
    return () => clearInterval(t);
  }, [activeId, loadMessages, loadConvs]);

  const openSupport = async () => {
    setErr("");
    try {
      const r = await api.post("/chat/support");
      const conv = r.data.data;
      await loadConvs();
      setActiveId(String(conv._id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to open support");
    }
  };

  const send = async () => {
    const msg = text.trim();
    if (!msg || !activeId) return;
    setText("");
    setErr("");
    try {
      await api.post(`/chat/${activeId}/messages`, { text: msg });
      await loadMessages(activeId);
      await loadConvs();
      
      // Auto-scroll to bottom after sending
      setTimeout(() => {
        const messagesContainer = document.querySelector(".chatMessages");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (e) {
      setErr(e?.response?.data?.message || "Send failed");
    }
  };

  // Delete functions
  const openDeleteModal = (type, id) => {
    setDeleteModal({
      isOpen: true,
      type,
      id
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      type: "message",
      id: null
    });
  };

  const handleDelete = async (mode) => {
    try {
      setErr("");
      
      if (deleteModal.type === "message") {
        await api.delete(`/messages/${deleteModal.id}?mode=${mode}`);
        // Update messages immediately
        if (mode === "me") {
          setMessages(prev => prev.filter(m => m._id !== deleteModal.id));
        } else {
          await loadMessages(activeId);
          await loadConvs();
        }
      } else if (deleteModal.type === "conversation") {
        await api.delete(`/conversations/${deleteModal.id}?mode=${mode}`);
        if (mode === "me") {
          setConvs(prev => prev.filter(c => c._id !== deleteModal.id));
          if (activeId === deleteModal.id) {
            setActiveId("");
            setMessages([]);
          }
        } else {
          await loadConvs();
          if (activeId === deleteModal.id) {
            setActiveId("");
            setMessages([]);
          }
        }
      }
      
      closeDeleteModal();
      // Show success toast
      const message = mode === "me" 
        ? (deleteModal.type === "message" ? "Xabar siz uchun o'chirildi" : "Chat siz uchun o'chirildi")
        : (deleteModal.type === "message" ? "Xabar hamma uchun o'chirildi" : "Chat hamma uchun o'chirildi");
      
      // Simple success notification
      console.log("✅ Success:", message);
      
    } catch (e) {
      setErr(e?.response?.data?.message || "O'chirishda xatolik");
    }
  };

  const active = convs.find((c) => String(c._id) === String(activeId));
  const title = pickTitle(active, meId);

  return (
    <div className="glass card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 className="h1" style={{ marginBottom: 2 }}>Chat</h1>
          <div className="muted" style={{ fontSize: 13 }}>
            {user?.role === "admin" ? "Admin panel: barcha chatlar" : "User: sotuvchi yoki support bilan yozishish"}
          </div>
        </div>
        <button className="btn" onClick={openSupport}>+ Support</button>
      </div>

      {err ? <div className="notice" style={{ marginTop: 10 }}>{err}</div> : null}

      <div className="chat" style={{ marginTop: 14 }}>
        <div className="chatLeft">
          {convs.length === 0 ? (
            <div className="muted">Hozircha chat yo‘q. Car details → “Chat seller” yoki “+ Support”.</div>
          ) : null}

          {convs.map((c) => {
            const isActive = String(c._id) === String(activeId);
            return (
              <button
                key={c._id}
                className={"chatItem" + (isActive ? " active" : "")}
                onClick={() => setActiveId(String(c._id))}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, width: "100%" }}>
                  <b style={{ textAlign: "left" }}>{pickTitle(c, meId)}</b>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {(c.last_message_at || c.updatedAt || "").slice(0, 10)}
                  </span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4, textAlign: "left" }}>
                  {c.type === "support" ? "Support" : "Car chat"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="chatRight">
          <div className="chatHeader">
            <div>
              <b>{title}</b>
              {active?.type === "car" && active?.car ? (
                <div className="muted" style={{ fontSize: 12 }}>
                  Car: {active.car.car_name}
                </div>
              ) : null}
            </div>
            {/* Delete conversation button */}
            {active && (
              <button 
                className="btn danger" 
                onClick={() => openDeleteModal("conversation", active._id)}
                title="Chatni o'chirish"
              >
                🗑️
              </button>
            )}
          </div>

          <div className="chatMessages">
            {messages.map((m, index) => {
              // Robust sender ID extraction
              const senderId = String(m?.from?._id || m?.from);
              const myId = String(user?._id || user?.id);
              const isMine = senderId === myId;
              
              // Debug for first 2 messages only
              if (index < 2) {
                console.log(`🔍 Message ${index + 1}:`, {
                  senderId,
                  myId,
                  isMine,
                  from: m?.from,
                  user: user?._id
                });
              }
              
              return (
                <div key={m._id} className={`msgRow ${isMine ? "mine" : "theirs"}`}
                  title={(m.createdAt || "").replace("T", " ").slice(0, 16)}
                >
                  <div className="bubble">
                    {/* Delete message button - only for own messages */}
                    {isMine && (
                      <button 
                        className="delete-btn"
                        onClick={() => openDeleteModal("message", m._id)}
                        title="Xabarni o'chirish"
                      >
                        🗑️
                      </button>
                    )}
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
                      {(m.createdAt || "").replace("T", " ").slice(0, 16)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="chatComposer">
            <input
              className="input"
              placeholder="Xabar yozing..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <button className="btn primary" onClick={send}>Send</button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        type={deleteModal.type}
      />
    </div>
  );
}

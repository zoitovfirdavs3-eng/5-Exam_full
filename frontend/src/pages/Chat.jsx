import React from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import DeleteModal from "../components/DeleteModal";

function pickTitle(conv, meId) {
  if (!conv) return "Chat";
  if (conv.type === "support") return "Support";
  const carName = conv?.car?.car_name ? ` · ${conv.car.car_name}` : "";
  const other = (conv.participants || []).find(
    (p) => String(p?._id || p) !== String(meId)
  );
  const otherName = other?.first_name
    ? `${other.first_name} ${other.last_name || ""}`.trim()
    : other?.email || "Foydalanuvchi";
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
  const messagesEndRef = React.useRef(null);

  const [deleteModal, setDeleteModal] = React.useState({
    isOpen: false,
    type: "message",
    id: null,
  });

  // user._id yoki user.id dan foydalanuvchi ID olish
  const meId = user?._id || user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConvs = React.useCallback(async () => {
    const r = await api.get("/chat/conversations");
    setConvs(r.data.data || []);
  }, []);

  const loadMessages = React.useCallback(async (convId) => {
    if (!convId) return;
    const r = await api.get(`/chat/${convId}/messages?limit=200`);
    setMessages(r.data.data || []);
  }, []);

  React.useEffect(() => {
    setErr("");
    loadConvs().catch((e) =>
      setErr(e?.response?.data?.message || "Chat yuklanmadi")
    );
  }, [loadConvs]);

  // URL'dan mashina ID kelsa shu mashinaning chatini och
  React.useEffect(() => {
    if (!carFromUrl) return;
    (async () => {
      try {
        const r = await api.post(`/chat/car/${carFromUrl}`);
        const conv = r.data.data;
        await loadConvs();
        setActiveId(String(conv._id));
      } catch (e) {
        setErr(e?.response?.data?.message || "Chat ochilmadi");
      }
    })();
  }, [carFromUrl, loadConvs]);

  // Birinchi conversationni avtomatik tanlash
  React.useEffect(() => {
    if (activeId) return;
    if (convs.length) setActiveId(String(convs[0]._id));
  }, [convs, activeId]);

  // Aktiv conversation o'zgarganda xabarlarni yukla
  React.useEffect(() => {
    setErr("");
    if (!activeId) return;
    loadMessages(activeId).catch((e) =>
      setErr(e?.response?.data?.message || "Xabarlar yuklanmadi")
    );
  }, [activeId, loadMessages]);

  // Yangi xabar kelganda pastga scroll
  React.useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  // Polling - har 3 soniyada yangilash
  React.useEffect(() => {
    if (!activeId) return;
    const t = setInterval(() => {
      loadMessages(activeId).catch(() => {});
      loadConvs().catch(() => {});
    }, 3000);
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
      setErr(e?.response?.data?.message || "Support chat ochilmadi");
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
    } catch (e) {
      setErr(e?.response?.data?.message || "Xabar yuborilmadi");
      setText(msg); // Xato bo'lsa textni qaytarish
    }
  };

  const openDeleteModal = (type, id) => {
    setDeleteModal({ isOpen: true, type, id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: "message", id: null });
  };

  const handleDelete = async (mode) => {
    try {
      setErr("");
      if (deleteModal.type === "message") {
        await api.delete(`/messages/${deleteModal.id}?mode=${mode}`);
        if (mode === "me") {
          setMessages((prev) => prev.filter((m) => String(m._id) !== String(deleteModal.id)));
        } else {
          await loadMessages(activeId);
        }
      } else if (deleteModal.type === "conversation") {
        await api.delete(`/conversations/${deleteModal.id}?mode=${mode}`);
        setConvs((prev) => prev.filter((c) => String(c._id) !== String(deleteModal.id)));
        if (String(activeId) === String(deleteModal.id)) {
          setActiveId("");
          setMessages([]);
        }
        await loadConvs();
      }
      closeDeleteModal();
    } catch (e) {
      setErr(e?.response?.data?.message || "O'chirishda xatolik");
    }
  };

  const active = convs.find((c) => String(c._id) === String(activeId));
  const title = pickTitle(active, meId);

  return (
    <div className="glass card" style={{ padding: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <h1 className="h1" style={{ marginBottom: 2 }}>
            Chat
          </h1>
          <div className="muted" style={{ fontSize: 13 }}>
            {user?.role === "admin"
              ? "Admin: barcha chatlar"
              : "Sotuvchi yoki support bilan yozishing"}
          </div>
        </div>
        {user?.role !== "admin" && (
          <button className="btn" onClick={openSupport}>
            + Support
          </button>
        )}
      </div>

      {err ? (
        <div className="notice" style={{ marginTop: 10 }}>
          {err}
        </div>
      ) : null}

      <div className="chat" style={{ marginTop: 14 }}>
        <div className="chatLeft">
          {convs.length === 0 ? (
            <div className="muted" style={{ fontSize: 13, padding: 8 }}>
              Hozircha chat yo'q.
            </div>
          ) : null}
          {convs.map((c) => {
            const isActive = String(c._id) === String(activeId);
            return (
              <button
                key={c._id}
                className={"chatItem" + (isActive ? " active" : "")}
                onClick={() => setActiveId(String(c._id))}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  <b style={{ textAlign: "left" }}>{pickTitle(c, meId)}</b>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {(c.last_message_at || c.updatedAt || "").slice(0, 10)}
                  </span>
                </div>
                <div
                  className="muted"
                  style={{ fontSize: 12, marginTop: 4, textAlign: "left" }}
                >
                  {c.type === "support" ? "Support" : "Mashina chat"}
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
                  Mashina: {active.car.car_name}
                </div>
              ) : null}
            </div>
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
            {messages.map((m) => {
              const senderId = String(m?.from?._id || m?.from || "");
              const myId = String(meId || "");
              const isMine = senderId !== "" && myId !== "" && senderId === myId;

              return (
                <div
                  key={m._id}
                  className={`msgRow ${isMine ? "mine" : "theirs"}`}
                  title={(m.createdAt || "").replace("T", " ").slice(0, 16)}
                >
                  <div className="bubble">
                    {isMine && (
                      <button
                        className="delete-btn"
                        onClick={() => openDeleteModal("message", m._id)}
                        title="Xabarni o'chirish"
                      >
                        🗑️
                      </button>
                    )}
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                      {m.text}
                    </div>
                    <div
                      className="muted"
                      style={{ fontSize: 11, marginTop: 6 }}
                    >
                      {(m.createdAt || "").replace("T", " ").slice(0, 16)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatComposer">
            <input
              className="input"
              placeholder={activeId ? "Xabar yozing..." : "Chat tanlang"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={!activeId}
            />
            <button
              className="btn primary"
              onClick={send}
              disabled={!activeId || !text.trim()}
            >
              Yuborish
            </button>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        type={deleteModal.type}
      />
    </div>
  );
}

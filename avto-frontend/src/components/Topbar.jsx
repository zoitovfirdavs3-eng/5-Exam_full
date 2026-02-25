export default function Topbar({ title, sub }) {
  const email = localStorage.getItem("userEmail") || "user@example.com";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="flex between center wrap gap10">
      <div className="topbarLeft">
        <div className="topbarTitle">{title}</div>
        <div className="topbarSub">{sub}</div>
      </div>

      <div className="topbarRight">
        <span className="kicker">👤 {email}</span>
        <div className="avatar">{initials}</div>
      </div>
    </div>
  );
}
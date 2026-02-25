export default function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;

  return (
    <div className="modalBack" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalTitle">{title}</div>
          <button className="btn btnGhost btnSm" onClick={onClose}>✖</button>
        </div>
        <div className="modalBody">{children}</div>
        {footer ? <div className="modalFoot">{footer}</div> : null}
      </div>
    </div>
  );
}
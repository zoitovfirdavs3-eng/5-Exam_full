import React from "react";

// Delete Modal Component
const DeleteModal = ({ isOpen, onClose, onConfirm, type = "message" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">
          {type === "message" ? "Xabarni o'chirish" : "Chatni o'chirish"}
        </h3>
        
        <div className="modal-options">
          <button 
            className="modal-btn modal-btn-primary"
            onClick={() => onConfirm("me")}
          >
            Faqat mendan o'chirish
          </button>
          
          <button 
            className="modal-btn modal-btn-danger"
            onClick={() => onConfirm("everyone")}
          >
            Hamma uchun o'chirish
          </button>
        </div>
        
        <div className="modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;

import GuidePage from "./GuidePage";

export default function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.22)",
          maxHeight: "88vh",
          maxWidth: "94vw",
          overflowY: "auto",
          position: "relative",
          width: "980px",
        }}
      >
        <button
          type="button"
          aria-label="덕친소 가이드 닫기"
          onClick={onClose}
          style={{
            background: "white",
            border: "1px solid #eee",
            borderRadius: "50%",
            color: "#666",
            cursor: "pointer",
            fontSize: "20px",
            height: "36px",
            position: "absolute",
            right: "20px",
            top: "20px",
            width: "36px",
            zIndex: 1,
          }}
        >
          ×
        </button>
        <GuidePage />
      </div>
    </div>
  );
}

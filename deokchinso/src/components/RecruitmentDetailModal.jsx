import { getPostHostProfile } from "../profileUtils";

export default function RecruitmentDetailModal({
  isOpen,
  onClose,
  post,
  isBookmarked,
  onToggleBookmark,
  onStartChat,
}) {
  if (!isOpen || !post) return null;

  const hostProfile = getPostHostProfile(post);
  const category = post.category || post.genre || "일반";

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <section
        aria-label="동행 모집글 상세"
        onClick={(event) => event.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.22)",
          maxHeight: "88vh",
          maxWidth: "94vw",
          overflowY: "auto",
          padding: "24px",
          position: "relative",
          width: "620px",
        }}
      >
        <button
          type="button"
          aria-label="모집글 상세 닫기"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#777",
            cursor: "pointer",
            fontSize: "24px",
            position: "absolute",
            right: "16px",
            top: "14px",
          }}
        >
          ×
        </button>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: "8px",
            marginRight: "36px",
          }}
        >
          <span
            style={{
              background: "#fff0f3",
              borderRadius: "999px",
              color: "#d9365b",
              fontSize: "12px",
              fontWeight: 800,
              padding: "6px 10px",
            }}
          >
            {category}
          </span>
          <span style={{ color: "#0f9f6e", fontSize: "12px", fontWeight: 700 }}>모집 중</span>
        </div>

        <h2 style={{ color: "#222", fontSize: "23px", lineHeight: 1.35, margin: "14px 0" }}>
          {post.title}
        </h2>

        <img
          src={post.img || hostProfile.avatarUrl}
          alt={`${post.title} 대표 이미지`}
          style={{
            borderRadius: "14px",
            height: "260px",
            objectFit: "cover",
            width: "100%",
          }}
        />

        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: "12px",
            padding: "18px 2px 12px",
          }}
        >
          <img
            src={hostProfile.avatarUrl}
            alt={`${hostProfile.displayName} 프로필`}
            style={{ borderRadius: "50%", height: "46px", objectFit: "cover", width: "46px" }}
          />
          <div style={{ flex: 1, textAlign: "left" }}>
            <strong style={{ color: "#333", display: "block", fontSize: "15px" }}>
              {hostProfile.displayName}
            </strong>
            <div
              style={{
                color: "#777",
                display: "flex",
                flexWrap: "wrap",
                fontSize: "11px",
                gap: "4px 8px",
                marginTop: "5px",
              }}
            >
              <span style={{ color: "#d9365b", fontWeight: 800 }}>덕력 36.8°C</span>
              <span>호스트 14회</span>
              <span>동행 28회</span>
              <span>응답률 100%</span>
            </div>
          </div>
          <button
            type="button"
            className={`heart-button ${isBookmarked ? "is-bookmarked" : ""}`}
            aria-label={isBookmarked ? "찜한 모집글 해제" : "모집글 찜하기"}
            aria-pressed={isBookmarked}
            onClick={() => onToggleBookmark(post)}
            style={{
              background: "none",
              border: "none",
              color: isBookmarked ? "#ff4b72" : "#888",
              cursor: "pointer",
              fontSize: "28px",
            }}
            title={isBookmarked ? "찜 해제" : "찜하기"}
          >
            {isBookmarked ? "♥" : "♡"}
          </button>
        </div>

        <div style={{ color: "#444", fontSize: "15px", lineHeight: 1.75, padding: "20px 2px" }}>
          <p style={{ marginTop: 0 }}>
            {post.content ||
              `${post.title} 동행 메이트를 모집합니다. 일정과 장소를 확인하고 편하게 채팅으로 문의해 주세요.`}
          </p>
          <div
            style={{
              background: "#fafafa",
              borderRadius: "12px",
              display: "grid",
              gap: "10px",
              marginTop: "18px",
              padding: "16px",
            }}
          >
            <span>📅 일정: {post.date || "일정 협의"}</span>
            <span>📍 장소: {post.location || post.region || "장소 협의"}</span>
            <span>🏷️ {post.tag || "#동행환영"}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onStartChat(post)}
          style={{
            background: "#ff4b72",
            border: "none",
            borderRadius: "12px",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 800,
            padding: "15px",
            width: "100%",
          }}
        >
          💬 {hostProfile.displayName}님에게 채팅하기
        </button>
      </section>
    </div>
  );
}

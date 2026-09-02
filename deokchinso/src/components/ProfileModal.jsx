import React from "react";

export default function ProfileModal({ isOpen, onClose, targetUser }) {
  if (!isOpen) return null;

  // 기본 유저 정보 (전달받은 정보가 없으면 기본값 사용)
  const user = targetUser || {
    name: "민지 (24)",
    role: "인증된 우수 호스트",
    temperature: "36.8°C",
    badge: "🔥 최애 메이트",
    hostingCount: 14,
    joiningCount: 28,
    reviews: [
      {
        id: 1,
        text: "약속 시간도 칼같이 지키시고 티켓팅 꿀팁도 알려주셨어요! 덕분에 너무 편하게 다녀왔습니다.",
        author: "수현 (25)",
      },
      {
        id: 2,
        text: "처음 만났는데도 너무 친절하게 말 걸어주셔서 어색하지 않았어요. 다음 콘서트 때도 또 뵙고 싶어요!",
        author: "도윤 (27)",
      },
    ],
  };

  return (
    <div className="modal-overlay">
      <div className="profile-modal-content">
        {/* 모달 상단 닫기 버튼 */}
        <div className="modal-header-right">
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 프로필 요약 카드 */}
        <div className="profile-top-section">
          <img
            src="https://picsum.photos/seed/user/120/120"
            alt="프로필 사진"
            className="profile-big-img"
          />
          <div className="profile-info-area">
            <div className="profile-name-row">
              <h3 className="profile-name">{user.name}</h3>
              <span className="profile-badge">🛡️ 본인인증 완료</span>
            </div>
            <p className="profile-role">{user.role}</p>
            <div className="profile-temp-row">
              <span className="temp-label">덕력 온도</span>
              <span className="temp-value">{user.temperature || "36.8°C"}</span>
            </div>
          </div>
        </div>

        {/* 통계 요약 (동행 횟수) */}
        <div className="profile-stats-box">
          <div className="stat-item">
            <span className="stat-num">{user.hostingCount || 14}회</span>
            <span className="stat-label">호스트 주최</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-num">{user.joiningCount || 28}회</span>
            <span className="stat-label">동행 참여</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-num">100%</span>
            <span className="stat-label">응답률</span>
          </div>
        </div>

        {/* 받은 매너 후기 목록 */}
        <div className="profile-reviews-section">
          <h4 className="section-subtitle">⭐ 메이트들이 남긴 매너 후기</h4>
          <div className="profile-reviews-list">
            {user.reviews?.map((rev, idx) => (
              <div className="profile-review-item" key={idx}>
                <p className="review-content">"{rev.text}"</p>
                <span className="review-writer">- {rev.author} 메이트</span>
              </div>
            ))}
          </div>
        </div>

        <button className="submit-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";

export default function MyPageModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("applied"); // applied, hosted, liked

  if (!isOpen) return null;

  // 가상의 마이페이지 데이터
  const myData = {
    applied: [
      {
        id: 1,
        title: "NCT DREAM 월드투어 서울",
        date: "5월 12일 (금)",
        location: "고척 스카이돔",
        status: "매칭 완료",
        author: "민지 (24)",
      },
    ],
    hosted: [
      {
        id: 2,
        title: "일러스타스타 페스티벌 동행",
        date: "5월 18일 (토)",
        location: "일산 킨텍스",
        status: "모집중 (2/4명)",
        author: "나 (호스트)",
      },
    ],
    liked: [
      {
        id: 3,
        title: "LCK 스프링 결승전 직관",
        date: "6월 1일 (토)",
        location: "KSPO DOME",
        category: "게임/e스포츠",
      },
    ],
  };

  return (
    <div className="modal-overlay">
      <div className="mypage-modal-content">
        <div className="modal-header">
          <h3>📌 나의 덕질 스케줄 (마이페이지)</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 프로필 요약 카드 */}
        <div className="mypage-profile-banner">
          <img
            src="https://mblogthumb-phinf.pstatic.net/MjAxOTA3MjdfMTI3/MDAxNTY0MjMyNDU0OTgz.oh-VWNn7vocO4NbjRrJzocbXTbi434N-p9Bu5cqF-wkg.AyqJFCQhrWCCsAKGuQGRAneD2Ko5jL_K9a1IAn7-NJ0g.JPEG.taegu1005/%EC%BA%A1%EC%B2%98_2019_07_21_16_34_57_566.jpg?type=w800"
            alt="내 프로필"
            className="mypage-avatar"
          />
          <div>
            <h4 className="mypage-username">루피고기도둑 님</h4>
            <p className="mypage-email">subin@deokchinso.com</p>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="mypage-tabs">
          <button
            className={`mypage-tab-btn ${activeTab === "applied" ? "active" : ""}`}
            onClick={() => setActiveTab("applied")}
          >
            신청한 동행 ({myData.applied.length})
          </button>
          <button
            className={`mypage-tab-btn ${activeTab === "hosted" ? "active" : ""}`}
            onClick={() => setActiveTab("hosted")}
          >
            내가 연 방 ({myData.hosted.length})
          </button>
          <button
            className={`mypage-tab-btn ${activeTab === "liked" ? "active" : ""}`}
            onClick={() => setActiveTab("liked")}
          >
            찜한 이벤트 ({myData.liked.length})
          </button>
        </div>

        {/* 탭별 리스트 내용 */}
        <div className="mypage-list-area">
          {activeTab === "applied" &&
            (myData.applied.length > 0 ? (
              myData.applied.map((item) => (
                <div className="mypage-card" key={item.id}>
                  <div className="mypage-card-info">
                    <span className="mypage-status-badge">{item.status}</span>
                    <h5>{item.title}</h5>
                    <p>
                      📅 {item.date} | 📍 {item.location}
                    </p>
                  </div>
                  <button className="mypage-action-btn">채팅하기</button>
                </div>
              ))
            ) : (
              <p className="empty-text">신청한 동행 내역이 없습니다.</p>
            ))}

          {activeTab === "hosted" &&
            (myData.hosted.length > 0 ? (
              myData.hosted.map((item) => (
                <div className="mypage-card" key={item.id}>
                  <div className="mypage-card-info">
                    <span className="mypage-status-badge host">
                      {item.status}
                    </span>
                    <h5>{item.title}</h5>
                    <p>
                      📅 {item.date} | 📍 {item.location}
                    </p>
                  </div>
                  {/* 관리하기 버튼 예시 */}
                  <button
                    onClick={() => {
                      // 관리하고자 하는 해당 모집글 정보를 상태에 담고 관리 모달을 띄움
                      alert(`"${item.title}" 모집글 관리 페이지로 이동합니다!`);
                      // 또는 setIsManageModalOpen(true); 등 관리 모달 상태 켜기
                    }}
                    style={{
                      background: "#00c471",
                      color: "white",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    관리하기
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-text">개설한 동행 방이 없습니다.</p>
            ))}

          {activeTab === "liked" &&
            (myData.liked.length > 0 ? (
              myData.liked.map((item) => (
                <div className="mypage-card" key={item.id}>
                  <div className="mypage-card-info">
                    <span className="category">{item.category}</span>
                    <h5>{item.title}</h5>
                    <p>
                      📅 {item.date} | 📍 {item.location}
                    </p>
                  </div>
                  <button className="mypage-action-btn">동행 구하기</button>
                </div>
              ))
            ) : (
              <p className="empty-text">찜해둔 이벤트가 없습니다.</p>
            ))}
        </div>
      </div>
    </div>
  );
}

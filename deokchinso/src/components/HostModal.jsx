import { useState } from "react";
import { getUserProfile } from "../profileUtils";

function createInitialFormData(initialEvent) {
  return {
    category: initialEvent?.category === "게임/e스포츠" ? "게임" : initialEvent?.category || "K-POP",
    title: initialEvent ? `${initialEvent.title} 동행 구해요` : "",
    location: initialEvent?.location || "",
    date: "",
    tag: initialEvent ? `#${initialEvent.title} #동행구해요` : "",
    img: initialEvent?.image || "",
    author: "덕후유저",
    author_avatar_url: "",
    author_user_id: "",
  };
}

export default function HostModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  currentUserProfile,
  initialEvent,
}) {
  const [formData, setFormData] = useState(() => createInitialFormData(initialEvent));

  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🌟 이미지 파일 업로드 처리 함수 (파일을 읽어서 문자열로 변환)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, img: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("동행방을 만들려면 먼저 로그인해주세요.");
      return;
    }

    const profile = getUserProfile(currentUser, currentUserProfile);

    try {
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          author: profile.displayName,
          author_avatar_url: profile.avatarUrl,
          author_user_id: currentUser.id,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        onSuccess();
      } else {
        alert("등록에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("통신 에러:", error);
      alert(
        "서버와 통신할 수 없습니다. 백엔드가 3000번 포트에서 켜져 있는지 확인해주세요!",
      );
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData(createInitialFormData(initialEvent));
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>🎙️ 나만의 동행 방 개설하기</h3>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="host-success-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div className="room-celebration" aria-hidden="true">
              <span>✦</span><span>♥</span><span>✧</span><span>★</span><span>♥</span><span>✦</span>
            </div>
            <div className="host-success-emoji" style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
            <h3 style={{ color: "#f43f5e", marginBottom: "8px" }}>
              [방 개설 완료!]
            </h3>
            <p
              style={{
                color: "#57534e",
                fontSize: "14px",
                marginBottom: "24px",
                lineHeight: "1.5",
              }}
            >
              제목: {formData.title}
              <br />
              지역: {formData.location}
              <br />
              날짜: {formData.date}
              <br />
              성공적으로 동행 방이 개설되었습니다.
            </p>
            <button className="submit-btn" onClick={handleClose}>
              확인
            </button>
          </div>
        ) : (
          <form className="host-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>장르 카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="K-POP">K-POP</option>
                <option value="애니메이션">애니메이션</option>
                <option value="게임">게임</option>
                <option value="만화/웹툰">만화/웹툰</option>
                <option value="뮤지컬">뮤지컬</option>
                <option value="스포츠">스포츠</option>
                <option value="아이돌">아이돌</option>
                <option value="코스프레">코스프레</option>
              </select>
            </div>

            <div className="form-group">
              <label>동행 제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: 서울 코믹월드 일요일 동행 구해요"
                required
              />
            </div>

            <div className="form-group">
              <label>장소</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="예: 일산 킨텍스"
                required
              />
            </div>

            {/* 🌟 날짜 선택기 (캘린더형 input type="date") */}
            <div className="form-group">
              <label>날짜 선택</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* 🌟 사진 업로드 입력 필드 추가 */}
            <div className="form-group">
              <label>대표 이미지 업로드</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ padding: "8px 0" }}
              />
              {formData.img && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#10b981",
                  }}
                >
                  ✅ 이미지가 성공적으로 선택되었습니다!
                </div>
              )}
            </div>

            <div className="form-group">
              <label>메모 / 한줄 태그</label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                placeholder="예: 티켓 수령 동행 / 굿즈 줄서기"
              />
            </div>

            <button type="submit" className="submit-btn">
              방 개설하기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

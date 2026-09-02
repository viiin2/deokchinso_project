import { useState } from "react";

export default function ChatModal({ isOpen, onClose, targetMate }) {
  const [messages, setMessages] = useState([
    {
      sender: "other",
      text: `안녕하세요! ${targetMate?.title || "동행"} 방 보고 연락드렸어요. 혹시 아직 자리 있나요?`,
      time: "오후 4:15",
    },
    {
      sender: "me",
      text: "네! 안녕하세요! 기꺼이 환영입니다 :) 티켓 인증 가능하실까요?",
      time: "오후 4:16",
    },
  ]);
  const [inputText, setInputText] = useState("");

  if (!isOpen) return null;

  // 메시지 전송 함수
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages([
      ...messages,
      { sender: "me", text: inputText, time: currentTime },
    ]);
    setInputText("");
  };

  // 약속 장소/시간 공유 템플릿 버튼 클릭 시
  const handleSendTemplate = () => {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const templateText =
      "📌 [약속 카드 공유]\n📍 장소: 고척 스카이돔 2번 출구 앞\n⏰ 시간: 공연 시작 2시간 전 (오후 3시)";
    setMessages([
      ...messages,
      { sender: "me", text: templateText, time: currentTime },
    ]);
  };

  return (
    <div className="modal-overlay">
      <div className="chat-modal-content">
        {/* 채팅 헤더 */}
        <div className="chat-header">
          <div className="chat-header-info">
            <img
              src="https://picsum.photos/seed/user/100/100"
              alt="상대방 프로필"
              className="chat-profile-img"
            />
            <div>
              <h4 className="chat-room-name">
                {targetMate?.author || "민지 (24)"} 메이트와의 톡
              </h4>
              <p className="chat-event-sub">
                {targetMate?.title || "덕친소 동행 대화방"}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 🚨 안전 경고 배너 */}
        <div className="chat-safety-banner">
          ⚠️ <b>안전 주의:</b> 연락처(전화번호/카카오톡 ID) 요구 및 금전 요구 시
          즉시 신고해 주세요.
        </div>

        {/* 채팅 메시지 영역 */}
        <div className="chat-messages-area">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message-row ${msg.sender === "me" ? "me" : "other"}`}
            >
              {msg.sender === "other" && (
                <img
                  src="https://picsum.photos/seed/user/100/100"
                  alt="상대"
                  className="msg-profile"
                />
              )}
              <div className="chat-bubble-wrapper">
                <div className="chat-bubble">{msg.text}</div>
                <span className="chat-time">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 📌 약속 장소/시간 공유 템플릿 버튼 */}
        <div className="chat-template-bar">
          <button className="template-btn" onClick={handleSendTemplate}>
            📌 약속 장소/시간 공유 템플릿 보내기
          </button>
        </div>

        {/* 입력창 영역 */}
        <form onSubmit={handleSendMessage} className="chat-input-bar">
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="send-btn">
            전송
          </button>
        </form>
      </div>
    </div>
  );
}

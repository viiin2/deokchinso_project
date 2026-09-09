import React, { useState, useEffect, useRef } from "react";

export default function ChatModal({ isOpen, onClose, targetMate }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // 1. 모든 경우의 수를 뒤져서 어떻게든 상대방 이름과 제목을 찾아냅니다.
  const mateName =
    targetMate?.author ||
    targetMate?.nickname ||
    targetMate?.userName ||
    targetMate?.name ||
    "알 수 없는 유저";
  const postTitle = targetMate?.title || targetMate?.postTitle || "동행 모집방";
  const postId = targetMate?.id || targetMate?.postId || "temp";

  // 2. 🌟 제일 치명적이었던 버그 해결 🌟
  // 목록에서 눌러서 들어왔으면 이미 있는 roomId를 그대로 쓰고, 새로 여는 방이면 [글ID___이름___제목] 형태로 절대 안 겹치는 고유값을 만듭니다.
  const roomId = targetMate?.roomId || `${postId}___${mateName}___${postTitle}`;

  const profileImg = `https://picsum.photos/seed/${encodeURIComponent(mateName)}/100/100`;

  useEffect(() => {
    if (isOpen) {
      setMessages([]);

      // 특수문자가 포함되어 있으므로 안전하게 인코딩하여 서버 요청
      fetch(`http://localhost:3000/api/messages/${encodeURIComponent(roomId)}`)
        .then((res) => {
          if (!res.ok) throw new Error("서버 에러");
          return res.json();
        })
        .then((data) => setMessages(data))
        .catch((err) => console.error("메시지 불러오기 실패:", err));
    }
  }, [isOpen, roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      room_id: roomId, // DB에 이 방 번호 통째로 저장
      sender: "나",
      text: newMessage,
    };

    try {
      const response = await fetch("http://localhost:3000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        setMessages((prev) => [...prev, savedMessage]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("메시지 전송 에러:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "400px",
          height: "650px",
          background: "#f8f9fa",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #eee",
          }}
        >
          <img
            src={profileImg}
            alt="프사"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              marginRight: "12px",
              objectFit: "cover",
            }}
          />
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "bold",
                color: "#222",
              }}
            >
              {mateName} 님과의 톡
            </h3>
            <span
              style={{
                fontSize: "12px",
                color: "#888",
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "250px",
              }}
            >
              {postTitle}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              color: "#999",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            background: "#fff5f5",
            color: "#ff4b72",
            padding: "10px 16px",
            fontSize: "12px",
            borderBottom: "1px solid #ffe5e5",
          }}
        >
          ⚠️ <b>안전 주의:</b> 연락처(전화번호/카카오톡 ID) 요구 및 금전 요구 시
          즉시 신고해 주세요.
        </div>

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            padding: "20px 16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.map((msg, index) => {
            const isMe = msg.sender === "나";
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: isMe ? "row-reverse" : "row",
                  alignItems: "flex-end",
                }}
              >
                {!isMe && (
                  <img
                    src={profileImg}
                    alt="상대"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      marginRight: "8px",
                      marginBottom: "2px",
                      objectFit: "cover",
                    }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMe ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    maxWidth: "75%",
                  }}
                >
                  <div
                    style={{
                      background: isMe ? "#ff4b72" : "white",
                      color: isMe ? "white" : "#333",
                      padding: "10px 14px",
                      borderRadius: isMe
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      fontSize: "14px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      lineHeight: "1.4",
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#999",
                      margin: isMe ? "0 6px 0 0" : "0 0 0 6px",
                      minWidth: "45px",
                    }}
                  >
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "방금 전"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            background: "white",
            padding: "12px 16px",
            borderTop: "1px solid #eee",
          }}
        >
          <form
            onSubmit={handleSendMessage}
            style={{ display: "flex", gap: "8px" }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "20px",
                border: "1px solid #ddd",
                outline: "none",
                fontSize: "14px",
                background: "#f8f9fa",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#ff4b72",
                color: "white",
                border: "none",
                padding: "0 20px",
                borderRadius: "20px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              전송
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

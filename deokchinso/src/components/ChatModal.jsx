import React, { useState, useEffect, useRef } from "react";

const GUEST_MEMBER_KEY = "deokchinso-chat-member-id";

function getGuestMemberId() {
  const fallbackId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const existingId = window.localStorage.getItem(GUEST_MEMBER_KEY);
    if (existingId) return existingId;

    window.localStorage.setItem(GUEST_MEMBER_KEY, fallbackId);
  } catch (error) {
    console.warn("게스트 채팅 ID 저장 실패:", error);
  }

  return fallbackId;
}

export default function ChatModal({ isOpen, onClose, targetMate, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [messageError, setMessageError] = useState("");
  const [guestMemberId] = useState(getGuestMemberId);
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
  const isGroupChat = targetMate?.roomType !== "direct";
  const roomId = targetMate?.roomId || `group_${postId}`;
  const memberId = currentUser?.id || guestMemberId;
  const memberName =
    currentUser?.user_metadata?.nickname ||
    currentUser?.user_metadata?.name ||
    currentUser?.email?.split("@")[0] ||
    `게스트 ${guestMemberId.slice(-4)}`;
  const profileSeed = isGroupChat ? postTitle : mateName;
  const profileImg = `https://picsum.photos/seed/${encodeURIComponent(profileSeed)}/100/100`;

  useEffect(() => {
    if (!isOpen) return undefined;

    let isCancelled = false;

    const loadChat = async () => {
      setMessages([]);
      setMessageError("");

      try {
        if (isGroupChat) {
          const roomResponse = await fetch("http://localhost:3000/api/chat-rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              room_id: roomId,
              post_id: postId,
              title: postTitle,
              member_id: memberId,
              member_name: memberName,
            }),
          });

          if (!roomResponse.ok) throw new Error("단체 톡방에 참여하지 못했습니다.");

          const room = await roomResponse.json();
          if (!isCancelled) setParticipantCount(room.member_count || 0);
        }

        const messagesResponse = await fetch(
          `http://localhost:3000/api/messages/${encodeURIComponent(roomId)}`,
        );
        if (!messagesResponse.ok) throw new Error("메시지를 불러오지 못했습니다.");

        const data = await messagesResponse.json();
        if (!isCancelled) setMessages(data);
      } catch (error) {
        if (!isCancelled) setMessageError(error.message);
        console.error("메시지 불러오기 실패:", error);
      }
    };

    loadChat();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, isGroupChat, memberId, memberName, postId, postTitle, roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const refreshMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/messages/${encodeURIComponent(roomId)}`,
        );
        if (!response.ok) return;

        const latestMessages = await response.json();
        setMessages((previousMessages) => {
          const isUnchanged =
            previousMessages.length === latestMessages.length &&
            previousMessages.every(
              (message, index) => message.id === latestMessages[index].id,
            );

          return isUnchanged ? previousMessages : latestMessages;
        });
      } catch (error) {
        console.error("메시지 동기화 실패:", error);
      }
    };

    const pollingId = window.setInterval(refreshMessages, 3000);
    return () => window.clearInterval(pollingId);
  }, [isOpen, roomId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      room_id: roomId,
      sender: memberName,
      text: newMessage,
    };

    try {
      setMessageError("");
      const response = await fetch("http://localhost:3000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) throw new Error("메시지를 전송하지 못했습니다.");

      const savedMessage = await response.json();
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage("");
    } catch (error) {
      setMessageError(error.message);
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
              {isGroupChat ? `${postTitle} 단체 톡` : `${mateName} 님과의 톡`}
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
              {isGroupChat ? `${participantCount}명 참여 중` : postTitle}
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
            const isMe = msg.sender === memberName || msg.sender === "나";
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
                    maxWidth: "75%",
                  }}
                >
                  {isGroupChat && !isMe && (
                    <span
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        color: "#777",
                        fontSize: "11px",
                      }}
                    >
                      {msg.sender}
                    </span>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMe ? "row-reverse" : "row",
                      alignItems: "flex-end",
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
          {messageError && (
            <p style={{ color: "#d9365b", fontSize: "12px", margin: "8px 4px 0" }}>
              {messageError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

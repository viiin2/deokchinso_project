import React, { useState, useEffect } from "react";

export default function ChatListModal({ isOpen, onClose, onSelectRoom }) {
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:3000/api/chat-rooms")
        .then((res) => res.json())
        .then((data) => setChatRooms(data))
        .catch((err) => console.error("톡함 불러오기 실패:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "400px",
          height: "600px",
          borderRadius: "20px",
          background: "white",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
            💬 덕친소 톡함
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {chatRooms.length > 0 ? (
            chatRooms.map((room) => {
              const rawRoomId = room.room_id || "";
              const isGroupChat = room.room_type === "group";
              let mateName = "알 수 없는 유저";
              let postTitle = "동행 모집방";

              // 🌟 ChatModal에서 만든 "___" 구분자로 완벽하게 쪼갭니다!
              if (rawRoomId.includes("___")) {
                const parts = rawRoomId.split("___");
                // parts[0]: 글ID, parts[1]: 이름, parts[2]: 제목
                mateName = parts[1] || mateName;
                postTitle = parts[2] || postTitle;
              } else if (rawRoomId.includes(":::")) {
                // 이전 찌꺼기 호환
                const parts = rawRoomId.split(":::");
                mateName = parts[0] || mateName;
                postTitle = parts[1] || postTitle;
              }

              const roomTitle = isGroupChat ? room.room_title || postTitle : postTitle;
              const displayName = isGroupChat ? roomTitle : `${mateName} 님`;
              const subTitle = isGroupChat
                ? `${room.member_count || 0}명 참여 중`
                : postTitle;
              const profileImg = `https://picsum.photos/seed/${encodeURIComponent(isGroupChat ? roomTitle : mateName)}/100/100`;

              return (
                <div
                  key={rawRoomId}
                  onClick={() => {
                    // 🌟 톡방 누르면 "진짜 DB에 있는 방 번호(roomId)"를 그대로 넘겨줍니다! (room_ 안붙임)
                    onSelectRoom({
                      roomId: rawRoomId,
                      author: mateName,
                      title: roomTitle,
                      postId: room.post_id,
                      roomType: room.room_type,
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px 20px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      marginRight: "16px",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={profileImg}
                      alt="프로필"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: "16px",
                          color: "#333",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {displayName}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#888",
                        marginBottom: "4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {subTitle}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#555",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {room.text || "아직 메시지가 없습니다."}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "#888",
                fontSize: "14px",
              }}
            >
              진행 중인 톡이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

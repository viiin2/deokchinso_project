import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { getPostHostProfile, getUserProfile } from "../profileUtils";

function ProfileAvatar({ avatarUrl, name, size = 40 }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${name} 프로필`}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      aria-label={`${name} 프로필`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background: "#ffe1e8",
        color: "#d9365b",
        fontSize: size * 0.4,
        fontWeight: 700,
      }}
    >
      {name.slice(0, 1)}
    </div>
  );
}

function formatMessageTime(timestamp) {
  if (!timestamp) return "방금";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "방금";

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function ChatModal({
  isOpen,
  onClose,
  targetMate,
  currentUser,
  currentUserProfile,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [roomProfile, setRoomProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const scrollRef = useRef(null);

  const postId = targetMate?.chatPostId ?? targetMate?.postId ?? targetMate?.id ?? "general";
  const roomId = targetMate?.roomId || `group_${postId}`;
  const roomTitle = targetMate?.title || targetMate?.postTitle || "동행 모집방";
  const currentProfile = getUserProfile(currentUser, currentUserProfile);
  const roomHostProfile = getPostHostProfile(targetMate);

  useEffect(() => {
    if (!isOpen) return undefined;

    if (!currentUser) {
      return undefined;
    }

    let isCancelled = false;
    let channel;

    const loadMessages = async () => {
      const { data: messageRows, error: messagesError } = await supabase
        .from("messages")
        .select("id, room_id, sender_id, contents, created_at")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      const messageIds = messageRows.map((message) => String(message.id));
      const senderIds = [
        ...new Set(messageRows.map((message) => message.sender_id).filter(Boolean)),
      ];
      const [profilesResult, readsResult] = await Promise.all([
        senderIds.length
          ? supabase
              .from("profiles")
              .select("id, display_name, avatar_url")
              .in("id", senderIds)
          : Promise.resolve({ data: [], error: null }),
        messageIds.length
          ? supabase
              .from("message_reads")
              .select("message_id, user_id")
              .in("message_id", messageIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (readsResult.error) throw readsResult.error;

      const profilesById = new Map(
        profilesResult.data.map((profile) => [profile.id, profile]),
      );
      const readsByMessageId = new Map();
      readsResult.data.forEach((read) => {
        const readers = readsByMessageId.get(read.message_id) || [];
        readers.push(read.user_id);
        readsByMessageId.set(read.message_id, readers);
      });

      const unreadMessageIds = messageRows
        .filter((message) => message.sender_id !== currentUser.id)
        .map((message) => String(message.id));

      if (unreadMessageIds.length) {
        const { error: readError } = await supabase.from("message_reads").upsert(
          unreadMessageIds.map((messageId) => ({
            message_id: messageId,
            user_id: currentUser.id,
          })),
          { onConflict: "message_id,user_id", ignoreDuplicates: true },
        );
        if (readError) throw readError;
      }

      if (isCancelled) return;

      setMessages(
        messageRows.map((message) => {
          const senderProfile = profilesById.get(message.sender_id);
          const readers = readsByMessageId.get(String(message.id)) || [];
          return {
            ...message,
            senderName: senderProfile?.display_name || "알 수 없는 사용자",
            avatarUrl: senderProfile?.avatar_url || null,
            isMine: message.sender_id === currentUser.id,
            isReadByOther: readers.some((readerId) => readerId !== message.sender_id),
          };
        }),
      );
    };

    const openRoom = async () => {
      try {
        setErrorMessage("");
        setMessages([]);

        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: currentProfile.id,
            display_name: currentProfile.displayName,
            avatar_url: currentProfile.avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
        if (profileError) throw profileError;

        const { data: existingRoom, error: roomLookupError } = await supabase
          .from("chat_rooms")
          .select("id")
          .eq("id", roomId)
          .maybeSingle();
        if (roomLookupError) throw roomLookupError;

        if (!existingRoom) {
          const { error: roomCreateError } = await supabase.from("chat_rooms").insert({
            id: roomId,
            post_id: String(postId),
            title: roomTitle,
            created_by: currentUser.id,
          });
          if (roomCreateError && roomCreateError.code !== "23505") throw roomCreateError;
        }

        const { error: memberError } = await supabase
          .from("chat_room_members")
          .upsert(
            { room_id: roomId, user_id: currentUser.id },
            { onConflict: "room_id,user_id", ignoreDuplicates: true },
          );
        if (memberError) throw memberError;

        const { data: members, error: membersError } = await supabase
          .from("chat_room_members")
          .select("user_id")
          .eq("room_id", roomId);
        if (membersError) throw membersError;

        const memberIds = members.map((member) => member.user_id);
        const { data: memberProfiles, error: memberProfilesError } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", memberIds);
        if (memberProfilesError) throw memberProfilesError;

        if (isCancelled) return;

        setParticipantCount(members.length);
        setRoomProfile(
          memberProfiles.find((profile) => profile.id !== currentUser.id) ||
            null,
        );
        await loadMessages();

        channel = supabase
          .channel(`chat-room:${roomId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `room_id=eq.${roomId}`,
            },
            () =>
              loadMessages().catch((error) =>
                console.error("메시지 동기화 실패:", error),
              ),
          )
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "message_reads" },
            () =>
              loadMessages().catch((error) =>
                console.error("읽음 상태 동기화 실패:", error),
              ),
          )
          .subscribe();
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || "채팅방을 불러오지 못했습니다.");
        }
        console.error("채팅방 불러오기 실패:", error);
      }
    };

    openRoom();

    return () => {
      isCancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [
    currentProfile.avatarUrl,
    currentProfile.displayName,
    currentProfile.id,
    currentUser,
    isOpen,
    postId,
    roomId,
    roomHostProfile.avatarUrl,
    roomHostProfile.displayName,
    roomTitle,
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const contents = newMessage.trim();
    if (!contents || !currentUser) return;

    try {
      setErrorMessage("");
      const { error } = await supabase.from("messages").insert({
        room_id: roomId,
        sender_id: currentUser.id,
        contents,
      });
      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      setErrorMessage(error.message || "메시지를 전송하지 못했습니다.");
      console.error("메시지 전송 실패:", error);
    }
  };

  if (!isOpen) return null;

  const displayedMessages = currentUser ? messages : [];
  const displayedError = currentUser
    ? errorMessage
    : "채팅은 로그인 후 이용할 수 있습니다.";

  const headerProfile = roomProfile || {
    display_name: roomHostProfile.displayName,
    avatar_url: roomHostProfile.avatarUrl,
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "400px",
          height: "650px",
          background: "#f8f9fa",
          borderRadius: "12px",
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
          <ProfileAvatar
            avatarUrl={headerProfile.avatar_url}
            name={headerProfile.display_name}
          />
          <div style={{ flex: 1, minWidth: 0, marginLeft: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#222" }}>
              {roomTitle}
            </h3>
            <span
              style={{
                color: "#888",
                display: "block",
                fontSize: "12px",
                marginTop: "3px",
              }}
            >
              {participantCount}명 참여 중
            </span>
          </div>
          <button
            type="button"
            aria-label="채팅방 닫기"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#777",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            x
          </button>
        </div>

        <div
          style={{
            background: "#fff5f5",
            borderBottom: "1px solid #ffe5e5",
            color: "#d9365b",
            fontSize: "12px",
            padding: "10px 16px",
          }}
        >
          연락처나 금전을 요구하면 대화를 중단하고 신고해 주세요.
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
          {displayedMessages.map((message) => (
            <div
              key={message.id}
              className={`chat-message-row ${message.isMine ? "is-mine" : "is-other"}`}
              style={{
                alignItems: "flex-end",
                display: "flex",
                flexDirection: message.isMine ? "row-reverse" : "row",
                gap: "8px",
              }}
            >
              {!message.isMine && (
                <ProfileAvatar
                  avatarUrl={message.avatarUrl}
                  name={message.senderName}
                  size={36}
                />
              )}
              <div style={{ maxWidth: "75%" }}>
                {!message.isMine && (
                  <span
                    style={{
                      color: "#777",
                      display: "block",
                      fontSize: "11px",
                      marginBottom: "4px",
                    }}
                  >
                    {message.senderName}
                  </span>
                )}
                <div
                  style={{
                    alignItems: "flex-end",
                    display: "flex",
                    flexDirection: message.isMine ? "row-reverse" : "row",
                  }}
                >
                  <div
                    style={{
                      background: message.isMine ? "#ff4b72" : "white",
                      borderRadius: message.isMine
                        ? "14px 14px 3px 14px"
                        : "14px 14px 14px 3px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      color: message.isMine ? "white" : "#333",
                      fontSize: "14px",
                      lineHeight: 1.4,
                      padding: "10px 14px",
                    }}
                  >
                    {message.contents}
                  </div>
                  <div
                    style={{
                      alignItems: message.isMine ? "flex-end" : "flex-start",
                      color: "#999",
                      display: "flex",
                      flexDirection: "column",
                      fontSize: "10px",
                      margin: message.isMine ? "0 6px 0 0" : "0 0 0 6px",
                      minWidth: "42px",
                    }}
                  >
                    {message.isMine && (
                      <span
                        aria-label={
                          message.isReadByOther ? "상대가 읽음" : "상대가 아직 읽지 않음"
                        }
                        title={
                          message.isReadByOther ? "상대가 읽음" : "상대가 아직 읽지 않음"
                        }
                        style={{
                          color: message.isReadByOther ? "#d9365b" : "#999",
                          fontSize: "10px",
                          lineHeight: 1,
                          transform: "translateY(3px)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {message.isReadByOther ? "읽음" : "안 읽음"}
                      </span>
                    )}
                    <span>{formatMessageTime(message.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "white", borderTop: "1px solid #eee", padding: "12px 16px" }}>
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={newMessage}
              disabled={!currentUser}
              onChange={(event) => setNewMessage(event.target.value)}
              placeholder={currentUser ? "메시지를 입력하세요..." : "로그인 후 채팅할 수 있습니다."}
              style={{
                background: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: "8px",
                flex: 1,
                fontSize: "14px",
                outline: "none",
                padding: "12px 14px",
              }}
            />
            <button
              type="submit"
              disabled={!currentUser}
              style={{
                background: currentUser ? "#ff4b72" : "#bbb",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: currentUser ? "pointer" : "not-allowed",
                fontSize: "14px",
                fontWeight: 700,
                padding: "0 18px",
              }}
            >
              전송
            </button>
          </form>
          {displayedError && (
            <p style={{ color: "#d9365b", fontSize: "12px", margin: "8px 2px 0" }}>
              {displayedError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

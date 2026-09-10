import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { getPostHostProfile } from "../profileUtils";

function ProfileAvatar({ avatarUrl, name }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${name} 프로필`}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }

  return (
    <span
      aria-label={`${name} 프로필`}
      style={{
        alignItems: "center",
        background: "#ffe1e8",
        color: "#d9365b",
        display: "flex",
        fontSize: "18px",
        fontWeight: 700,
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

export default function ChatListModal({
  isOpen,
  onClose,
  onSelectRoom,
  currentUser,
  currentUserName,
  posts,
}) {
  const [chatRooms, setChatRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;

    if (!currentUser) {
      return undefined;
    }

    let isCancelled = false;

    const loadChatRooms = async () => {
      try {
        setErrorMessage("");
        const { data: myMemberships, error: membershipError } = await supabase
          .from("chat_room_members")
          .select("room_id")
          .eq("user_id", currentUser.id);
        if (membershipError) throw membershipError;

        // Older rooms used group_<number>, so mock posts and server posts with the
        // same numeric ID were merged. Keep the records intact in Supabase but do
        // not surface those ambiguous rooms; newly opened rooms use mock_/post_.
        const memberRoomIds = myMemberships
          .map((membership) => membership.room_id)
          .filter((roomId) => !roomId.startsWith("group_"));
        const hostedPostsByRoomId = new Map(
          (posts || [])
            .filter(
              (post) =>
                post.author_user_id === currentUser.id ||
                (!post.author_user_id && post.author === currentUserName),
            )
            .map((post) => [`post_${post.id}`, post]),
        );
        const roomIds = [...new Set([...memberRoomIds, ...hostedPostsByRoomId.keys()])];
        if (!roomIds.length) {
          if (!isCancelled) setChatRooms([]);
          return;
        }

        const [roomsResult, membersResult, messagesResult] = await Promise.all([
          supabase
            .from("chat_rooms")
            .select("id, post_id, title, created_at")
            .in("id", roomIds),
          supabase
            .from("chat_room_members")
            .select("room_id, user_id")
            .in("room_id", roomIds),
          supabase
            .from("messages")
            .select("id, room_id, sender_id, contents, created_at")
            .in("room_id", roomIds)
            .order("created_at", { ascending: false }),
        ]);

        if (roomsResult.error) throw roomsResult.error;
        if (membersResult.error) throw membersResult.error;
        if (messagesResult.error) throw messagesResult.error;

        const messageIds = messagesResult.data.map((message) => String(message.id));
        const { data: myMessageReads, error: messageReadsError } = messageIds.length
          ? await supabase
              .from("message_reads")
              .select("message_id")
              .eq("user_id", currentUser.id)
              .in("message_id", messageIds)
          : { data: [], error: null };
        if (messageReadsError) throw messageReadsError;

        const memberIds = [
          ...new Set(membersResult.data.map((member) => member.user_id)),
        ];
        const { data: profiles, error: profilesError } = memberIds.length
          ? await supabase
              .from("profiles")
              .select("id, display_name, avatar_url")
              .in("id", memberIds)
          : { data: [], error: null };
        if (profilesError) throw profilesError;

        const membersByRoom = new Map();
        membersResult.data.forEach((member) => {
          const members = membersByRoom.get(member.room_id) || [];
          members.push(member.user_id);
          membersByRoom.set(member.room_id, members);
        });

        const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
        const latestMessageByRoom = new Map();
        const unreadCountByRoom = new Map();
        const readMessageIds = new Set(
          myMessageReads.map((messageRead) => String(messageRead.message_id)),
        );
        messagesResult.data.forEach((message) => {
          if (!latestMessageByRoom.has(message.room_id)) {
            latestMessageByRoom.set(message.room_id, message);
          }
          if (
            message.sender_id !== currentUser.id &&
            !readMessageIds.has(String(message.id))
          ) {
            unreadCountByRoom.set(
              message.room_id,
              (unreadCountByRoom.get(message.room_id) || 0) + 1,
            );
          }
        });

        const mappedRooms = roomsResult.data
          .map((room) => {
            const memberIdsForRoom = membersByRoom.get(room.id) || [];
            const otherMemberId = memberIdsForRoom.find((memberId) => memberId !== currentUser.id);
            const profile = profilesById.get(otherMemberId) || null;
            const hostedPost = hostedPostsByRoomId.get(room.id);
            const roomHostProfile = getPostHostProfile(hostedPost || room, posts);
            const latestMessage = latestMessageByRoom.get(room.id);
            const hostIsNotMember =
              Boolean(hostedPost) && !memberIdsForRoom.includes(currentUser.id);

            return {
              ...room,
              avatarUrl: profile?.avatar_url || roomHostProfile.avatarUrl,
              memberCount: memberIdsForRoom.length + (hostIsNotMember ? 1 : 0),
              profileName: profile?.display_name || roomHostProfile.displayName,
              preview: latestMessage?.contents || "아직 메시지가 없습니다.",
              updatedAt: latestMessage?.created_at || room.created_at,
              unreadCount: unreadCountByRoom.get(room.id) || 0,
            };
          })
          .sort((first, second) => new Date(second.updatedAt) - new Date(first.updatedAt));

        if (!isCancelled) setChatRooms(mappedRooms);
      } catch (error) {
        if (!isCancelled) {
          setChatRooms([]);
          setErrorMessage(error.message || "톡함을 불러오지 못했습니다.");
        }
        console.error("톡함 불러오기 실패:", error);
      }
    };

    loadChatRooms();
    const inboxChannel = supabase
      .channel(`chat-list:${currentUser.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          loadChatRooms();
        },
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(inboxChannel);
    };
  }, [currentUser, currentUserName, isOpen, posts]);

  if (!isOpen) return null;

  const displayedRooms = currentUser ? chatRooms : [];
  const displayedError = currentUser
    ? errorMessage
    : "채팅은 로그인 후 이용할 수 있습니다.";

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "400px",
          height: "600px",
          borderRadius: "12px",
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
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>내 톡함</h3>
          <button
            type="button"
            aria-label="톡함 닫기"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}
          >
            x
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {displayedRooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() =>
                onSelectRoom({
                  roomId: room.id,
                  postId: room.post_id,
                  title: room.title,
                  author: room.profileName,
                  avatarUrl: room.avatarUrl,
                  roomType: "group",
                })
              }
              style={{
                alignItems: "center",
                background: "white",
                border: "none",
                borderBottom: "1px solid #f0f0f0",
                cursor: "pointer",
                display: "flex",
                padding: "16px 20px",
                textAlign: "left",
                width: "100%",
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
                <ProfileAvatar avatarUrl={room.avatarUrl} name={room.profileName} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
                  <div
                    style={{
                      color: "#333",
                      flex: 1,
                      fontSize: "16px",
                      fontWeight: 700,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {room.title}
                  </div>
                  {room.unreadCount > 0 && (
                    <span
                      className="unread-count-badge"
                      aria-label={`읽지 않은 메시지 ${room.unreadCount}개`}
                      style={{
                        alignItems: "center",
                        background: "#ff4b72",
                        borderRadius: "999px",
                        color: "white",
                        display: "inline-flex",
                        flexShrink: 0,
                        fontSize: "11px",
                        fontWeight: 800,
                        height: "20px",
                        justifyContent: "center",
                        minWidth: "20px",
                        padding: "0 6px",
                      }}
                    >
                      {room.unreadCount > 99 ? "99+" : room.unreadCount}
                    </span>
                  )}
                </div>
                <div style={{ color: "#888", fontSize: "12px", margin: "4px 0" }}>
                  {room.memberCount}명 참여 중
                </div>
                <p
                  style={{
                    color: "#555",
                    fontSize: "14px",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {room.preview}
                </p>
              </div>
            </button>
          ))}

          {!displayedRooms.length && !displayedError && (
            <p style={{ color: "#888", fontSize: "14px", padding: "80px 0", textAlign: "center" }}>
              참여 중인 톡방이 없습니다.
            </p>
          )}
          {displayedError && (
            <p style={{ color: "#d9365b", fontSize: "13px", padding: "32px 20px", textAlign: "center" }}>
              {displayedError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

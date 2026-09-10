import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const TEST_ROOM_ID = "test_room";

export default function ChatRoom({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  async function fetchInitialMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("id, contents, created_at")
      .eq("room_id", TEST_ROOM_ID)
      .order("created_at", { ascending: true });
    if (error) console.error("불러오기 에러:", error.message);
    if (data) setMessages(data);
  }

  useEffect(() => {
    if (!currentUser) return undefined;

    const initialLoadId = window.setTimeout(() => {
      fetchInitialMessages();
    }, 0);

    // 🌟 'messages' 테이블 구독
    const messageListener = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${TEST_ROOM_ID}`,
        },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        },
      )
      .subscribe();

    return () => {
      window.clearTimeout(initialLoadId);
      supabase.removeChannel(messageListener);
    };
  }, [currentUser]);

  // 🌟 'messages' 테이블의 'contents' 컬럼에 넣기
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    // 💡 실제 컬럼명인 contents 사용
    const { error } = await supabase
      .from("messages")
      .insert([
        {
          room_id: TEST_ROOM_ID,
          sender_id: currentUser.id,
          contents: inputText.trim(),
        },
      ]);
    if (error) {
      console.error("전송 에러:", error.message);
    } else {
      setInputText(""); // 성공 시에만 입력창 비우기
    }
  };

  return (
    <div
      style={{
        width: "400px",
        margin: "0 auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "500px",
          overflowY: "scroll",
          padding: "20px",
          background: "#f5f5f5",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {/* 💡 화면에 contents 값을 출력 */}
            {msg.contents}
          </div>
        ))}
      </div>
      <form
        onSubmit={sendMessage}
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ddd",
          background: "white",
        }}
      >
        <input
          value={inputText}
          disabled={!currentUser}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            outline: "none",
          }}
          placeholder={currentUser ? "메시지를 입력하세요..." : "로그인 후 채팅할 수 있습니다."}
        />
        <button
          type="submit"
          disabled={!currentUser}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            background: "#ff4b72",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          전송
        </button>
      </form>
    </div>
  );
}

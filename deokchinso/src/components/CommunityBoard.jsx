import { useState, useEffect } from "react";

export default function CommunityBoard() {
  const [posts, setPosts] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const GENRES = [
    "K-POP",
    "애니메이션",
    "게임",
    "만화/웹툰",
    "뮤지컬",
    "스포츠",
    "코스프레",
  ];
  const [activeTab, setActiveTab] = useState("K-POP");

  const [isWriting, setIsWriting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState("");

  const fetchCommunityPosts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/community");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  useEffect(() => {
    const loadPostsTimer = window.setTimeout(() => {
      fetchCommunityPosts();
    }, 0);

    return () => window.clearTimeout(loadPostsTimer);
  }, []);

  const filteredPosts = posts.filter((post) => post.category === activeTab);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return alert("제목을 입력해주세요!");

    try {
      const response = await fetch("http://localhost:3000/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: activeTab,
          author: "덕후유저",
        }),
      });

      if (response.ok) {
        setNewTitle("");
        setNewContent("");
        setIsWriting(false);
        fetchCommunityPosts();
      }
    } catch {
      alert("글 작성 실패");
    }
  };

  const handlePostClick = async (post) => {
    setSelectedPost(post);

    try {
      const response = await fetch(
        `http://localhost:3000/api/community/${post.id}/view`,
        { method: "POST" },
      );
      if (response.ok) {
        const updatedPost = await response.json();
        setSelectedPost(updatedPost);
        fetchCommunityPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/community/${selectedPost.id}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newComment }),
        },
      );

      if (response.ok) {
        const updatedPost = await response.json();
        setSelectedPost(updatedPost);
        setNewComment("");
        fetchCommunityPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="community-board-container"
      style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <div
        className="community-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "30px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#18181b",
              margin: "0 0 10px 0",
            }}
          >
            💬 장르별 커뮤니티
          </h2>
          <p style={{ color: "#f43f5e", fontWeight: "600", margin: 0 }}>
            같은 장르를 좋아하는 팬들과 생생한 수다를 나누는 공간입니다.
          </p>
        </div>
        <button
          onClick={() => setIsWriting(!isWriting)}
          style={{
            backgroundColor: "#f43f5e",
            color: "white",
            padding: "12px 24px",
            borderRadius: "12px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          ✏️ {isWriting ? "취소하기" : "글쓰기"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {GENRES.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              borderRadius: "20px",
              border: activeTab === tab ? "none" : "1px solid #e4e4e7",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: activeTab === tab ? "#f43f5e" : "#ffffff",
              color: activeTab === tab ? "white" : "#57534e",
              transition: "all 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {isWriting && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "20px",
            padding: "20px",
            backgroundColor: "#fff1f2",
            borderRadius: "12px",
            border: "1px solid #fecdd3",
          }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            style={{
              padding: "14px 20px",
              borderRadius: "8px",
              border: "1px solid #fda4af",
              fontSize: "15px",
              outline: "none",
            }}
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={`${activeTab} 장르에 대해 자유롭게 이야기해 보세요!`}
            style={{
              padding: "14px 20px",
              borderRadius: "8px",
              border: "1px solid #fda4af",
              fontSize: "15px",
              outline: "none",
              minHeight: "100px",
              resize: "none",
            }}
          />
          <button
            type="submit"
            style={{
              alignSelf: "flex-end",
              backgroundColor: "#e11d48",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            등록하기
          </button>
        </form>
      )}

      {/* 🌟 크기가 흔들리지 않도록 고정된 테이블 래퍼 클래스 적용 */}
      <div className="community-table-wrapper">
        <div className="community-row header">
          <div className="col-title">제목</div>
          <div className="col-author">작성자</div>
          <div className="col-views">조회</div>
          <div className="col-time">시간</div>
        </div>

        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post)}
              className="community-row item"
            >
              <div className="col-title">
                {post.title}
                {post.comments?.length > 0 && (
                  <span
                    style={{
                      color: "#f43f5e",
                      fontSize: "13px",
                      marginLeft: "6px",
                    }}
                  >
                    [{post.comments.length}]
                  </span>
                )}
              </div>
              <div className="col-author">{post.author}</div>
              <div className="col-views">{post.views}</div>
              <div className="col-time">{post.time}</div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#71717a",
            }}
          >
            아직 작성된 글이 없습니다. 첫 번째 글을 남겨보세요!
          </div>
        )}
      </div>

      {selectedPost && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  backgroundColor: "#f4f4f5",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#57534e",
                }}
              >
                {selectedPost.category}
              </span>
              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  border: "none",
                  background: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#a1a1aa",
                }}
              >
                ✕
              </button>
            </div>

            <h3
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#18181b",
                marginBottom: "16px",
                lineHeight: "1.4",
              }}
            >
              {selectedPost.title}
            </h3>

            <div
              style={{
                display: "flex",
                gap: "12px",
                color: "#71717a",
                fontSize: "13px",
                paddingBottom: "20px",
                borderBottom: "1px solid #e4e4e7",
                marginBottom: "20px",
              }}
            >
              <span>✍️ {selectedPost.author}</span>
              <span>|</span>
              <span>👀 조회수 {selectedPost.views}</span>
              <span>|</span>
              <span>🕒 {selectedPost.time}</span>
            </div>

            <div
              style={{
                minHeight: "100px",
                color: "#3f3f46",
                fontSize: "16px",
                lineHeight: "1.6",
                marginBottom: "30px",
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedPost.content || "내용이 없습니다."}
            </div>

            <div
              style={{
                borderTop: "2px solid #f4f4f5",
                paddingTop: "20px",
                marginBottom: "20px",
              }}
            >
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "16px",
                }}
              >
                댓글 {selectedPost.comments?.length || 0}개
              </h4>
              {selectedPost.comments?.map((cmt, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f4f4f5",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#18181b",
                  }}
                >
                  <strong style={{ marginRight: "8px", color: "#57534e" }}>
                    덕후유저:
                  </strong>{" "}
                  {cmt}
                </div>
              ))}
            </div>

            <form
              onSubmit={handleCommentSubmit}
              style={{ display: "flex", gap: "8px", marginBottom: "20px" }}
            >
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 남겨보세요..."
                style={{
                  flexGrow: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e4e4e7",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0 20px",
                  backgroundColor: "#18181b",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                등록
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

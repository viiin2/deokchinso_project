import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { getUserProfile } from "../profileUtils";

const COMMUNITY_POST_SELECT = `
  id, category, title, content, author_id, author_name, author_avatar_url, views, created_at,
  community_comments (id, content, author_id, author_name, author_avatar_url, created_at)
`;

const LEGACY_COMMENT_AUTHORS = [
  "밤샘덕후",
  "최애는고양이",
  "핑크응원봉",
  "티켓팅장인",
  "만화방단골",
  "콘서트원정대",
  "라면먹는오타쿠",
  "굿즈수집가",
  "덕질은행복",
  "퇴근후정주행",
];

function formatRelativeTime(timestamp) {
  const date = new Date(timestamp);
  if (!timestamp || Number.isNaN(date.getTime())) return "방금 전";

  const elapsedMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (elapsedMinutes < 1) return "방금 전";
  if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}시간 전`;
  return `${Math.floor(elapsedHours / 24)}일 전`;
}

function toCommunityComment(comment) {
  return {
    id: comment.id,
    author: comment.author_name || "덕친소 회원",
    authorId: comment.author_id,
    avatarUrl: comment.author_avatar_url,
    createdAt: comment.created_at,
    text: comment.content,
  };
}

function toCommunityPost(post) {
  return {
    ...post,
    author: post.author_name || "덕친소 회원",
    authorId: post.author_id,
    avatarUrl: post.author_avatar_url,
    comments: (post.community_comments || [])
      .map(toCommunityComment)
      .sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt)),
    time: formatRelativeTime(post.created_at),
  };
}

function getLegacyCommentAuthor(postId, commentIndex) {
  const seed = Number(postId) || 0;
  return LEGACY_COMMENT_AUTHORS[(seed * 7 + commentIndex * 3) % LEGACY_COMMENT_AUTHORS.length];
}

function toLegacyCommunityPost(post) {
  return {
    ...post,
    id: `legacy-${post.id}`,
    legacyId: post.id,
    source: "legacy",
    author: post.author || "덕친소 운영팀",
    comments: (post.comments || []).map((comment, index) => ({
      author:
        typeof comment === "object" && comment.author
          ? comment.author
          : getLegacyCommentAuthor(post.id, index),
      id: `legacy-${post.id}-comment-${index}`,
      text: typeof comment === "object" ? comment.text || comment.content || "" : comment,
    })),
    time: post.time || "이전 작성글",
  };
}

export default function CommunityBoard({
  currentUser,
  currentUserProfile,
  focusTarget,
  onRequireLogin,
}) {
  const [posts, setPosts] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loadError, setLoadError] = useState("");

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
  const commentRefs = useRef(new Map());

  const fetchCommunityPosts = async () => {
    const [supabaseResult, legacyResult] = await Promise.allSettled([
      supabase
        .from("community_posts")
        .select(COMMUNITY_POST_SELECT)
        .order("created_at", { ascending: false }),
      fetch("http://localhost:3000/api/community").then(async (response) => {
        if (!response.ok) throw new Error("기존 커뮤니티 데이터를 불러오지 못했습니다.");
        return response.json();
      }),
    ]);

    const remotePosts =
      supabaseResult.status === "fulfilled" && !supabaseResult.value.error
        ? (supabaseResult.value.data || []).map(toCommunityPost)
        : [];
    const legacyPosts =
      legacyResult.status === "fulfilled"
        ? (legacyResult.value || []).map(toLegacyCommunityPost)
        : [];

    setPosts([...remotePosts, ...legacyPosts]);
    if (supabaseResult.status === "rejected" || supabaseResult.value?.error) {
      console.error("Supabase 커뮤니티 불러오기 실패:", supabaseResult);
      setLoadError("새 커뮤니티 기능을 사용하려면 Supabase 커뮤니티 SQL을 실행해 주세요.");
    } else if (legacyResult.status === "rejected") {
      console.error("기존 더미 커뮤니티 불러오기 실패:", legacyResult.reason);
      setLoadError("기존 커뮤니티 더미 데이터를 불러오지 못했습니다.");
    } else {
      setLoadError("");
    }
  };

  useEffect(() => {
    const loadPostsTimer = window.setTimeout(() => {
      fetchCommunityPosts();
    }, 0);

    return () => window.clearTimeout(loadPostsTimer);
  }, []);

  useEffect(() => {
    if (!focusTarget?.postId || !posts.length) return;

    const targetPost = posts.find(
      (post) => String(post.id) === String(focusTarget.postId),
    );
    if (!targetPost) return undefined;

    const openTargetTimer = window.setTimeout(() => setSelectedPost(targetPost), 0);
    return () => window.clearTimeout(openTargetTimer);
  }, [focusTarget, posts]);

  useEffect(() => {
    if (!focusTarget?.commentId || !selectedPost) return undefined;

    const scrollTimer = window.setTimeout(() => {
      commentRefs.current
        .get(String(focusTarget.commentId))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => window.clearTimeout(scrollTimer);
  }, [focusTarget, selectedPost]);

  const filteredPosts = posts.filter((post) => post.category === activeTab);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    if (!newTitle.trim()) return alert("제목을 입력해주세요!");

    try {
      const { error } = await supabase.from("community_posts").insert({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: activeTab,
      });
      if (error) throw error;

      setNewTitle("");
      setNewContent("");
      setIsWriting(false);
      fetchCommunityPosts();
    } catch (error) {
      console.error("커뮤니티 글 작성 실패:", error);
      alert("글 작성 실패");
    }
  };

  const handlePostClick = async (post) => {
    setSelectedPost(post);
    if (post.source === "legacy") return;

    const { error } = await supabase.rpc("increment_community_post_view", {
      target_post_id: post.id,
    });
    if (!error) {
      const updatedPost = { ...post, views: (post.views || 0) + 1 };
      setSelectedPost(updatedPost);
      setPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          currentPost.id === post.id ? updatedPost : currentPost,
        ),
      );
    } else {
      console.error("조회수 업데이트 실패:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    if (!newComment.trim()) return;

    try {
      if (selectedPost.source === "legacy") {
        const profile = getUserProfile(currentUser, currentUserProfile);
        const response = await fetch(
          `http://localhost:3000/api/community/${selectedPost.legacyId}/comment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              author: profile.displayName,
              author_avatar_url: profile.avatarUrl,
              author_user_id: currentUser.id,
              text: newComment.trim(),
            }),
          },
        );
        if (!response.ok) throw new Error("기존 커뮤니티 댓글 작성에 실패했습니다.");

        const updatedPost = toLegacyCommunityPost(await response.json());
        setSelectedPost(updatedPost);
        setPosts((currentPosts) =>
          currentPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
        );
        setNewComment("");
        return;
      }

      const { data, error } = await supabase
        .from("community_comments")
        .insert({ post_id: selectedPost.id, content: newComment.trim() })
        .select("id, content, author_id, author_name, author_avatar_url, created_at")
        .single();
      if (error) throw error;

      const comment = toCommunityComment(data);
      const updatedPost = {
        ...selectedPost,
        comments: [...(selectedPost.comments || []), comment],
      };
      setSelectedPost(updatedPost);
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
      );
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
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
          onClick={() => {
            if (!currentUser) {
              onRequireLogin?.();
              return;
            }
            setIsWriting(!isWriting);
          }}
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
        ) : loadError ? (
          <div
            style={{
              color: "#d9365b",
              padding: "50px",
              textAlign: "center",
            }}
          >
            {loadError}
          </div>
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
              {selectedPost.comments?.map((cmt) => (
                <div
                  key={cmt.id}
                  ref={(element) => {
                    if (element) commentRefs.current.set(String(cmt.id), element);
                  }}
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
                    {cmt.author}:
                  </strong>{" "}
                  {cmt.text}
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

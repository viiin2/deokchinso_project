import { useState } from "react";

export default function PostDetailModal({
  isOpen,
  onClose,
  post,
  onAddComment,
}) {
  const [commentText, setCommentText] = useState("");

  if (!isOpen || !post) return null;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      author: "나 (수빈)",
      text: commentText,
      time: "방금 전",
    };

    onAddComment(post.id, newComment);
    setCommentText("");
  };

  return (
    <div className="modal-overlay">
      <div className="post-detail-modal-content">
        {/* 게시글 헤더 */}
        <div className="detail-modal-header">
          <span className="detail-category-badge">
            {post.type === "talk"
              ? "🗣️ 덕질 수다방"
              : post.type === "review"
                ? "⭐ 직관 후기"
                : "🤝 양도/교환"}
          </span>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <h2 className="detail-post-title">{post.title}</h2>

        <div className="detail-post-meta">
          <span>
            작성자: <b>{post.author}</b>
          </span>
          <span>조회수: {post.views}</span>
          <span>작성일: {post.time}</span>
        </div>

        {/* 본문 내용 */}
        <div className="detail-post-body">
          <p>
            {post.content ||
              "작성된 본문 내용이 없습니다. 자유로운 소통과 정보를 나누는 공간입니다 :)"}
          </p>
        </div>

        {/* 댓글 영역 */}
        <div className="detail-comments-section">
          <h4>💬 댓글 ({post.commentsList ? post.commentsList.length : 0})</h4>

          <div className="comments-list">
            {post.commentsList && post.commentsList.length > 0 ? (
              post.commentsList.map((comm) => (
                <div className="comment-item" key={comm.id}>
                  <div className="comment-header">
                    <span className="comment-author">{comm.author}</span>
                    <span className="comment-time">{comm.time}</span>
                  </div>
                  <p className="comment-text">{comm.text}</p>
                </div>
              ))
            ) : (
              <p className="no-comments">
                아직 등록된 댓글이 없습니다. 첫 댓글을 남겨보세요!
              </p>
            )}
          </div>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="따뜻한 댓글을 남겨주세요..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit">등록</button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";

export default function WritePostModal({
  isOpen,
  onClose,
  onAddPost,
  currentBoardType,
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("익명의 덕후");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(currentBoardType);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해 주세요!");
      return;
    }

    // 새로운 게시글 객체 생성
    const newPost = {
      id: Date.now(),
      title,
      author,
      content,
      views: 1,
      comments: 0,
      time: "방금 전",
      type: category,
    };

    onAddPost(newPost); // 부모 컴포넌트로 전달
    setTitle("");
    setContent("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="write-modal-content">
        <div className="modal-header">
          <h3>✏️ 커뮤니티 새 글 작성하기</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>게시판 선택</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="talk">🗣️ 덕질 수다방</option>
              <option value="review">⭐ 직관 후기</option>
              <option value="trade">🤝 양도/교환 정보</option>
            </select>
          </div>

          <div className="form-group">
            <label>작성자 닉네임</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>글 제목</label>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>내용</label>
            <textarea
              rows="6"
              placeholder="내용을 자유롭게 적어주세요 (티켓 인증, 나눔 조건 등)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}

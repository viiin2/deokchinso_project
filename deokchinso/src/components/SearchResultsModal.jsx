import React from "react";

export default function SearchResultsModal({
  isOpen,
  onClose,
  searchCondition,
  posts,
}) {
  if (!isOpen) return null;

  // 선택한 조건에 맞는 카드 필터링 (여기서는 예시로 카테고리나 검색 조건에 맞는 데이터를 필터링합니다)
  const filteredPosts = posts; // 실제 조건 매칭 로직 연결 가능

  return (
    <div className="modal-overlay">
      <div className="search-modal-content">
        <div className="modal-header">
          <div>
            <h3 className="modal-title-main">🔍 검색 결과</h3>
            <p className="modal-subtitle">
              선택 조건:{" "}
              <span className="highlight-text">{searchCondition.region}</span> /{" "}
              <span className="highlight-text">{searchCondition.genre}</span> /{" "}
              <span className="highlight-text">{searchCondition.date}</span>
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="search-results-grid">
          {filteredPosts.map((post) => (
            <div className="card" key={post.id}>
              <div className="card-image-wrapper">
                <img src={post.img} alt={post.title} className="card-image" />
                <span className="status-badge">매칭 가능</span>
              </div>
              <div className="card-info">
                <div className="card-meta">
                  <span className="category">{post.category}</span>
                  <span className="rating">⭐ {post.rating}</span>
                </div>
                <h4 className="card-title">{post.title}</h4>
                <p className="card-detail">📅 {post.date}</p>
                <p className="card-detail">📍 {post.location}</p>
                <div className="card-footer">
                  <div className="author-info">
                    <img
                      src={`https://picsum.photos/seed/${post.author}/100/100`}
                      alt="작성자"
                    />
                    <span>{post.author}</span>
                  </div>
                  <span className="card-tag">{post.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { initialPosts } from "../data/mockData";

export default function SearchResultsModal({
  isOpen,
  onClose,
  searchCondition,
  posts,
}) {
  if (!isOpen) return null;

  // 백엔드 데이터와 더미 데이터 합치기
  const allPosts = [...(posts || []), ...initialPosts];

  const filteredPosts = allPosts.filter((post) => {
    const postRegion = post.location || post.region || "";
    const postGenre = post.category || post.genre || "";
    const postDate = post.date || "";

    // 🌟 1. 지역: 기본값이거나 '전체'가 포함되면 무조건 통과
    const isRegionMatch =
      searchCondition.region === "서울 전체, 잠실, 일산" ||
      searchCondition.region.includes("전체") ||
      postRegion.includes(searchCondition.region);

    // 🌟 2. 장르: 기본값이거나 서로 단어가 포함되어 있으면 통과
    const isGenreMatch =
      searchCondition.genre === "K-POP, 애니, 코스프레" ||
      searchCondition.genre.includes("전체") ||
      postGenre.includes(searchCondition.genre) ||
      searchCondition.genre.includes(postGenre);

    // 🌟 3. 날짜: 기본값이면 무조건 통과
    const isDateMatch =
      searchCondition.date === "언제든 좋음" ||
      searchCondition.date.includes("전체") ||
      postDate.includes(searchCondition.date);

    return isRegionMatch && isGenreMatch && isDateMatch;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content search-modal-content">
        <div className="modal-header">
          <h3>🔍 검색 결과</h3>
          <p
            className="search-condition-text"
            style={{ color: "#f43f5e", fontSize: "14px" }}
          >
            선택 조건: {searchCondition.region} / {searchCondition.genre} /{" "}
            {searchCondition.date}
          </p>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="card-grid-2">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <div className="card" key={`search-post-${post.id}-${index}`}>
                <div className="card-image-wrapper">
                  {/* 사진 안 깨지게 기본 이미지 확실하게 렌더링! */}
                  <img
                    src={
                      post.img ||
                      `https://picsum.photos/seed/${post.id}/300/200`
                    }
                    alt={post.title}
                    className="card-image"
                  />
                  <span
                    className="status-badge"
                    style={{ backgroundColor: "#f43f5e" }}
                  >
                    매칭 가능
                  </span>
                </div>
                <div className="card-info">
                  <h4 className="card-title">{post.title}</h4>
                  <p className="card-detail">📅 {post.date}</p>
                  <p className="card-detail">
                    📍 {post.location || post.region}
                  </p>
                  <div className="card-footer">
                    <div className="author-info">
                      <img
                        src={`https://picsum.photos/seed/${post.author || post.id}/100/100`}
                        alt="작성자"
                      />
                      <span>{post.author || "익명 호스트"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                gridColumn: "span 2",
                color: "#71717a",
              }}
            >
              <p>조건에 맞는 동행 방이 없습니다. 조건을 변경해 보세요! 🥲</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

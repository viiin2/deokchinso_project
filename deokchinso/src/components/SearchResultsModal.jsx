import { initialPosts } from "../data/mockData";
import { getPostHostProfile } from "../profileUtils";

export default function SearchResultsModal({
  isOpen,
  onClose,
  searchCondition,
  searchKeyword = "",
  posts,
  bookmarkedPostIds,
  onToggleBookmark,
  onOpenPostDetail,
}) {
  if (!isOpen) return null;

  // 백엔드 데이터와 더미 데이터 합치기
  const allPosts = [
    ...(posts || []).map((post) => ({
      ...post,
      chatPostId: `post:${post.id}`,
      roomId: `post_${post.id}`,
    })),
    ...initialPosts.map((post) => ({
      ...post,
      chatPostId: `mock:${post.id}`,
      roomId: `mock_${post.id}`,
    })),
  ];
  const normalizedKeyword = searchKeyword.trim().toLocaleLowerCase("ko-KR");

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
    const isKeywordMatch =
      !normalizedKeyword ||
      [post.title, post.tag, post.category, post.genre, post.location, post.region, post.author]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedKeyword);

    return isRegionMatch && isGenreMatch && isDateMatch && isKeywordMatch;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content search-modal-content">
        <div className="modal-header">
          <h3>
            🔍 {normalizedKeyword ? `“${searchKeyword.trim()}” 검색 결과` : "검색 결과"}
          </h3>
          <p
            className="search-condition-text"
            style={{ color: "#f43f5e", fontSize: "14px" }}
          >
            {normalizedKeyword
              ? "제목, 태그, 장르, 장소, 작성자에서 검색했습니다."
              : `선택 조건: ${searchCondition.region} / ${searchCondition.genre} / ${searchCondition.date}`}
          </p>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="card-grid-2">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <div
                className="card"
                key={`search-post-${post.id}-${index}`}
                onClick={() => onOpenPostDetail(post)}
              >
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
                        src={getPostHostProfile(post).avatarUrl}
                        alt="작성자"
                      />
                      <span>{getPostHostProfile(post).displayName}</span>
                    </div>
                    <button
                      type="button"
                      className={`heart-button ${
                        bookmarkedPostIds?.includes(post.roomId) ? "is-bookmarked" : ""
                      }`}
                      aria-label={
                        bookmarkedPostIds?.includes(post.roomId)
                          ? "찜한 모집글 해제"
                          : "모집글 찜하기"
                      }
                      aria-pressed={bookmarkedPostIds?.includes(post.roomId)}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleBookmark(post);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: bookmarkedPostIds?.includes(post.roomId) ? "#ff4b72" : "#999",
                        cursor: "pointer",
                        fontSize: "22px",
                        lineHeight: 1,
                        marginLeft: "auto",
                        padding: "2px 4px",
                      }}
                    >
                      {bookmarkedPostIds?.includes(post.roomId) ? "♥" : "♡"}
                    </button>
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

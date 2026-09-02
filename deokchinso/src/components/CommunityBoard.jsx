import { useState } from "react";
import WritePostModal from "./WritePostModal";
import PostDetailModal from "./PostDetailModal";

export default function CommunityBoard() {
  const [boardType, setBoardType] = useState("talk");
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // 상세 보기 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // 게시글 데이터를 상태(State)로 관리 (초기 댓글 목록 포함)
  const [posts, setPosts] = useState([
    {
      id: 1,
      type: "talk",
      title:
        "이번 콘서트 스탠딩 번호 30번대인데 체력 관리 어떻게 하시나요? ㅠㅠ",
      author: "뵬이",
      views: 342,
      comments: 12,
      time: "10분 전",
      content:
        "이번에 운 좋게 스탠딩 앞번호를 잡았는데 체력이 버틸지 너무 걱정됩니다... 콘서트 전날 숙면 외에 꿀팁 있으신 분들 공유 부탁드려요!",
      commentsList: [
        {
          id: 1,
          author: "수빈",
          text: "비타민이랑 초코바 꼭 챙겨가셔요! 생각보다 당 떨어집니다.",
          time: "5분 전",
        },
      ],
    },
    {
      id: 2,
      type: "talk",
      title: "홍대 카페에서 하는 생일 카페 가신 분 계신가요? 특전 예쁘나요?",
      author: "누들",
      views: 512,
      comments: 24,
      time: "1시간 전",
      content:
        "오늘부터 홍대에서 우리 애기 생일 카페 열린다고 해서 가보려고 하는데 다녀오신 분 후기 좀 들려주세요~ 특전 퀄리티 궁금합니다!",
      commentsList: [],
    },
    {
      id: 3,
      type: "talk",
      title: "덕질하면서 모은 포토카드 보관함 추천 좀 해주세요!",
      author: "포카리",
      views: 820,
      comments: 45,
      time: "3시간 전",
      content:
        "바인더랑 슬리브 어떤 브랜드 쓰시나요? 비닐에 흠집 안 나는 좋은 제품으로 추천 부탁드립니다!",
      commentsList: [],
    },
    {
      id: 4,
      type: "review",
      title:
        "[직관후기] KSPO DOME 2층 시야 생각보다 훨씬 좋네요! (직관 사진 포함)",
      author: "롤덕후",
      views: 1240,
      comments: 38,
      time: "어제",
      content:
        "시야제한석 아닐까 걱정했는데 돌출 무대가 한눈에 들어와서 너무 만족스러웠습니다. 응원봉 연동도 칼같이 잘 되네요!",
      commentsList: [],
    },
    {
      id: 5,
      type: "review",
      title: "뮤지컬 <지킬앤하이드> 관극 후기 및 커튼콜 촬영 팁",
      author: "뮤지컬러버",
      views: 950,
      comments: 19,
      time: "2일 전",
      content:
        "배우님들 성량에 소름 돋았습니다. 꼭 앞자리 잡아서 표정 연기까지 직관하시는 걸 추천드려요.",
      commentsList: [],
    },
    {
      id: 6,
      type: "trade",
      title: "[양도] NCT DREAM 서울콘 스탠딩 A구역 1장 양도합니다 (인증 가능)",
      author: "런쥔최고",
      views: 1580,
      comments: 8,
      time: "방금 전",
      content:
        "개인 사정으로 인해 양도합니다. 내역 인증 당연히 가능하며 안전거래나 직거래 모두 환영합니다.",
      commentsList: [],
    },
    {
      id: 7,
      type: "trade",
      title: "[교환] 일러스타페스티벌 포토카드 교환하실 분 구해요!",
      author: "코스어",
      views: 410,
      comments: 3,
      time: "30분 전",
      content:
        "중복 카드 있어서 다른 멤버로 교환 원합니다. 행사장 앞에서 직거래해요~",
      commentsList: [],
    },
  ]);

  // 새 글 추가 함수
  const handleAddPost = (newPost) => {
    const postWithComments = { ...newPost, commentsList: [] };
    setPosts([postWithComments, ...posts]);
    setBoardType(newPost.type);
  };

  // 댓글 추가 함수
  const handleAddComment = (postId, newComment) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const updatedComments = [...(post.commentsList || []), newComment];
          const updatedPost = {
            ...post,
            commentsList: updatedComments,
            comments: updatedComments.length,
          };
          setSelectedPost(updatedPost); // 열려있는 모달의 내용도 즉시 업데이트
          return updatedPost;
        }
        return post;
      }),
    );
  };

  const currentPosts = posts.filter((post) => post.type === boardType);

  return (
    <div className="community-container">
      <div className="community-header">
        <div>
          <h2 className="main-title">💬 덕친소 커뮤니티</h2>
          <p className="sub-title">
            덕후들의 생생한 수다와 직관 후기를 나누는 공간입니다.
          </p>
        </div>
        <button className="write-btn" onClick={() => setIsWriteModalOpen(true)}>
          ✏️ 글쓰기
        </button>
      </div>

      {/* 게시판 탭 메뉴 */}
      <div className="community-tabs">
        <button
          className={`community-tab ${boardType === "talk" ? "active" : ""}`}
          onClick={() => setBoardType("talk")}
        >
          🗣️ 덕질 수다방
        </button>
        <button
          className={`community-tab ${boardType === "review" ? "active" : ""}`}
          onClick={() => setBoardType("review")}
        >
          ⭐ 직관 후기
        </button>
        <button
          className={`community-tab ${boardType === "trade" ? "active" : ""}`}
          onClick={() => setBoardType("trade")}
        >
          🤝 양도/교환 정보
        </button>
      </div>

      {/* 게시글 리스트 테이블 */}
      <div className="community-table">
        <div className="table-header-row">
          <span className="col-title">제목</span>
          <span className="col-author">작성자</span>
          <span className="col-views">조회</span>
          <span className="col-time">시간</span>
        </div>
        {currentPosts.length > 0 ? (
          currentPosts.map((post) => (
            <div
              className="table-body-row"
              key={post.id}
              onClick={() => {
                setSelectedPost(post);
                setIsDetailModalOpen(true);
              }}
            >
              <div className="col-title post-title-text">
                {post.title}{" "}
                <span className="comment-count">[{post.comments}]</span>
              </div>
              <div className="col-author">{post.author}</div>
              <div className="col-views">{post.views}</div>
              <div className="col-time">{post.time}</div>
            </div>
          ))
        ) : (
          <p
            className="empty-text"
            style={{ padding: "40px", textAlign: "center", color: "#71717a" }}
          >
            작성된 게시글이 없습니다. 첫 글을 남겨보세요!
          </p>
        )}
      </div>

      {/* 글쓰기 모달 */}
      <WritePostModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onAddPost={handleAddPost}
        currentBoardType={boardType}
      />

      {/* 게시글 상세 보기 및 댓글 모달 */}
      <PostDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        post={selectedPost}
        onAddComment={handleAddComment}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import "./App.css";
import {
  locationOptions,
  genreOptions,
  dateOptions,
  MY_PROFILE_IMG,
} from "./data/mockData";
import HomeSection from "./components/HomeSection";
import HostModal from "./components/HostModal";
import SearchResultsModal from "./components/SearchResultsModal";
import ChatModal from "./components/ChatModal";
import ProfileModal from "./components/ProfileModal";
import MyPageModal from "./components/MyPageModal";
import CommunityBoard from "./components/CommunityBoard";
import GuidePage from "./components/GuidePage";
import PopularEventsPage from "./components/PopularEventsPage";

export default function App() {
  // 🌟 1. 서버에서 가져온 게시글 데이터를 저장할 상태
  const [posts, setPosts] = useState([]);

  const [activeMenu, setActiveMenu] = useState("동행 찾기");
  const [activeCategory, setActiveCategory] = useState("ani");

  const [location, setLocation] = useState(locationOptions[0]);
  const [genre, setGenre] = useState(genreOptions[0]);
  const [date, setDate] = useState(dateOptions[0]);

  // 모달 상태 관리
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [currentCondition, setCurrentCondition] = useState({
    region: "",
    genre: "",
    date: "",
  });

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);

  // 🌟 2. 백엔드(8080포트)에서 데이터 불러오기 함수
  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/posts");
      const data = await response.json();
      setPosts(data); // 불러온 데이터로 화면 업데이트
    } catch (error) {
      console.error("데이터를 불러오는 중 에러 발생:", error);
    }
  };

  // 🌟 3. 앱이 처음 켜질 때 딱 한 번 데이터 불러오기
  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = () => {
    setCurrentCondition({ region: location, genre: genre, date: date });
    setIsSearchModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* 네비게이션 바 */}
      <header className="navbar">
        <div className="nav-left">
          <span className="logo-icon">덕</span>
          <h1 className="logo-text">덕친소</h1>
          <span className="logo-desc hidden-mobile">
            덕질 친구를 소개합니다
          </span>
        </div>
        <nav className="nav-menu">
          {["동행 찾기", "인기 이벤트", "커뮤니티", "덕친소 가이드"].map(
            (tab) => (
              <button
                key={tab}
                className={`nav-btn ${activeMenu === tab ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu(tab);
                  if (tab === "동행 찾기") setIsSearchModalOpen(false);
                }}
              >
                {tab}
              </button>
            ),
          )}
        </nav>
        <div className="nav-right">
          <button className="host-btn" onClick={() => setIsHostModalOpen(true)}>
            호스트 등록
          </button>
          <div className="profile-img" onClick={() => setIsMyPageOpen(true)}>
            <img src={MY_PROFILE_IMG} alt="내 프로필" />
          </div>
        </div>
      </header>

      {/* 메뉴별 본문 전환 */}
      {activeMenu === "동행 찾기" && (
        <HomeSection
          posts={posts} // 🌟 4. 서버에서 받아온 posts 데이터를 넘겨줌
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          location={location}
          setLocation={setLocation}
          locationOptions={locationOptions}
          genre={genre}
          setGenre={setGenre}
          genreOptions={genreOptions}
          date={date}
          setDate={setDate}
          dateOptions={dateOptions}
          handleSearch={handleSearch}
          setSelectedPost={setSelectedPost}
          setIsChatModalOpen={setIsChatModalOpen}
          setSelectedUser={setSelectedUser}
          setIsProfileModalOpen={setIsProfileModalOpen}
          setIsHostModalOpen={setIsHostModalOpen}
          setCurrentCondition={setCurrentCondition}
          setIsSearchModalOpen={setIsSearchModalOpen}
        />
      )}
      {activeMenu === "인기 이벤트" && <PopularEventsPage />}
      {activeMenu === "커뮤니티" && <CommunityBoard />}
      {activeMenu === "덕친소 가이드" && <GuidePage />}

      <footer className="footer-dark">
        <div className="footer-top">
          <div className="footer-logo-area">
            <div className="footer-logo-row">
              <span className="logo-icon">덕</span>
              <span className="footer-logo-text">덕친소</span>
            </div>
            <p className="footer-desc">
              덕친소는 팬들의 더 행복하고 안전한 문화 예술 향유를
              <br />
              위해 동행 매칭 서비스를 제공하는 플랫폼입니다.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Deokchinso Inc. All rights reserved.</p>
        </div>
      </footer>

      {/* 모든 모달 */}
      <HostModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        onSuccess={fetchPosts} // 🌟 5. 글 작성 완료 시 새로고침 하도록 함수 넘김
      />
      <SearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchCondition={currentCondition}
        posts={posts} // 🌟 6. 검색 결과 모달에도 불러온 데이터 넘김
      />
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        targetMate={selectedPost}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        targetUser={selectedUser}
      />
      <MyPageModal
        isOpen={isMyPageOpen}
        onClose={() => setIsMyPageOpen(false)}
        profileImg={MY_PROFILE_IMG}
      />
    </div>
  );
}

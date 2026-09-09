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
import ChatListModal from "./components/ChatListModal";
import LoginModal from "./components/LoginModal";
import { supabase } from "./supabase";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [activeMenu, setActiveMenu] = useState("동행 찾기");
  const [activeCategory, setActiveCategory] = useState("ani");
  const [location, setLocation] = useState(locationOptions[0]);
  const [genre, setGenre] = useState(genreOptions[0]);
  const [date, setDate] = useState(dateOptions[0]);

  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
  const [isChatListOpen, setIsChatListOpen] = useState(false);

  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("데이터 불러오기 에러:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = () => {
    setCurrentCondition({ region: location, genre: genre, date: date });
    setIsSearchModalOpen(true);
  };

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);

    if (activeMenu === "동행 찾기") {
      document
        .getElementById("recruitment-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="app-container">
      <header
        className="navbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "white",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
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
        <div
          className="nav-right"
          style={{ display: "flex", gap: "12px", alignItems: "center" }}
        >
          <button
            onClick={() => {
              setIsChatModalOpen(false);
              setIsChatListOpen(true);
            }}
            style={{
              background: "#ff4b72",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            💬 내 톡함
          </button>
          <button className="host-btn" onClick={() => setIsHostModalOpen(true)}>
            호스트 등록
          </button>
          {user ? (
            <button
              onClick={handleLogout}
              style={{
                background: "#f0f0f0",
                color: "#555",
                border: "none",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              style={{
                background: "white",
                color: "#ff4b72",
                border: "1px solid #ff4b72",
                padding: "7px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              로그인 / 회원가입
            </button>
          )}
          <div className="profile-img" onClick={() => setIsMyPageOpen(true)}>
            <img
              src={user?.user_metadata?.avatar_url || MY_PROFILE_IMG}
              alt="내 프로필"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                cursor: "pointer",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </header>

      {activeMenu === "동행 찾기" && (
        <HomeSection
          posts={posts}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
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
      {activeMenu === "인기 이벤트" && (
        <PopularEventsPage onOpenHostModal={() => setIsHostModalOpen(true)} />
      )}
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

      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          display: "flex",
          gap: "15px",
          alignItems: "flex-end",
          zIndex: 9900,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {isFabOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "60px",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                width: "130px",
              }}
            >
              {genreOptions.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    handleCategorySelect(g);
                    setIsFabOpen(false);
                  }}
                  style={{
                    border: "none",
                    background:
                      activeCategory === g ? "#fff5f5" : "transparent",
                    color: activeCategory === g ? "#ff4b72" : "#333",
                    fontWeight: activeCategory === g ? "bold" : "normal",
                    padding: "10px",
                    cursor: "pointer",
                    textAlign: "center",
                    borderRadius: "8px",
                    fontSize: "14px",
                    width: "100%",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#333",
              color: "white",
              border: "none",
              fontSize: "22px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "transform 0.2s",
            }}
          >
            {isFabOpen ? "✕" : "☰"}
          </button>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#ff4b72",
            color: "white",
            border: "none",
            fontSize: "24px",
            boxShadow: "0 4px 12px rgba(255,75,114,0.4)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          ↑
        </button>
      </div>

      <HostModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        onSuccess={fetchPosts}
      />
      <SearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchCondition={currentCondition}
        posts={posts}
      />
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        targetMate={selectedPost}
        currentUser={user}
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
      <ChatListModal
        isOpen={isChatListOpen}
        onClose={() => setIsChatListOpen(false)}
        onSelectRoom={(room) => {
          // 🌟 목록에서 방을 눌렀을 때 'roomId'를 정확하게 ChatModal로 꽂아줍니다!
          setSelectedPost({
            roomId: room.roomId,
            author: room.author,
            title: room.title,
            postId: room.postId,
            roomType: room.roomType,
          });
          setIsChatListOpen(false);
          setIsChatModalOpen(true);
        }}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

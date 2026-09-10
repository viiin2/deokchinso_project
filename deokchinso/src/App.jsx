import { useState, useEffect } from "react";
import "./App.css";
import {
  locationOptions,
  genreOptions,
  dateOptions,
  categories,
} from "./data/mockData";
import defaultProfileAvatar from "./assets/default-profile.svg";
import HomeSection from "./components/HomeSection";
import HostModal from "./components/HostModal";
import SearchResultsModal from "./components/SearchResultsModal";
import ChatModal from "./components/ChatModal";
import ProfileModal from "./components/ProfileModal";
import MyPageModal from "./components/MyPageModal";
import CommunityBoard from "./components/CommunityBoard";
import GuideModal from "./components/GuideModal";
import PopularEventsPage from "./components/PopularEventsPage";
import ChatListModal from "./components/ChatListModal";
import RecruitmentDetailModal from "./components/RecruitmentDetailModal";
import LoginModal from "./components/LoginModal";
import { supabase } from "./supabase";
import { getUserProfile } from "./profileUtils";
import { bookmarkKey, loadBookmarks, saveBookmarks, toBookmark } from "./bookmarks";
import { addAppliedPost, loadAppliedPosts } from "./activities";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [activeMenu, setActiveMenu] = useState("동행 찾기");
  const [activeCategory, setActiveCategory] = useState("ani");
  const [location, setLocation] = useState(locationOptions[0]);
  const [genre, setGenre] = useState(genreOptions[0]);
  const [date, setDate] = useState(dateOptions[0]);

  const [user, setUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [appliedPosts, setAppliedPosts] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
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
  const [isRecruitmentDetailOpen, setIsRecruitmentDetailOpen] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const [isChatListOpen, setIsChatListOpen] = useState(false);

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [hostInitialEvent, setHostInitialEvent] = useState(null);
  const [communityFocusTarget, setCommunityFocusTarget] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async (session) => {
      const authUser = session?.user ?? null;
      if (!isMounted) return;

      setUser(authUser);
      if (!authUser) {
        setCurrentUserProfile(null);
        return;
      }

      const fallbackProfile = getUserProfile(authUser);
      setCurrentUserProfile({
        display_name: fallbackProfile.displayName,
        avatar_url: fallbackProfile.avatarUrl,
      });

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!isMounted) return;
      if (data) {
        setCurrentUserProfile(data);
        return;
      }

      if (error) {
        console.error("프로필을 불러오지 못했습니다:", error);
        return;
      }

      const { data: savedProfile, error: saveError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: authUser.id,
            display_name: fallbackProfile.displayName,
            avatar_url: fallbackProfile.avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )
        .select("display_name, avatar_url")
        .single();

      if (!isMounted) return;
      if (saveError) {
        console.error("기본 프로필을 저장하지 못했습니다:", saveError);
        return;
      }
      setCurrentUserProfile(savedProfile);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigationProfile = getUserProfile(user, currentUserProfile);

  useEffect(() => {
    const loadBookmarksTimer = window.setTimeout(() => {
      setBookmarks(loadBookmarks(user?.id));
    }, 0);

    return () => window.clearTimeout(loadBookmarksTimer);
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      const resetUnreadTimer = window.setTimeout(() => setUnreadChatCount(0), 0);
      return () => window.clearTimeout(resetUnreadTimer);
    }

    let isCancelled = false;
    const getRoomIds = async () => {
      const { data: memberships, error } = await supabase
        .from("chat_room_members")
        .select("room_id")
        .eq("user_id", user.id);
      if (error) throw error;

      const memberRoomIds = memberships
        .map((membership) => membership.room_id)
        .filter((roomId) => !roomId.startsWith("group_"));
      const hostedRoomIds = posts
        .filter(
          (post) =>
            post.author_user_id === user.id ||
            (!post.author_user_id && post.author === navigationProfile.displayName),
        )
        .map((post) => `post_${post.id}`);
      return [...new Set([...memberRoomIds, ...hostedRoomIds])];
    };

    const loadUnreadChatCount = async () => {
      try {
        const roomIds = await getRoomIds();
        if (!roomIds.length || isCancelled) {
          if (!isCancelled) setUnreadChatCount(0);
          return;
        }

        const { data: messages, error: messagesError } = await supabase
          .from("messages")
          .select("id, sender_id")
          .in("room_id", roomIds)
          .neq("sender_id", user.id);
        if (messagesError) throw messagesError;

        const messageIds = messages.map((message) => String(message.id));
        if (!messageIds.length || isCancelled) {
          if (!isCancelled) setUnreadChatCount(0);
          return;
        }

        const { data: messageReads, error: readsError } = await supabase
          .from("message_reads")
          .select("message_id")
          .eq("user_id", user.id)
          .in("message_id", messageIds);
        if (readsError) throw readsError;

        if (!isCancelled) {
          const readMessageIds = new Set(
            messageReads.map((messageRead) => String(messageRead.message_id)),
          );
          setUnreadChatCount(
            messages.filter((message) => !readMessageIds.has(String(message.id))).length,
          );
        }
      } catch (error) {
        console.error("미확인 채팅 수를 불러오지 못했습니다:", error);
      }
    };

    loadUnreadChatCount();
    const channel = supabase
      .channel(`chat-inbox-badge:${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, loadUnreadChatCount)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message_reads" },
        loadUnreadChatCount,
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [navigationProfile.displayName, posts, user]);

  useEffect(() => {
    const loadApplicationsTimer = window.setTimeout(() => {
      setAppliedPosts(loadAppliedPosts(user?.id));
    }, 0);

    return () => window.clearTimeout(loadApplicationsTimer);
  }, [user?.id]);

  const handleToggleBookmark = (post) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setBookmarks((previous) => {
      const key = bookmarkKey(post);
      const alreadyBookmarked = previous.some((bookmark) => bookmark.id === key);
      const next = alreadyBookmarked
        ? previous.filter((bookmark) => bookmark.id !== key)
        : [toBookmark(post), ...previous];
      saveBookmarks(user.id, next);
      return next;
    });
  };

  const handleReturnHome = () => {
    setActiveMenu("동행 찾기");
    setIsSearchModalOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenPostDetail = (post) => {
    setSelectedPost(post);
    setIsChatModalOpen(false);
    setIsRecruitmentDetailOpen(true);
  };

  const handleStartChat = (post) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    const isMyPost =
      post.author_user_id === user.id ||
      (!post.author_user_id && post.author === navigationProfile.displayName);
    if (!isMyPost) {
      setAppliedPosts(addAppliedPost(user.id, post));
    }

    setSelectedPost(post);
    setIsRecruitmentDetailOpen(false);
    setIsMyPageOpen(false);
    setIsSearchModalOpen(false);
    setIsChatModalOpen(true);
  };

  const handleDeleteRecruitmentPost = async (post) => {
    if (!user || !post?.author_user_id || post.author_user_id !== user.id) return;
    if (!window.confirm("이 모집글을 삭제할까요? 삭제한 글은 복구할 수 없습니다.")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${post.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_user_id: user.id }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "모집글 삭제에 실패했습니다.");
      }

      setPosts((currentPosts) => currentPosts.filter((currentPost) => currentPost.id !== post.id));
      setIsRecruitmentDetailOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("모집글 삭제 실패:", error);
      alert(error.message || "모집글 삭제에 실패했습니다.");
    }
  };

  const handleOpenHostModal = (event = null) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setHostInitialEvent(event);
    setIsHostModalOpen(true);
  };

  const hostedPosts = user
    ? posts
        .filter(
          (post) =>
            post.author_user_id === user.id ||
            (!post.author_user_id && post.author === navigationProfile.displayName),
        )
        .map((post) => ({
          ...post,
          chatPostId: `post:${post.id}`,
          roomId: `post_${post.id}`,
        }))
    : [];

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
    const loadPostsTimer = window.setTimeout(() => {
      fetchPosts();
    }, 0);

    return () => window.clearTimeout(loadPostsTimer);
  }, []);

  const handleSearch = () => {
    setCurrentCondition({ region: location, genre: genre, date: date });
    setIsSearchModalOpen(true);
  };

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveMenu("동행 찾기");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document
          .getElementById("recruitment-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
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
        <div
          className="nav-left"
          role="button"
          tabIndex={0}
          onClick={handleReturnHome}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") handleReturnHome();
          }}
          style={{ cursor: "pointer" }}
        >
          <span className="logo-icon logo-intro-icon">덕</span>
          <h1 className="logo-text logo-intro-text">덕친소</h1>
          <span className="logo-desc hidden-mobile">
            덕질 친구를 소개합니다
          </span>
        </div>
        <nav className="nav-menu">
          {[
            "동행 찾기",
            "인기 이벤트",
            "커뮤니티",
          ].map((tab) => (
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
          ))}
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
              position: "relative",
            }}
          >
            💬 내 톡함
            {unreadChatCount > 0 && (
              <span
                className="unread-count-badge nav-unread-count-badge"
                aria-label={`읽지 않은 메시지 ${unreadChatCount}개`}
                style={{
                  alignItems: "center",
                  background: "#d9365b",
                  border: "2px solid white",
                  borderRadius: "999px",
                  color: "white",
                  display: "inline-flex",
                  fontSize: "10px",
                  fontWeight: 800,
                  height: "19px",
                  justifyContent: "center",
                  minWidth: "19px",
                  padding: "0 4px",
                  position: "absolute",
                  right: "-9px",
                  top: "-8px",
                }}
              >
                {unreadChatCount > 99 ? "99+" : unreadChatCount}
              </span>
            )}
          </button>
          <button className="host-btn" onClick={() => handleOpenHostModal()}>
            <span aria-hidden="true">+</span> 동행방 모집
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
          <div
            className="profile-img"
            onClick={() => (user ? setIsMyPageOpen(true) : setIsLoginModalOpen(true))}
          >
            <img
              src={user ? navigationProfile.avatarUrl : defaultProfileAvatar}
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
          onOpenPostDetail={handleOpenPostDetail}
          setSelectedUser={setSelectedUser}
          setIsProfileModalOpen={setIsProfileModalOpen}
          onOpenHostModal={handleOpenHostModal}
          setCurrentCondition={setCurrentCondition}
          setIsSearchModalOpen={setIsSearchModalOpen}
          bookmarkedPostIds={bookmarks.map((bookmark) => bookmark.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}
      {activeMenu === "인기 이벤트" && (
        <PopularEventsPage onOpenHostModal={handleOpenHostModal} />
      )}
      {activeMenu === "커뮤니티" && (
        <CommunityBoard
          currentUser={user}
          currentUserProfile={currentUserProfile}
          focusTarget={communityFocusTarget}
          onRequireLogin={() => setIsLoginModalOpen(true)}
        />
      )}

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
              className="quick-action-menu"
              style={{
                position: "absolute",
                bottom: "60px",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                width: "160px",
              }}
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="quick-action-category quick-action-menu-item"
                  onClick={() => {
                    handleCategorySelect(category.id);
                    setIsFabOpen(false);
                  }}
                  style={{
                    border: "none",
                    background:
                      activeCategory === category.id ? "#fff5f5" : "transparent",
                    color: activeCategory === category.id ? "#d9365b" : "#333",
                    fontWeight: activeCategory === category.id ? "bold" : "normal",
                    padding: "10px",
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: "8px",
                    fontSize: "14px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background 160ms ease, transform 160ms ease",
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: "18px" }}>
                    {category.icon}
                  </span>
                  {category.name}
                </button>
              ))}
              <div style={{ borderTop: "1px solid #eee", margin: "2px 0" }} />
              <button
                type="button"
                className="quick-action-menu-item"
                onClick={() => {
                  setIsGuideOpen(true);
                  setIsFabOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: "8px",
                  color: "#333",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: "10px",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                📘 덕친소 가이드
              </button>
            </div>
          )}
          <button
            className={`quick-action-button quick-action-category-toggle ${
              isFabOpen ? "is-open" : ""
            }`}
            onClick={() => setIsFabOpen(!isFabOpen)}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#ff4b72",
              color: "white",
              border: "none",
              fontSize: "22px",
              boxShadow: "0 4px 12px rgba(255,75,114,0.35)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "transform 180ms ease, background 180ms ease",
            }}
          >
            {isFabOpen ? "✕" : "☰"}
          </button>
        </div>
        <button
          className="quick-action-button quick-action-top-button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#333",
            color: "white",
            border: "none",
            fontSize: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
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
        key={hostInitialEvent?.id || "manual"}
        isOpen={isHostModalOpen}
        onClose={() => {
          setIsHostModalOpen(false);
          setHostInitialEvent(null);
        }}
        onSuccess={fetchPosts}
        currentUser={user}
        currentUserProfile={currentUserProfile}
        initialEvent={hostInitialEvent}
      />
      <SearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchCondition={currentCondition}
        posts={posts}
        bookmarkedPostIds={bookmarks.map((bookmark) => bookmark.id)}
        onToggleBookmark={handleToggleBookmark}
        onOpenPostDetail={handleOpenPostDetail}
      />
      <RecruitmentDetailModal
        isOpen={isRecruitmentDetailOpen}
        onClose={() => setIsRecruitmentDetailOpen(false)}
        post={selectedPost}
        isOwnPost={
          Boolean(user && selectedPost) &&
          selectedPost.author_user_id === user.id
        }
        isBookmarked={bookmarks.some((bookmark) => bookmark.id === bookmarkKey(selectedPost || {}))}
        onToggleBookmark={handleToggleBookmark}
        onStartChat={handleStartChat}
        onDeletePost={handleDeleteRecruitmentPost}
      />
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        targetMate={selectedPost}
        currentUser={user}
        currentUserProfile={currentUserProfile}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        targetUser={selectedUser}
      />
      <MyPageModal
        isOpen={isMyPageOpen}
        onClose={() => setIsMyPageOpen(false)}
        currentUser={user}
        currentUserProfile={currentUserProfile}
        onProfileUpdated={(profile) => setCurrentUserProfile(profile)}
        bookmarks={bookmarks}
        appliedPosts={appliedPosts}
        hostedPosts={hostedPosts}
        onOpenPost={(post) => {
          setIsMyPageOpen(false);
          handleOpenPostDetail(post);
        }}
        onStartChat={handleStartChat}
        onOpenCommunityActivity={(target) => {
          setCommunityFocusTarget({ ...target, requestedAt: Date.now() });
          setIsMyPageOpen(false);
          setActiveMenu("커뮤니티");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      <ChatListModal
        isOpen={isChatListOpen}
        onClose={() => setIsChatListOpen(false)}
        currentUser={user}
        currentUserName={navigationProfile.displayName}
        posts={posts}
        onSelectRoom={(room) => {
          setSelectedPost({
            roomId: room.roomId,
            author: room.author,
            avatarUrl: room.avatarUrl,
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
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

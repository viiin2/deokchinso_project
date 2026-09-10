import { useEffect, useRef, useState } from "react";
import { getDefaultAvatarUrl, getUserProfile } from "../profileUtils";
import { supabase } from "../supabase";

export default function MyPageModal({
  isOpen,
  onClose,
  currentUser,
  currentUserProfile,
  onProfileUpdated,
  bookmarks,
  appliedPosts,
  hostedPosts,
  onOpenPost,
  onStartChat,
  onOpenCommunityActivity,
}) {
  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="modal-overlay">
        <div className="mypage-modal-content" style={{ maxWidth: "420px", textAlign: "center" }}>
          <div className="modal-header">
            <h3>마이페이지</h3>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
          <p style={{ color: "#666", margin: "36px 0" }}>로그인 후 내 프로필을 관리할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <MyPageContent
      key={currentUser.id}
      currentUser={currentUser}
      profile={getUserProfile(currentUser, currentUserProfile)}
      onClose={onClose}
      onProfileUpdated={onProfileUpdated}
      bookmarks={bookmarks || []}
      appliedPosts={appliedPosts || []}
      hostedPosts={hostedPosts || []}
      onOpenPost={onOpenPost}
      onStartChat={onStartChat}
      onOpenCommunityActivity={onOpenCommunityActivity}
    />
  );
}

function MyPageContent({
  currentUser,
  profile,
  onClose,
  onProfileUpdated,
  bookmarks,
  appliedPosts,
  hostedPosts,
  onOpenPost,
  onStartChat,
  onOpenCommunityActivity,
}) {
  const [activeTab, setActiveTab] = useState("applied");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [communityActivity, setCommunityActivity] = useState({
    comments: [],
    error: "",
    isLoading: true,
    posts: [],
  });
  const currentItems = {
    applied: appliedPosts,
    communityComments: communityActivity.comments,
    communityPosts: communityActivity.posts,
    hosted: hostedPosts,
    liked: bookmarks,
  };

  useEffect(() => {
    let isCancelled = false;

    const loadCommunityActivity = async () => {
      try {
        const [postsResult, commentsResult, legacyPosts] = await Promise.all([
          supabase
            .from("community_posts")
            .select("id, category, title, created_at")
            .eq("author_id", currentUser.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("community_comments")
            .select("id, content, created_at, community_posts (id, category, title)")
            .eq("author_id", currentUser.id)
            .order("created_at", { ascending: false }),
          fetch("http://localhost:3000/api/community")
            .then(async (response) => (response.ok ? response.json() : []))
            .catch(() => []),
        ]);
        if (postsResult.error) throw postsResult.error;
        if (commentsResult.error) throw commentsResult.error;
        if (isCancelled) return;

        const supabaseComments = (commentsResult.data || []).map((comment) => {
            const parentPost = Array.isArray(comment.community_posts)
              ? comment.community_posts[0]
              : comment.community_posts;
            return {
              ...comment,
              postCategory: parentPost?.category || "커뮤니티",
              postId: parentPost?.id,
              postTitle: parentPost?.title || "삭제된 게시글",
              source: "supabase",
            };
          });
        const legacyComments = legacyPosts.flatMap((post) =>
          (post.comments || [])
            .filter(
              (comment) =>
                typeof comment === "object" && comment.author_user_id === currentUser.id,
            )
            .map((comment, index) => ({
              content: comment.text || comment.content || "",
              created_at: comment.created_at,
              id: comment.id || `legacy-${post.id}-comment-${index}`,
              postCategory: post.category || "커뮤니티",
              postId: `legacy-${post.id}`,
              postTitle: post.title || "삭제된 게시글",
              source: "legacy",
            })),
        );

        setCommunityActivity({
          comments: [...supabaseComments, ...legacyComments].sort(
            (first, second) =>
              new Date(second.created_at || 0).getTime() -
              new Date(first.created_at || 0).getTime(),
          ),
          error: "",
          isLoading: false,
          posts: postsResult.data || [],
        });
      } catch (error) {
        console.error("내 커뮤니티 활동 불러오기 실패:", error);
        if (!isCancelled) {
          setCommunityActivity({
            comments: [],
            error: "커뮤니티 활동을 불러오지 못했습니다. Supabase 커뮤니티 SQL을 실행해 주세요.",
            isLoading: false,
            posts: [],
          });
        }
      }
    };

    loadCommunityActivity();
    return () => {
      isCancelled = true;
    };
  }, [currentUser.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mypage-modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>마이페이지</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="mypage-profile-banner">
          <img src={profile.avatarUrl} alt="내 프로필" className="mypage-avatar" />
          <div style={{ flex: 1 }}>
            <h4 className="mypage-username">{profile.displayName} 님</h4>
            <p className="mypage-email">{currentUser.email}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingProfile(true)}
            style={{
              background: "white",
              border: "1px solid #f4b3c1",
              borderRadius: "8px",
              color: "#d9365b",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 800,
              padding: "8px 10px",
            }}
          >
            프로필 편집
          </button>
        </div>

        <div
          style={{
            background: "#fff7f8",
            border: "1px solid #ffe3e8",
            borderRadius: "14px",
            marginBottom: "20px",
            padding: "14px",
          }}
        >
          <div
            style={{
              alignItems: "center",
              borderBottom: "1px solid #f7dfe4",
              display: "flex",
              justifyContent: "space-between",
              paddingBottom: "10px",
            }}
          >
            <span style={{ color: "#666", fontSize: "13px", fontWeight: 700 }}>내 덕력 온도</span>
            <strong style={{ color: "#d9365b", fontSize: "18px" }}>36.8°C</strong>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginTop: "12px" }}>
            <div style={{ textAlign: "center" }}>
              <strong style={{ color: "#333", display: "block", fontSize: "16px" }}>14회</strong>
              <span style={{ color: "#888", fontSize: "11px" }}>호스트 주최</span>
            </div>
            <div style={{ borderLeft: "1px solid #f1d9df", borderRight: "1px solid #f1d9df", textAlign: "center" }}>
              <strong style={{ color: "#333", display: "block", fontSize: "16px" }}>28회</strong>
              <span style={{ color: "#888", fontSize: "11px" }}>동행 참여</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <strong style={{ color: "#333", display: "block", fontSize: "16px" }}>100%</strong>
              <span style={{ color: "#888", fontSize: "11px" }}>응답률</span>
            </div>
          </div>
        </div>

        <div className="mypage-tabs">
          <button
            className={`mypage-tab-btn ${activeTab === "applied" ? "active" : ""}`}
            onClick={() => setActiveTab("applied")}
          >
            신청한 동행 ({currentItems.applied.length})
          </button>
          <button
            className={`mypage-tab-btn ${activeTab === "hosted" ? "active" : ""}`}
            onClick={() => setActiveTab("hosted")}
          >
            내가 연 방 ({currentItems.hosted.length})
          </button>
          <button
            className={`mypage-tab-btn ${activeTab === "liked" ? "active" : ""}`}
            onClick={() => setActiveTab("liked")}
          >
            찜한 이벤트 ({currentItems.liked.length})
          </button>
          <button
            className={`mypage-tab-btn ${activeTab === "communityPosts" ? "active" : ""}`}
            onClick={() => setActiveTab("communityPosts")}
          >
            내 커뮤니티 글 ({currentItems.communityPosts.length})
          </button>
          <button
            className={`mypage-tab-btn ${activeTab === "communityComments" ? "active" : ""}`}
            onClick={() => setActiveTab("communityComments")}
          >
            내 댓글 ({currentItems.communityComments.length})
          </button>
        </div>

        <div className="mypage-list-area">
          {activeTab === "applied" &&
            (appliedPosts.length ? (
              appliedPosts.map((item) => (
                <ActivityCard
                  key={item.id}
                  item={item}
                  badge={item.status || "채팅 참여 중"}
                  actionLabel="채팅하기"
                  onAction={() => onStartChat(item)}
                />
              ))
            ) : (
              <p className="empty-text">신청한 동행 내역이 없습니다.</p>
            ))}

          {activeTab === "hosted" &&
            (hostedPosts.length ? (
              hostedPosts.map((item) => (
                <ActivityCard
                  key={item.roomId || item.id}
                  item={item}
                  badge="모집 중"
                  isHost
                  actionLabel="모집글 보기"
                  onAction={() => onOpenPost(item)}
                />
              ))
            ) : (
              <p className="empty-text">내가 연 동행방이 없습니다.</p>
            ))}

          {activeTab === "liked" &&
            (bookmarks.length ? (
              bookmarks.map((item) => (
                <ActivityCard
                  key={item.id}
                  item={item}
                  badge={item.category}
                  actionLabel="상세 보기"
                  onAction={() => onOpenPost(item)}
                />
              ))
            ) : (
              <p className="empty-text">찜한 이벤트가 없습니다.</p>
            ))}

          {activeTab === "communityPosts" && (
            <CommunityActivityList
              emptyMessage="작성한 커뮤니티 글이 없습니다."
              error={communityActivity.error}
              isLoading={communityActivity.isLoading}
              items={communityActivity.posts}
              onOpen={onOpenCommunityActivity}
              type="post"
            />
          )}

          {activeTab === "communityComments" && (
            <CommunityActivityList
              emptyMessage="작성한 댓글이 없습니다."
              error={communityActivity.error}
              isLoading={communityActivity.isLoading}
              items={communityActivity.comments}
              onOpen={onOpenCommunityActivity}
              type="comment"
            />
          )}
        </div>

        {isEditingProfile && (
          <ProfileEditModal
            currentUser={currentUser}
            profile={profile}
            onClose={() => setIsEditingProfile(false)}
            onProfileUpdated={onProfileUpdated}
          />
        )}
      </div>
    </div>
  );
}

function formatCommunityActivityTime(timestamp) {
  const date = new Date(timestamp);
  if (!timestamp || Number.isNaN(date.getTime())) return "방금 전";

  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}

function CommunityActivityList({ emptyMessage, error, isLoading, items, onOpen, type }) {
  if (isLoading) return <p className="empty-text">커뮤니티 활동을 불러오는 중입니다.</p>;
  if (error) return <p className="empty-text" style={{ color: "#d9365b" }}>{error}</p>;
  if (!items.length) return <p className="empty-text">{emptyMessage}</p>;

  return items.map((item) => {
    const target =
      type === "post"
        ? { postId: item.id, source: "supabase" }
        : { commentId: item.id, postId: item.postId, source: item.source };
    const openActivity = () => {
      if (target.postId) onOpen?.(target);
    };

    return (
      <div
        aria-label={type === "post" ? `${item.title} 글로 이동` : `${item.postTitle} 댓글로 이동`}
        className="mypage-card"
        key={item.id}
        onClick={openActivity}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") openActivity();
        }}
        role="button"
        style={{ cursor: target.postId ? "pointer" : "default" }}
        tabIndex={target.postId ? 0 : -1}
      >
        <div className="mypage-card-info">
          <span className="mypage-status-badge">{type === "post" ? item.category : item.postCategory}</span>
          <h5>{type === "post" ? item.title : item.postTitle}</h5>
          <p>
            {type === "post" ? "작성한 글" : `댓글: ${item.content}`} · {formatCommunityActivityTime(item.created_at)}
          </p>
        </div>
        <span style={{ color: "#d9365b", fontSize: "12px", fontWeight: 800 }}>보러가기 ›</span>
      </div>
    );
  });
}

function ActivityCard({ item, badge, isHost, actionLabel, onAction }) {
  return (
    <div className="mypage-card">
      <div className="mypage-card-info">
        <span className={`mypage-status-badge ${isHost ? "host" : ""}`}>{badge}</span>
        <h5>{item.title}</h5>
        <p>
          📅 {item.date || "일정 협의"} | 📍 {item.location || "장소 협의"}
        </p>
      </div>
      <button type="button" className={`mypage-action-btn ${isHost ? "host" : ""}`} onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}

function ProfileEditModal({ currentUser, profile, onClose, onProfileUpdated }) {
  const imageInputRef = useRef(null);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [email, setEmail] = useState(currentUser.email || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("프로필 사진은 이미지 파일만 등록할 수 있습니다.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setErrorMessage("프로필 사진은 1MB 이하의 파일로 선택해주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result));
    reader.onerror = () => setErrorMessage("사진을 읽지 못했습니다. 다시 선택해주세요.");
    reader.readAsDataURL(file);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      setErrorMessage("닉네임은 2~20자로 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    const savedAvatarUrl = avatarUrl || getDefaultAvatarUrl(`${currentUser.id}-${trimmedName}`);

    try {
      const { data: savedProfile, error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: currentUser.id,
            display_name: trimmedName,
            avatar_url: savedAvatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )
        .select("display_name, avatar_url")
        .single();
      if (profileError) throw profileError;

      const userUpdate = {
        data: { nickname: trimmedName, avatar_url: savedAvatarUrl },
      };
      if (trimmedEmail && trimmedEmail !== currentUser.email) userUpdate.email = trimmedEmail;
      const { error: authError } = await supabase.auth.updateUser(userUpdate);
      if (authError) throw authError;

      onProfileUpdated(savedProfile);
      setSuccessMessage(
        trimmedEmail !== currentUser.email
          ? "프로필을 저장했습니다. 새 이메일 인증을 완료해주세요."
          : "프로필을 저장했습니다.",
      );
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      setErrorMessage(error.message || "프로필을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10001 }}>
      <form
        className="mypage-modal-content profile-edit-dialog"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSave}
        style={{ maxWidth: "480px" }}
      >
        <div className="modal-header">
          <h3>프로필 편집</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="profile-edit-avatar-row">
          <img src={avatarUrl} alt="선택한 프로필" className="profile-edit-avatar" />
          <div>
            <strong>{displayName || "덕친"}</strong>
            <p>채팅방과 톡함에 표시됩니다.</p>
            <div className="profile-edit-avatar-actions">
              <button type="button" onClick={() => imageInputRef.current?.click()}>
                사진 선택
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setAvatarUrl(getDefaultAvatarUrl(`${currentUser.id}-${displayName || "덕친"}`))}
              >
                기본 이미지
              </button>
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} hidden />
            <small>JPG, PNG 등 1MB 이하</small>
          </div>
        </div>

        <div className="profile-edit-form">
          <label htmlFor="profile-nickname">닉네임</label>
          <input
            id="profile-nickname"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            minLength="2"
            maxLength="20"
            required
          />
          <label htmlFor="profile-email">이메일</label>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <small style={{ color: "#888" }}>이메일 변경 시 새 주소의 인증 절차가 필요합니다.</small>
          {errorMessage && <p className="profile-form-message error">{errorMessage}</p>}
          {successMessage && <p className="profile-form-message success">{successMessage}</p>}
          <button className="profile-save-button" type="submit" disabled={isSaving}>
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useRef, useState } from "react";
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
}) {
  const [activeTab, setActiveTab] = useState("applied");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const currentItems = {
    applied: appliedPosts,
    hosted: hostedPosts,
    liked: bookmarks,
  };

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

import { useState } from "react";
import { getDefaultAvatarUrl } from "../profileUtils";
import { supabase } from "../supabase";

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  // 구글 로그인 함수 (매번 계정 선택 창이 뜨도록 prompt 옵션 추가)
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: "select_account", // 🌟 이 옵션 덕분에 다른 구글 계정으로도 로그인할 수 있습니다!
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }
  };

  // 이메일 로그인/회원가입 함수
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (isSignup) {
      const trimmedName = displayName.trim();
      if (trimmedName.length < 2 || trimmedName.length > 20) {
        setErrorMsg("닉네임은 2~20자로 입력해주세요.");
        return;
      }
      if (password.length < 8) {
        setErrorMsg("비밀번호는 8자 이상으로 설정해주세요.");
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMsg("비밀번호 확인이 일치하지 않습니다.");
        return;
      }
      if (!agreedToTerms) {
        setErrorMsg("서비스 이용 약관에 동의해주세요.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            nickname: trimmedName,
            avatar_url: getDefaultAvatarUrl(`${email}-${trimmedName}`),
          },
        },
      });
      if (error) {
        if (
          error.code === "user_already_exists" ||
          error.message.toLowerCase().includes("already registered")
        ) {
          setIsSignup(false);
          setPassword("");
          setPasswordConfirm("");
          setErrorMsg(
            "이미 가입된 이메일입니다. 기존 비밀번호로 로그인하거나, 구글로 가입했다면 ‘구글로 시작하기’를 이용해주세요.",
          );
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setSuccessMsg(
          data.session
            ? "회원가입이 완료되었습니다. 환영합니다!"
            : "인증 메일을 보냈습니다. 이메일 인증 후 로그인해주세요.",
        );
        setPassword("");
        setPasswordConfirm("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        onClose();
      }
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "400px",
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: "bold",
              color: "#222",
            }}
          >
            {isSignup ? "회원가입" : "로그인"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              color: "#888",
            }}
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              background: "#fff5f5",
              color: "#ff4b72",
              padding: "10px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "15px",
            }}
          >
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div
            style={{
              background: "#ecfdf5",
              color: "#047857",
              padding: "10px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "15px",
              lineHeight: 1.5,
            }}
          >
            {successMsg}
          </div>
        )}

        {/* 구글 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            background: "white",
            color: "#333",
            border: "1px solid #ddd",
            padding: "14px",
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "20px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        >
          <span style={{ fontSize: "18px" }}>🌐</span> 구글로 시작하기
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            textAlign: "center",
            color: "#aaa",
            margin: "20px 0",
            fontSize: "13px",
          }}
        >
          <div style={{ flex: 1, borderBottom: "1px solid #eee" }}></div>
          <span style={{ padding: "0 12px" }}>또는 이메일</span>
          <div style={{ flex: 1, borderBottom: "1px solid #eee" }}></div>
        </div>

        <form
          onSubmit={handleEmailAuth}
          autoComplete="off"
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          {isSignup && (
            <input
              type="text"
              name="signup-nickname"
              autoComplete="nickname"
              placeholder="닉네임 (2~20자)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              minLength="2"
              maxLength="20"
              required
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "14px",
                outline: "none",
                background: "#f9f9f9",
              }}
            />
          )}
          <input
            type="email"
            name={isSignup ? "signup-email" : "login-email"}
            autoComplete={isSignup ? "off" : "username"}
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              fontSize: "14px",
              outline: "none",
              background: "#f9f9f9",
            }}
          />
          <input
            type="password"
            name={isSignup ? "signup-password" : "login-password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={isSignup ? "비밀번호 (8자 이상)" : "비밀번호"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              fontSize: "14px",
              outline: "none",
              background: "#f9f9f9",
            }}
          />
          {isSignup && (
            <>
              <input
                type="password"
                name="signup-password-confirm"
                autoComplete="new-password"
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  outline: "none",
                  background: "#f9f9f9",
                }}
              />
              <label
                style={{
                  color: "#666",
                  cursor: "pointer",
                  display: "flex",
                  fontSize: "13px",
                  gap: "8px",
                  lineHeight: 1.4,
                }}
              >
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                서비스 이용 약관 및 개인정보 처리방침에 동의합니다.
              </label>
            </>
          )}
          <button
            type="submit"
            style={{
              background: "#ff4b72",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "5px",
            }}
          >
            {isSignup ? "가입하기" : "로그인"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          {isSignup ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setErrorMsg("");
              setSuccessMsg("");
              setEmail("");
              setDisplayName("");
              setPassword("");
              setPasswordConfirm("");
              setAgreedToTerms(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#ff4b72",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "5px",
              padding: 0,
            }}
          >
            {isSignup ? "로그인하기" : "회원가입하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

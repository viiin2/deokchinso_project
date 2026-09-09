import React, { useState } from "react";
import { supabase } from "../supabase";

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        alert("회원가입 확인 메일이 발송되었습니다. 이메일을 확인해주세요!");
        onClose();
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
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <input
            type="email"
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
            placeholder="비밀번호"
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
          <span
            onClick={() => setIsSignup(!isSignup)}
            style={{
              color: "#ff4b72",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "5px",
            }}
          >
            {isSignup ? "로그인하기" : "회원가입하기"}
          </span>
        </div>
      </div>
    </div>
  );
}

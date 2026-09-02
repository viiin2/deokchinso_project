import React from "react";

export default function GuidePage() {
  return (
    <div className="guide-container">
      {/* 📍 헤더 영역 완벽한 중앙 정렬 구조로 수정 */}
      <div className="guide-header">
        <span className="guide-badge">안심 서비스 가이드</span>
        <h2 className="main-title">처음 오셨나요? 덕친소 이용 가이드</h2>
        <p className="sub-title">
          모든 팬들이 안전하고 행복하게 덕질 메이트를 만날 수 있는
          가이드라인입니다.
        </p>
      </div>

      {/* 3단계 이용 방법 */}
      <div className="guide-step-section">
        <h3 className="guide-section-title">✨ 동행 매칭 3단계 이용법</h3>
        <div className="guide-step-grid">
          <div className="guide-step-card">
            <div className="step-number">01</div>
            <h4>동행 탐색 및 조건 설정</h4>
            <p>
              메인 검색창에서 원하는 지역, 장르, 날짜를 선택하거나 실시간 모집
              중인 방을 구경해보세요.
            </p>
          </div>
          <div className="guide-step-card">
            <div className="step-number">02</div>
            <h4>실시간 톡 대화 및 약속</h4>
            <p>
              마음에 드는 방을 누르면 1:1 덕친소 톡이 열립니다. 템플릿으로 만날
              장소와 시간을 확정 지으세요.
            </p>
          </div>
          <div className="guide-step-card">
            <div className="step-number">03</div>
            <h4>안전 직관 및 매너 후기</h4>
            <p>
              즐겁게 덕질을 마친 뒤 서로에게 매너 온도를 남겨주세요. 신뢰도 높은
              생태계를 함께 만듭니다.
            </p>
          </div>
        </div>
      </div>

      {/* 엄격한 안심 규칙 */}
      <div className="guide-rules-section">
        <h3 className="guide-section-title">🛡️ 덕친소 3대 안심 필수 규칙</h3>
        <div className="guide-rules-grid">
          <div className="rule-card">
            <div className="rule-icon">🚨</div>
            <div>
              <h4>1. 휴대폰 본인 신원 인증 필수</h4>
              <p>
                안전한 만남을 위해 모든 이용자는 가입 시 본인 인증을 거치며,
                인증되지 않은 계정은 매칭이 제한됩니다.
              </p>
            </div>
          </div>
          <div className="rule-card">
            <div className="rule-icon">🚫</div>
            <div>
              <h4>2. 암표 거래 및 과도한 금전 요구 금지</h4>
              <p>
                원가 이상의 티켓 암표 거래, 대리 티켓팅 사기, 금전적 요구는 발견
                즉시 영구 영구 정지 조치됩니다.
              </p>
            </div>
          </div>
          <div className="rule-card">
            <div className="rule-icon">💬</div>
            <div>
              <h4>3. 앱 내 안전 톡(Talk) 사용 권장</h4>
              <p>
                개인 연락처(전화번호 등)는 서로 신뢰가 쌓인 뒤에 공유하시고,
                가급적 덕친소 안심 대화창을 이용해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

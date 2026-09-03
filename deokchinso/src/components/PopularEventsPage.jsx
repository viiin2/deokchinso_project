import React from "react";

export default function PopularEventsPage({ onOpenHostModal }) {
  const popularEvents = [
    {
      id: 1,
      rank: "TOP 1",
      category: "애니메이션",
      fire: "🔥 128명 동행 구하는 중",
      title: "코믹월드 2026 (서울)",
      date: "5월 25일 ~ 26일",
      location: "일산 킨텍스",
      views: "8,900회",
      image:
        "https://images.unsplash.com/photo-1612444530582-fc66183b16f7?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 2,
      rank: "TOP 2",
      category: "게임/e스포츠",
      fire: "🔥 95명 동행 구하는 중",
      title: "G-STAR 2026",
      date: "11월 14일 ~ 17일",
      location: "부산 벡스코",
      views: "6,200회",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 3,
      rank: "TOP 3",
      category: "뮤지컬",
      fire: "🔥 84명 동행 구하는 중",
      title: "뮤지컬 <데스노트> 서울 앵콜",
      date: "8월 2일 ~ 4일",
      location: "예술의전당 대극장",
      views: "7,600회",
      image:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 4,
      rank: "TOP 4",
      category: "K-POP",
      fire: "🔥 72명 동행 구하는 중",
      title: "아이유(IU) 2026 월드투어 콘서트",
      date: "9월 12일 ~ 13일",
      location: "상암 월드컵경기장",
      views: "5,400회",
      image:
        "https://img.sbs.co.kr/newsnet/etv/upload/2023/08/16/30000868871_500.jpg", // 🌟 확실한 콘서트 사진으로 교체!
    },
    {
      id: 5,
      rank: "TOP 5",
      category: "스포츠",
      fire: "🔥 65명 동행 구하는 중",
      title: "T1 vs GEN.G 결승 직관",
      date: "8월 30일 (일)",
      location: "잠실 KSPO DOME",
      views: "4,200회",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 6,
      rank: "TOP 6",
      category: "코스프레",
      fire: "🔥 58명 동행 구하는 중",
      title: "AGF 2026 애니메이션 페스티벌",
      date: "12월 7일 ~ 8일",
      location: "일산 킨텍스 제1전시장",
      views: "3,800회",
      image:
        "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?q=80&w=600&auto=format&fit=crop", // 🌟 확실한 화려한 조명 사진으로 교체!
    },
  ];

  return (
    <div className="popular-page-container">
      <div className="popular-header">
        <div className="header-subtitle">🔥 실시간 동행 랭킹</div>
        <h2>현재 가장 동행을 많이 구하는 이벤트</h2>
        <p>
          팬들이 직접 등록하고 참여 중인 동행 모집 수를 실시간으로 집계한 인기
          순위입니다.
        </p>
      </div>

      <div className="popular-grid">
        {popularEvents.map((event) => (
          <div className="popular-card" key={event.id}>
            <div className="popular-image-wrapper">
              <img src={event.image} alt={event.title} />
              <div className="popular-rank">{event.rank}</div>
            </div>

            <div className="popular-info">
              <div className="popular-tags">
                <span className="tag-category">{event.category}</span>
                <span className="tag-fire">{event.fire}</span>
              </div>
              <h3 className="popular-title">{event.title}</h3>
              <p className="popular-detail">📅 {event.date}</p>
              <p className="popular-detail">📍 {event.location}</p>

              <div className="popular-footer">
                <span className="views">👁 조회수 {event.views}</span>
                <button className="join-btn" onClick={onOpenHostModal}>
                  나도 동행 구하기 →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

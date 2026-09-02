import { useState } from "react";

export default function PopularEventsPage() {
  // 동행 구하는 인원수(seekingCount)를 기준으로 하는 이벤트 데이터
  const [events, setEvents] = useState([
    {
      id: 1,
      rank: 1,
      title: "코믹월드 2026 (서울)",
      category: "서브컬처",
      date: "5월 25일 ~ 26일",
      location: "일산 킨텍스",
      seekingCount: 128,
      views: 8900,
      img: "https://picsum.photos/seed/comic/800/500",
    },
    {
      id: 2,
      rank: 2,
      title: "G-STAR 2026",
      category: "게임/e스포츠",
      date: "11월 14일 ~ 17일",
      location: "부산 벡스코",
      seekingCount: 95,
      views: 6200,
      img: "https://picsum.photos/seed/gstar/800/500",
    },
    {
      id: 3,
      rank: 3,
      title: "인천 펜타포트 락 페스티벌",
      category: "페스티벌",
      date: "8월 2일 ~ 4일",
      location: "인천 송도 달빛축제공원",
      seekingCount: 84,
      views: 7600,
      img: "https://picsum.photos/seed/rock/800/500",
    },
    {
      id: 4,
      rank: 4,
      title: "NCT DREAM 월드투어 앙코르",
      category: "K-POP",
      date: "6월 10일 (토)",
      location: "고척 스카이돔",
      seekingCount: 62,
      views: 5400,
      img: "https://picsum.photos/seed/kpop/800/500",
    },
  ]);

  // 동행 구하기 버튼 클릭 시 해당 이벤트의 동행 구인 인원이 1명 늘어나면서 실시간 순위 재정렬
  const handleJoinRequest = (id) => {
    const updated = events.map((ev) => {
      if (ev.id === id) {
        return { ...ev, seekingCount: ev.seekingCount + 1 };
      }
      return ev;
    });

    // 동행 구하는 인원수가 많은 순서대로 실시간 재정렬 후 순위(rank) 재부여
    updated.sort((a, b) => b.seekingCount - a.seekingCount);
    const ranked = updated.map((ev, index) => ({ ...ev, rank: index + 1 }));
    setEvents(ranked);
    alert("이벤트 동행 구인 신청이 완료되었습니다! 랭킹에 반영되었습니다. 🔥");
  };

  return (
    <div className="popular-events-container">
      <div className="popular-header">
        <div>
          <span className="popular-badge">🔥 실시간 동행 랭킹</span>
          <h2 className="main-title">현재 가장 동행을 많이 구하는 이벤트</h2>
          <p className="sub-title">
            팬들이 직접 등록하고 참여 중인 동행 모집 수를 실시간으로 집계한 인기
            순위입니다.
          </p>
        </div>
      </div>

      <div className="popular-events-grid">
        {events.map((ev) => (
          <div className="popular-card" key={ev.id}>
            <div className="popular-img-box">
              <img src={ev.img} alt={ev.title} className="popular-img" />
              <span className={`rank-badge rank-${ev.rank}`}>
                TOP {ev.rank}
              </span>
            </div>
            <div className="popular-content">
              <div className="popular-meta">
                <span className="category">{ev.category}</span>
                <span className="seeking-badge">
                  🔥 {ev.seekingCount}명 동행 구하는 중
                </span>
              </div>
              <h3 className="popular-title">{ev.title}</h3>
              <p className="popular-detail">📅 {ev.date}</p>
              <p className="popular-detail">📍 {ev.location}</p>
              <div className="popular-footer">
                <span className="view-count">
                  👁️ 조회수 {ev.views.toLocaleString()}회
                </span>
                <button
                  className="companion-link-btn"
                  onClick={() => handleJoinRequest(ev.id)}
                >
                  나도 동행 구하기 &rarr;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

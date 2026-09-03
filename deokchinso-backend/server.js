const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let posts = [];
let postIdCounter = 1;
let messages = [];
let msgIdCounter = 1;

// 🌟 장르별 5개씩 총 35개의 빵빵한 커뮤니티 더미 데이터
let communityPosts = [
  // --- K-POP (5개) ---
  {
    id: 1,
    category: "K-POP",
    title: "이번 콘서트 스탠딩 번호 30번대인데 체력 관리 어떻게 하시나요?",
    content: "스탠딩 처음이라 너무 떨려요...",
    author: "볼이",
    views: 342,
    time: "10분 전",
    comments: ["물 꼭 챙기세요!", "편한 신발 필수입니다."],
  },
  {
    id: 2,
    category: "K-POP",
    title: "덕질하면서 모은 포토카드 보관함 추천 좀 해주세요!",
    content: "바인더 터질 것 같아요...",
    author: "포카리",
    views: 820,
    time: "3시간 전",
    comments: [],
  },
  {
    id: 3,
    category: "K-POP",
    title: "컴백 쇼케이스 티켓팅 성공하신 분 계신가요?",
    content: "진짜 피바람이었네요ㅠㅠ",
    author: "별빛",
    views: 412,
    time: "1일 전",
    comments: ["양도벤치만 봅니다..."],
  },
  {
    id: 4,
    category: "K-POP",
    title: "응원봉 커스텀 파츠 어디서 사시나요?",
    content: "예쁜 꾸미기 팁 공유 부탁드려요!",
    author: "체리",
    views: 156,
    time: "2일 전",
    comments: ["소품샵 추천이요!"],
  },
  {
    id: 5,
    category: "K-POP",
    title: "음악방송 사전녹화 가보신 분 후기 좀요!",
    content: "새벽에 가야 한다던데 힘들까요?",
    author: "멜로디",
    views: 630,
    time: "3일 전",
    comments: ["피곤하지만 진짜 가까워요!"],
  },

  // --- 애니메이션 (5개) ---
  {
    id: 6,
    category: "애니메이션",
    title: "홍대 카페에서 하는 생일 카페 가신 분 계신가요? 특전 예쁘나요?",
    content: "내일 갈 예정인데 궁금하네요.",
    author: "누들",
    views: 512,
    time: "1시간 전",
    comments: ["오픈런 해야 특전 받을 수 있어요 ㅠㅠ"],
  },
  {
    id: 7,
    category: "애니메이션",
    title: "이번 극장판 애니메이션 3회차 찍고 왔습니다",
    content: "여운이 가시질 않네요...",
    author: "오덕후",
    views: 920,
    time: "4시간 전",
    comments: ["특전 무엇 받았나요?"],
  },
  {
    id: 8,
    category: "애니메이션",
    title: "넷플릭스 신작 애니 추천해주실 분?",
    content: "판타지나 액션물 좋아합니다!",
    author: "감자",
    views: 245,
    time: "12시간 전",
    comments: ["이번 분기 명작 추천합니다."],
  },
  {
    id: 9,
    category: "애니메이션",
    title: "굿즈존 방 꾸미기 완료했습니다 (사진 있음)",
    content: "피규어 아크릴 스탠드 정리 팁이에요",
    author: "덕밍아웃",
    views: 1420,
    time: "1일 전",
    comments: ["와 너무 깔끔하다!"],
  },
  {
    id: 10,
    category: "애니메이션",
    title: "성우진 팬미팅 티켓 오픈 언제인지 아시나요?",
    content: "정보처가 마땅히 없네요 ㅠㅠ",
    author: "미소",
    views: 310,
    time: "2일 전",
    comments: ["다음 주 월요일이래요!"],
  },

  // --- 게임 (5개) ---
  {
    id: 11,
    category: "게임",
    title: "롤드컵 결승 직관 가시는 분들 팁 공유해요",
    content: "이번에 처음 가는데 꿀팁 있을까요?",
    author: "티원우승",
    views: 1024,
    time: "5시간 전",
    comments: ["응원 도구 꼭 챙기세요!"],
  },
  {
    id: 12,
    category: "게임",
    title: "이번에 새로 나온 오픈월드 RPG 파티 모 모집합니다",
    content: "같이 하실 분 구해요~ 마이크 필수!",
    author: "고양이",
    views: 330,
    time: "6시간 전",
    comments: ["저 같이 하고 싶어요!"],
  },
  {
    id: 13,
    category: "게임",
    title: "게임 콜라보 카페 예약 성공했습니다 ㅋㅋ",
    content: "특전 메뉴 다 먹어보고 올게요",
    author: "푸딩",
    views: 480,
    time: "18시간 전",
    comments: ["부럽습니다 ㅠㅠ"],
  },
  {
    id: 14,
    category: "게임",
    title: "지스타 2026 부스 어디가 제일 기대되시나요?",
    content: "올해도 신작 게임 대박이네요",
    author: "플레이어",
    views: 760,
    time: "1일 전",
    comments: ["넥슨 부스 꼭 갈 겁니다."],
  },
  {
    id: 15,
    category: "게임",
    title: "스팀 여름 할인 장바구니 공유합니다",
    content: "지갑이 버티질 못하네요",
    author: "간장",
    views: 512,
    time: "2일 전",
    comments: ["살 게 너무 많아요"],
  },

  // --- 만화/웹툰 (5개) ---
  {
    id: 16,
    category: "만화/웹툰",
    title: "요즘 로판 웹툰 추천 부탁드립니다",
    content: "사이다 남주나 여주 나오는 걸로요!",
    author: "웹툰독서가",
    views: 410,
    time: "3시간 전",
    comments: ["이 작품 꼭 보세요 인생작입니다."],
  },
  {
    id: 17,
    category: "만화/웹툰",
    title: "단행본 특전 한정판 예약 전쟁 성공했다!",
    content: "박스 세트 실물 지리네요",
    author: "책벌레",
    views: 615,
    time: "7시간 전",
    comments: ["축하드려요 품절 대박이었는데"],
  },
  {
    id: 18,
    category: "만화/웹툰",
    title: "웹툰 작가님 사인회 다녀온 후기",
    content: "실물 영접하고 울 뻔했습니다...",
    author: "성덕",
    views: 890,
    time: "1일 전",
    comments: ["부러워서 눈물이 납니다"],
  },
  {
    id: 19,
    category: "만화/웹툰",
    title: "이번 주 웹툰 전개 미쳤네요 진심",
    content: "작가님 콘티 연출 천재인가요",
    author: "지나가던독자",
    views: 340,
    time: "1일 전",
    comments: ["다음 주 언제 기다리냐고요 ㅠㅠ"],
  },
  {
    id: 20,
    category: "만화/웹툰",
    title: "순정 만화 명작 추천 월드컵 해봅시다",
    content: "여러분들의 최애작은 무엇인가요?",
    author: "순정파",
    views: 220,
    time: "2일 전",
    comments: ["역시 구세대 명작들이죠"],
  },

  // --- 뮤지컬 (5개) ---
  {
    id: 21,
    category: "뮤지컬",
    title: "뮤지컬 회전목마(N차 관람) 돌고 계신 분?",
    content: "오늘 캐스팅 배우님 연기 미쳤어요",
    author: "관람러",
    views: 450,
    time: "4시간 전",
    comments: ["오늘 레전드 찍었나 보네요!"],
  },
  {
    id: 22,
    category: "뮤지컬",
    title: "오페라글라스(오글) 추천 좀 해주세요",
    content: "예술의전당 3층인데 어떤 걸 사야 할까요?",
    author: "초보관객",
    views: 670,
    time: "9시간 전",
    comments: ["배율 10배 이상은 되어야 합니다."],
  },
  {
    id: 23,
    category: "뮤지컬",
    title: "블루스퀘어 시야 좋은 자리 팁",
    content: "1층 앞쪽이랑 2층 초입 중에 어디가 나을까요?",
    author: "티켓오피스",
    views: 530,
    time: "1일 전",
    comments: ["단차 참고하세요!"],
  },
  {
    id: 24,
    category: "뮤지컬",
    title: "커튼콜데이 날짜 맞춰서 예매했습니다",
    content: "사진 예쁘게 찍고 오고 싶어요",
    author: "찰칵",
    views: 380,
    time: "2일 전",
    comments: ["망원렌즈 필수입니다!"],
  },
  {
    id: 25,
    category: "뮤지컬",
    title: "뮤지컬 OST 음원 발매 언제 되나요?",
    content: "귀에 계속 맴돌아서 현기증 나요",
    author: "멜로디언",
    views: 290,
    time: "3일 전",
    comments: ["스튜디오 버전 시급합니다"],
  },

  // --- 스포츠 (5개) ---
  {
    id: 26,
    category: "스포츠",
    title: "야구장 응원석 직관 가시는 분들 치킨 꿀팁?",
    content: "어느 브랜드가 제일 포장하기 편한가요",
    author: "야구팬",
    views: 710,
    time: "2시간 전",
    comments: ["야구장 근처 닭강정이 최고죠"],
  },
  {
    id: 27,
    category: "스포츠",
    title: "축구 국가대표 평가전 티켓 예매 대기 뚫었습니다",
    content: "붉은악마 응원석 폼 미쳤다",
    author: "축구치킨",
    views: 880,
    time: "6시간 전",
    comments: ["직관 승요 기원합니다!"],
  },
  {
    id: 28,
    category: "스포츠",
    title: "배구 경기 직관 처음인데 룰 알아가야 하나요?",
    content: "응원 열기가 엄청나다던데 기대됩니다",
    author: "배구입문자",
    views: 320,
    time: "1일 전",
    comments: "그냥 가셔도 응원가 신나요!",
  },
  {
    id: 29,
    category: "스포츠",
    title: "농구 유니폼 마킹 누구로 할지 고민입니다",
    content: "에이스 선수로 할까요?",
    author: "농구영신",
    views: 410,
    time: "2일 전",
    comments: ["역시 홈 유니폼이 예쁩니다"],
  },
  {
    id: 30,
    category: "스포츠",
    title: "직관 승률 높이는 나만의 징후",
    content: "이 유니폼만 입으면 이기네요 ㅋㅋ",
    author: "승리의요정",
    views: 590,
    time: "3일 전",
    comments: ["그 유니폼 저한테 파세요"],
  },

  // --- 코스프레 (5개) ---
  {
    id: 31,
    category: "코스프레",
    title: "행사장에서 코스어 분들 사진 요청 매너 정리",
    content: "반드시 먼저 정중하게 물어보기!",
    author: "코스어",
    views: 950,
    time: "1시간 전",
    comments: ["기본 매너 필수죠!"],
  },
  {
    id: 32,
    category: "코스프레",
    title: "의상 제작 소품샵 추천 퀄리티 좋은 곳",
    content: "다음 달 행사 준비 중입니다",
    author: "금손",
    views: 620,
    time: "5시간 전",
    comments: ["여권 가발샵 추천해요"],
  },
  {
    id: 33,
    category: "코스프레",
    title: "무대 행사 코스프레 팀원 구합니다 (0/4)",
    content: "주말마다 연습 가능하신 분 우대",
    author: "팀장님",
    views: 410,
    time: "1일 전",
    comments: ["어느 애니 팀인가요?"],
  },
  {
    id: 34,
    category: "코스프레",
    title: "메이크업 스킨톤 커버 팁 공유",
    content: "캐릭터 특유의 눈매 살리는 법",
    author: "메이크업러",
    views: 530,
    time: "2일 전",
    comments: ["테이프 1급 비밀입니다."],
  },
  {
    id: 35,
    category: "코스프레",
    title: "행사 끝나고 코스옷 세탁 어떻게 하시나요?",
    content: "원단이 망가지지 않게 세탁하는 법",
    author: "세탁왕",
    views: 390,
    time: "3일 전",
    comments: ["무조건 손세탁 해야 합니다!"],
  },
];

let commIdCounter = 36;

// ==========================================
// API 엔드포인트들
// ==========================================
app.get("/api/posts", (req, res) => res.json(posts));
app.post("/api/posts", (req, res) => {
  const newPost = { id: postIdCounter++, ...req.body, views: 0, likes: 0 };
  posts.unshift(newPost);
  res.status(201).json(newPost);
});

app.get("/api/community", (req, res) => res.json(communityPosts));

app.post("/api/community", (req, res) => {
  const newComm = {
    id: commIdCounter++,
    title: req.body.title,
    content: req.body.content || "",
    category: req.body.category || "K-POP",
    author: req.body.author || "덕후유저",
    views: 0,
    comments: [],
    time: "방금 전",
  };
  communityPosts.unshift(newComm);
  res.status(201).json(newComm);
});

app.post("/api/community/:id/view", (req, res) => {
  const target = communityPosts.find((p) => p.id === parseInt(req.params.id));
  if (target) {
    target.views += 1;
    res.json(target);
  } else {
    res.status(404).send("Not found");
  }
});

app.post("/api/community/:id/comment", (req, res) => {
  const target = communityPosts.find((p) => p.id === parseInt(req.params.id));
  if (target) {
    target.comments.push(req.body.text);
    res.json(target);
  } else {
    res.status(404).send("Not found");
  }
});

app.post("/api/messages", (req, res) => {
  const newMessage = {
    id: msgIdCounter++,
    ...req.body,
    timestamp: new Date().toISOString(),
  };
  messages.push(newMessage);
  res.status(201).json(newMessage);
});

app.listen(PORT, () => {
  console.log(
    `🚀 덕친소 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`,
  );
});

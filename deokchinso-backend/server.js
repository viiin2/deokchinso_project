const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// 미들웨어 설정 (🌟 limit 옵션을 추가해서 용량 제한을 50MB까지 넉넉하게 풀어줍니다!)
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 📂 메모리 임시 저장소 (서버를 껐다 켜면 초기화됩니다)
let posts = [
  {
    id: 1,
    region: "서울",
    genre: "ani",
    date: "이번 주말",
    title: "서울 애니메이션 전시회 같이 가실 분!",
    content: "코엑스 전시회 혼자 가기 뻘쭘해서 동행 구합니다~",
  },
  {
    id: 2,
    region: "부산",
    genre: "band",
    date: "다음 주",
    title: "부산 인디 밴드 콘서트 동행 구해요",
    content: "공연 보고 같이 밥 먹을 분 찾아요.",
  },
];

// 🟢 1. 게시글 목록 불러오기 API (프론트엔드의 fetchPosts 용도)
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// 🟢 2. 새 게시글 작성하기 API (프론트엔드의 HostModal 용도)
app.post("/api/posts", (req, res) => {
  const newPost = {
    id: posts.length > 0 ? posts[posts.length - 1].id + 1 : 1, // 간단한 ID 자동 증가
    ...req.body, // 프론트엔드에서 보낸 데이터
  };

  posts.push(newPost); // 배열(메모리)에 새 글 저장
  console.log("새로운 글이 등록되었습니다:", newPost);

  res.status(201).json(newPost); // 성공 응답 보내기
});

// 서버 실행
app.listen(PORT, () => {
  console.log(
    `🚀 덕친소 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`,
  );
});

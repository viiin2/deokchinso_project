const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_PATH = process.env.DATABASE_PATH || "./deokchinso.db";

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 1. 로컬 SQLite 데이터베이스 파일 연결 (프로젝트 폴더에 deokchinso.db 파일이 생깁니다)
const db = new sqlite3.Database(DATABASE_PATH, (err) => {
  if (err) {
    console.error("❌ SQL DB 연결 실패:", err.message);
  } else {
    console.log("✅ 로컬 SQL 데이터베이스(SQLite) 연결 성공!");
    initDatabase(); // 테이블 생성 및 초기 더미데이터 세팅 함수 실행
  }
});

// 2. 테이블 생성 및 초기 더미 데이터 자동 세팅 (Pre-seeding)
function initDatabase() {
  db.serialize(() => {
    // 2-1. 동행 모집글 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        category TEXT,
        genre TEXT,
        date TEXT,
        location TEXT,
        region TEXT,
        author TEXT,
        author_avatar_url TEXT,
        author_user_id TEXT,
        tag TEXT,
        img TEXT,
        rating TEXT,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0
      )
    `);

    db.run("ALTER TABLE posts ADD COLUMN author_avatar_url TEXT", (err) => {
      if (!err) {
        console.log("모집글 테이블에 작성자 프로필 사진 컬럼을 추가했습니다.");
      } else if (!err.message.includes("duplicate column name")) {
        console.error("작성자 프로필 사진 컬럼 추가 실패:", err.message);
      }
    });

    db.run("ALTER TABLE posts ADD COLUMN author_user_id TEXT", (err) => {
      if (!err) {
        console.log("모집글 테이블에 작성자 계정 컬럼을 추가했습니다.");
      } else if (!err.message.includes("duplicate column name")) {
        console.error("작성자 계정 컬럼 추가 실패:", err.message);
      }
    });

    // 2-2. 커뮤니티 게시글 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS community (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        title TEXT,
        content TEXT,
        author TEXT,
        views INTEGER DEFAULT 0,
        time TEXT,
        comments TEXT -- JSON 배열 형태로 댓글 저장
      )
    `);

    // 2-3. 메시지(채팅) 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT,
        sender TEXT,
        text TEXT,
        timestamp TEXT
      )
    `);

    // 기존 DB에는 room_id가 없으므로, 이미 생성된 메시지 테이블도 보존한 채 확장합니다.
    db.run("ALTER TABLE messages ADD COLUMN room_id TEXT", (err) => {
      if (!err) {
        console.log("메시지 테이블에 room_id 컬럼을 추가했습니다.");
      } else if (!err.message.includes("duplicate column name")) {
        console.error("메시지 room_id 컬럼 추가 실패:", err.message);
      }
    });

    // 2-4. 모집글별 단체 채팅방과 참여자 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id TEXT PRIMARY KEY,
        post_id TEXT,
        title TEXT NOT NULL,
        room_type TEXT NOT NULL DEFAULT 'group',
        created_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS chat_room_members (
        room_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        member_name TEXT NOT NULL,
        joined_at TEXT NOT NULL,
        PRIMARY KEY (room_id, member_id)
      )
    `);

    // 🌟 커뮤니티 데이터가 비어있다면, 아까 그 35개 더미 데이터를 SQL에 자동 삽입!
    db.get("SELECT COUNT(*) as count FROM community", (err, row) => {
      if (row.count === 0) {
        console.log("✨ 35개의 커뮤니티 더미 데이터를 SQL에 적재 중...");

        const initialCommunity = [
          // K-POP (5개)
          [
            "K-POP",
            "이번 콘서트 스탠딩 번호 30번대인데 체력 관리 어떻게 하시나요?",
            "스탠딩 처음이라 너무 떨려요...",
            "볼이",
            342,
            "10분 전",
            JSON.stringify(["물 꼭 챙기세요!", "편한 신발 필수입니다."]),
          ],
          [
            "K-POP",
            "덕질하면서 모은 포토카드 보관함 추천 좀 해주세요!",
            "바인더 터질 것 같아요...",
            "포카리",
            820,
            "3시간 전",
            JSON.stringify([]),
          ],
          [
            "K-POP",
            "컴백 쇼케이스 티켓팅 성공하신 분 계신가요?",
            "진짜 피바람이었네요ㅠㅠ",
            "별빛",
            412,
            "1일 전",
            JSON.stringify(["양도벤치만 봅니다..."]),
          ],
          [
            "K-POP",
            "응원봉 커스텀 파츠 어디서 사시나요?",
            "예쁜 꾸미기 팁 공유 부탁드려요!",
            "체리",
            156,
            "2일 전",
            JSON.stringify(["소품샵 추천이요!"]),
          ],
          [
            "K-POP",
            "음악방송 사전녹화 가보신 분 후기 좀요!",
            "새벽에 가야 한다던데 힘들까요?",
            "멜로디",
            630,
            "3일 전",
            JSON.stringify(["피곤하지만 진짜 가까워요!"]),
          ],

          // 애니메이션 (5개)
          [
            "애니메이션",
            "홍대 카페에서 하는 생일 카페 가신 분 계신가요? 특전 예쁘나요?",
            "내일 갈 예정인데 궁금하네요.",
            "누들",
            512,
            "1시간 전",
            JSON.stringify(["오픈런 해야 특전 받을 수 있어요 ㅠㅠ"]),
          ],
          [
            "애니메이션",
            "이번 극장판 애니메이션 3회차 찍고 왔습니다",
            "여운이 가시질 않네요...",
            "오덕후",
            920,
            "4시간 전",
            JSON.stringify(["특전 무엇 받았나요?"]),
          ],
          [
            "애니메이션",
            "넷플릭스 신작 애니 추천해주실 분?",
            "판타지나 액션물 좋아합니다!",
            "감자",
            245,
            "12시간 전",
            JSON.stringify(["이번 분기 명작 추천합니다."]),
          ],
          [
            "애니메이션",
            "굿즈존 방 꾸미기 완료했습니다 (사진 있음)",
            "피규어 아크릴 스탠드 정리 팁이에요",
            "덕밍아웃",
            1420,
            "1일 전",
            JSON.stringify(["와 너무 깔끔하다!"]),
          ],
          [
            "애니메이션",
            "성우진 팬미팅 티켓 오픈 언제인지 아시나요?",
            "정보처가 마땅히 없네요 ㅠㅠ",
            "미소",
            310,
            "2일 전",
            JSON.stringify(["다음 주 월요일이래요!"]),
          ],

          // 게임 (5개)
          [
            "게임",
            "롤드컵 결승 직관 가시는 분들 팁 공유해요",
            "이번에 처음 가는데 꿀팁 있을까요?",
            "티원우승",
            1024,
            "5시간 전",
            JSON.stringify(["응원 도구 꼭 챙기세요!"]),
          ],
          [
            "게임",
            "이번에 새로 나온 오픈월드 RPG 파티 모 모집합니다",
            "같이 하실 분 구해요~ 마이크 필수!",
            "고양이",
            330,
            "6시간 전",
            JSON.stringify(["저 같이 하고 싶어요!"]),
          ],
          [
            "게임",
            "게임 콜라보 카페 예약 성공했습니다 ㅋㅋ",
            "특전 메뉴 다 먹어보고 올게요",
            "푸딩",
            480,
            "18시간 전",
            JSON.stringify(["부럽습니다 ㅠㅠ"]),
          ],
          [
            "게임",
            "지스타 2026 부스 어디가 제일 기대되시나요?",
            "올해도 신작 게임 대박이네요",
            "플레이어",
            760,
            "1일 전",
            JSON.stringify(["넥슨 부스 꼭 갈 겁니다."]),
          ],
          [
            "게임",
            "스팀 여름 할인 장바구니 공유합니다",
            "지갑이 버티질 못하네요",
            "간장",
            512,
            "2일 전",
            JSON.stringify(["살 게 너무 많아요"]),
          ],

          // 만화/웹툰 (5개)
          [
            "만화/웹툰",
            "요즘 로판 웹툰 추천 부탁드립니다",
            "사이다 남주나 여주 나오는 걸로요!",
            "웹툰독서가",
            410,
            "3시간 전",
            JSON.stringify(["이 작품 꼭 보세요 인생작입니다."]),
          ],
          [
            "만화/웹툰",
            "단행본 특전 한정판 예약 전쟁 성공했다!",
            "박스 세트 실물 지리네요",
            "책벌레",
            615,
            "7시간 전",
            JSON.stringify(["축하드려요 품절 대박이었는데"]),
          ],
          [
            "만화/웹툰",
            "웹툰 작가님 사인회 다녀온 후기",
            "실물 영접하고 울 뻔했습니다...",
            "성덕",
            890,
            "1일 전",
            JSON.stringify(["부러워서 눈물이 납니다"]),
          ],
          [
            "만화/웹툰",
            "이번 주 웹툰 전개 미쳤네요 진심",
            "작가님 콘티 연출 천재인가요",
            "지나가던독자",
            340,
            "1일 전",
            JSON.stringify(["다음 주 언제 기다리냐고요 ㅠㅠ"]),
          ],
          [
            "만화/웹툰",
            "순정 만화 명작 추천 월드컵 해봅시다",
            "여러분들의 최애작은 무엇인가요?",
            "순정파",
            220,
            "2일 전",
            JSON.stringify(["역시 구세대 명작들이죠"]),
          ],

          // 뮤지컬 (5개)
          [
            "뮤지컬",
            "뮤지컬 회전목마(N차 관람) 돌고 계신 분?",
            "오늘 캐스팅 배우님 연기 미쳤어요",
            "관람러",
            450,
            "4시간 전",
            JSON.stringify(["오늘 레전드 찍었나 보네요!"]),
          ],
          [
            "뮤지컬",
            "오페라글라스(오글) 추천 좀 해주세요",
            "예술의전당 3층인데 어떤 걸 사야 할까요?",
            "초보관객",
            670,
            "9시간 전",
            JSON.stringify(["배율 10배 이상은 되어야 합니다."]),
          ],
          [
            "뮤지컬",
            "블루스퀘어 시야 좋은 자리 팁",
            "1층 앞쪽이랑 2층 초입 중에 어디가 나을까요?",
            "티켓오피스",
            530,
            "1일 전",
            JSON.stringify(["단차 참고하세요!"]),
          ],
          [
            "뮤지컬",
            "커튼콜데이 날짜 맞춰서 예매했습니다",
            "사진 예쁘게 찍고 오고 싶어요",
            "찰칵",
            380,
            "2일 전",
            JSON.stringify(["망원렌즈 필수입니다!"]),
          ],
          [
            "뮤지컬",
            "뮤지컬 OST 음원 발매 언제 되나요?",
            "귀에 계속 맴돌아서 현기증 나요",
            "멜로디언",
            290,
            "3시간 전",
            JSON.stringify(["스튜디오 버전 시급합니다"]),
          ],

          // 스포츠 (5개)
          [
            "스포츠",
            "야구장 응원석 직관 가시는 분들 치킨 꿀팁?",
            "어느 브랜드가 제일 포장하기 편한가요",
            "야구팬",
            710,
            "2시간 전",
            JSON.stringify(["야구장 근처 닭강정이 최고죠"]),
          ],
          [
            "스포츠",
            "축구 국가대표 평가전 티켓 예매 대기 뚫었습니다",
            "붉은악마 응원석 폼 미쳤다",
            "축구치킨",
            880,
            "6시간 전",
            JSON.stringify(["직관 승요 기원합니다!"]),
          ],
          [
            "스포츠",
            "배구 경기 직관 처음인데 룰 알아가야 하나요?",
            "응원 열기가 엄청나다던데 기대됩니다",
            "배구입문자",
            320,
            "1일 전",
            JSON.stringify(["그냥 가셔도 응원가 신나요!"]),
          ],
          [
            "스포츠",
            "농구 유니폼 마킹 누구로 할지 고민입니다",
            "에이스 선수로 할까요?",
            "농구영신",
            410,
            "2일 전",
            JSON.stringify(["역시 홈 유니폼이 예쁩니다"]),
          ],
          [
            "스포츠",
            "직관 승률 높이는 나만의 징후",
            "이 유니폼만 입으면 이기네요 ㅋㅋ",
            "승리의요정",
            590,
            "3시간 전",
            JSON.stringify(["그 유니폼 저한테 파세요"]),
          ],

          // 코스프레 (5개)
          [
            "코스프레",
            "행사장에서 코스어 분들 사진 요청 매너 정리",
            "반드시 먼저 정중하게 물어보기!",
            "코스어",
            950,
            "1시간 전",
            JSON.stringify(["기본 매너 필수죠!"]),
          ],
          [
            "코스프레",
            "의상 제작 소품샵 추천 퀄리티 좋은 곳",
            "다음 달 행사 준비 중입니다",
            "금손",
            620,
            "5시간 전",
            JSON.stringify(["여권 가발샵 추천해요"]),
          ],
          [
            "코스프레",
            "무대 행사 코스프레 팀원 구합니다 (0/4)",
            "주말마다 연습 가능하신 분 우대",
            "팀장님",
            410,
            "1일 전",
            JSON.stringify(["어느 애니 팀인가요?"]),
          ],
          [
            "코스프레",
            "메이크업 스킨톤 커버 팁 공유",
            "캐릭터 특유의 눈매 살리는 법",
            "메이크업러",
            530,
            "2일 전",
            JSON.stringify(["테이프 1급 비밀입니다."]),
          ],
          [
            "코스프레",
            "행사 끝나고 코스옷 세탁 어떻게 하시나요?",
            "원단이 망가지지 않게 세탁하는 법",
            "세탁왕",
            390,
            "3시간 전",
            JSON.stringify(["무조건 손세탁 해야 합니다!"]),
          ],
        ];

        const stmt = db.prepare(
          "INSERT INTO community (category, title, content, author, views, time, comments) VALUES (?, ?, ?, ?, ?, ?, ?)",
        );
        initialCommunity.forEach((c) => stmt.run(c));
        stmt.finalize();
        console.log("✨ 35개 커뮤니티 더미 데이터 SQL 적재 완료!");
      }
    });
  });
}

// ==========================================
// API 엔드포인트들 (SQL 연동형)
// ==========================================

// 1. 동행 모집글 조회
app.get("/api/posts", (req, res) => {
  db.all("SELECT * FROM posts ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. 동행 모집글 작성
app.post("/api/posts", (req, res) => {
  const {
    title,
    category,
    genre,
    date,
    location,
    region,
    author,
    author_avatar_url: authorAvatarUrl,
    author_user_id: authorUserId,
    tag,
    img,
  } = req.body;
  const query = `INSERT INTO posts (title, category, genre, date, location, region, author, author_avatar_url, author_user_id, tag, img, rating, views, likes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`;

  db.run(
    query,
    [
      title,
      category,
      genre,
      date,
      location,
      region,
      author || "덕후",
      authorAvatarUrl || "",
      authorUserId || "",
      tag || "#동행",
      img || "https://picsum.photos/seed/new/300/200",
      "5.0",
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT * FROM posts WHERE id = ?", [this.lastID], (err, row) => {
        res.status(201).json(row);
      });
    },
  );
});

// 3. 커뮤니티 글 목록 조회 (댓글을 다시 배열로 변환해서 응답)
app.get("/api/community", (req, res) => {
  db.all("SELECT * FROM community ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const parsedRows = rows.map((row) => ({
      ...row,
      comments: JSON.parse(row.comments || "[]"),
    }));
    res.json(parsedRows);
  });
});

// 4. 커뮤니티 글 작성
app.post("/api/community", (req, res) => {
  const { title, content, category, author } = req.body;
  const query = `INSERT INTO community (category, title, content, author, views, time, comments) VALUES (?, ?, ?, ?, 0, '방금 전', ?)`;

  db.run(
    query,
    [
      category || "K-POP",
      title,
      content || "",
      author || "덕후유저",
      JSON.stringify([]),
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get(
        "SELECT * FROM community WHERE id = ?",
        [this.lastID],
        (err, row) => {
          res.status(201).json({
            ...row,
            comments: JSON.parse(row.comments || "[]"),
          });
        },
      );
    },
  );
});

// 5. 커뮤니티 조회수 증가
app.post("/api/community/:id/view", (req, res) => {
  const id = req.params.id;
  db.run(
    "UPDATE community SET views = views + 1 WHERE id = ?",
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT * FROM community WHERE id = ?", [id], (err, row) => {
        if (!row) return res.status(404).send("Not found");
        res.json({
          ...row,
          comments: JSON.parse(row.comments || "[]"),
        });
      });
    },
  );
});

// 6. 커뮤니티 댓글 달기
app.post("/api/community/:id/comment", (req, res) => {
  const id = req.params.id;
  const newCommentText = req.body.text;

  db.get("SELECT * FROM community WHERE id = ?", [id], (err, row) => {
    if (err || !row) return res.status(404).send("Not found");

    let comments = JSON.parse(row.comments || "[]");
    comments.push(newCommentText);

    db.run(
      "UPDATE community SET comments = ? WHERE id = ?",
      [JSON.stringify(comments), id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          ...row,
          comments: comments,
        });
      },
    );
  });
});

// 7. 모집글 단체 채팅방 생성 또는 참여
app.post("/api/chat-rooms", (req, res) => {
  const { room_id: roomId, post_id: postId, title, member_id: memberId, member_name: memberName } =
    req.body;

  if (!roomId || !title?.trim() || !memberId || !memberName?.trim()) {
    return res.status(400).json({
      error: "room_id, title, member_id, member_name은 필수입니다.",
    });
  }

  const now = new Date().toISOString();

  db.serialize(() => {
    db.run(
      "INSERT OR IGNORE INTO chat_rooms (id, post_id, title, room_type, created_at) VALUES (?, ?, ?, 'group', ?)",
      [roomId, postId || null, title.trim(), now],
    );
    db.run(
      "INSERT OR IGNORE INTO chat_room_members (room_id, member_id, member_name, joined_at) VALUES (?, ?, ?, ?)",
      [roomId, memberId, memberName.trim(), now],
    );
    db.get(
      `
        SELECT rooms.id AS room_id, rooms.post_id, rooms.title, rooms.room_type,
          COUNT(members.member_id) AS member_count
        FROM chat_rooms AS rooms
        LEFT JOIN chat_room_members AS members ON members.room_id = rooms.id
        WHERE rooms.id = ?
        GROUP BY rooms.id
      `,
      [roomId],
      (err, room) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json(room);
      },
    );
  });
});

// 8. 특정 채팅방의 메시지 내역 조회
app.get("/api/messages/:roomId", (req, res) => {
  const roomId = req.params.roomId;

  db.all(
    "SELECT * FROM messages WHERE room_id = ? ORDER BY id ASC",
    [roomId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(rows);
    },
  );
});

// 9. 메시지(채팅) 저장
app.post("/api/messages", (req, res) => {
  const { room_id: roomId, sender, text } = req.body;

  if (!roomId || !sender || !text?.trim()) {
    return res.status(400).json({ error: "room_id, sender, text는 필수입니다." });
  }

  const messageText = text.trim();
  const timestamp = new Date().toISOString();

  db.run(
    "INSERT INTO messages (room_id, sender, text, timestamp) VALUES (?, ?, ?, ?)",
    [roomId, sender, messageText, timestamp],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        id: this.lastID,
        room_id: roomId,
        sender,
        text: messageText,
        timestamp,
      });
    },
  );
});

// 10. 채팅방별 가장 최근 메시지 목록 조회
app.get("/api/chat-rooms", (req, res) => {
  const chatRoomsQuery = `
    WITH latest_messages AS (
      SELECT room_id, MAX(id) AS latest_message_id
      FROM messages
      WHERE room_id IS NOT NULL AND room_id <> ''
      GROUP BY room_id
    ), member_counts AS (
      SELECT room_id, COUNT(member_id) AS member_count
      FROM chat_room_members
      GROUP BY room_id
    )
    SELECT
      messages.id,
      messages.room_id,
      messages.sender,
      messages.text,
      messages.timestamp,
      rooms.title AS room_title,
      COALESCE(rooms.room_type, 'direct') AS room_type,
      COALESCE(member_counts.member_count, 0) AS member_count,
      rooms.post_id
    FROM latest_messages
    INNER JOIN messages ON messages.id = latest_messages.latest_message_id
    LEFT JOIN chat_rooms AS rooms ON rooms.id = messages.room_id
    LEFT JOIN member_counts ON member_counts.room_id = messages.room_id

    UNION ALL

    SELECT
      NULL AS id,
      rooms.id AS room_id,
      NULL AS sender,
      NULL AS text,
      rooms.created_at AS timestamp,
      rooms.title AS room_title,
      rooms.room_type,
      COALESCE(member_counts.member_count, 0) AS member_count,
      rooms.post_id
    FROM chat_rooms AS rooms
    LEFT JOIN latest_messages ON latest_messages.room_id = rooms.id
    LEFT JOIN member_counts ON member_counts.room_id = rooms.id
    WHERE latest_messages.room_id IS NULL

    ORDER BY timestamp DESC
  `;

  db.all(chatRoomsQuery, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(
    `🚀 덕친소 백엔드 서버가 http://localhost:${PORT} 에서 로컬 SQL 기반으로 실행 중입니다.`,
  );
});

import { toBookmark } from "./bookmarks";

function getStorageKey(userId) {
  return `deokchinso:applied-posts:${userId}`;
}

export function loadAppliedPosts(userId) {
  if (!userId) return [];

  try {
    const saved = window.localStorage.getItem(getStorageKey(userId));
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("신청한 동행을 불러오지 못했습니다:", error);
    return [];
  }
}

export function addAppliedPost(userId, post) {
  if (!userId) return [];

  const application = { ...toBookmark(post), status: "채팅 참여 중" };
  const previous = loadAppliedPosts(userId);
  const next = previous.some((item) => item.id === application.id)
    ? previous
    : [application, ...previous];

  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(next));
  } catch (error) {
    console.error("신청한 동행을 저장하지 못했습니다:", error);
  }
  return next;
}

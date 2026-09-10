function getStorageKey(userId) {
  return `deokchinso:bookmarks:${userId}`;
}

export function loadBookmarks(userId) {
  if (!userId) return [];

  try {
    const saved = window.localStorage.getItem(getStorageKey(userId));
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("찜 목록을 불러오지 못했습니다:", error);
    return [];
  }
}

export function saveBookmarks(userId, bookmarks) {
  if (!userId) return;

  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(bookmarks));
  } catch (error) {
    console.error("찜 목록을 저장하지 못했습니다:", error);
  }
}

export function bookmarkKey(post) {
  return post.roomId || post.chatRoomId || `legacy:${post.id}`;
}

export function toBookmark(post) {
  return {
    id: bookmarkKey(post),
    postId: post.chatPostId || post.id,
    roomId: post.roomId || post.chatRoomId,
    title: post.title,
    category: post.category || post.genre || "일반",
    date: post.date,
    location: post.location || post.region,
    author: post.author,
    author_avatar_url: post.author_avatar_url,
    img: post.img,
  };
}

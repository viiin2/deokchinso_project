import { initialPosts } from "./data/mockData";

const FALLBACK_NAME = "동행 메이트";

export function getDefaultAvatarUrl(seed = FALLBACK_NAME) {
  return `https://api.dicebear.com/9.x/initials/svg?backgroundType=gradientLinear&seed=${encodeURIComponent(
    seed,
  )}`;
}

export function getUserProfile(user, storedProfile) {
  const metadata = user?.user_metadata || {};
  const displayName =
    storedProfile?.display_name ||
    metadata.nickname ||
    metadata.name ||
    metadata.full_name ||
    user?.email?.split("@")[0] ||
    "덕친";

  return {
    id: user?.id,
    displayName,
    avatarUrl:
      storedProfile?.avatar_url ||
      metadata.avatar_url ||
      getDefaultAvatarUrl(user?.id || displayName),
  };
}

export function getPostHostProfile(post, remotePosts = []) {
  const postReference = String(post?.post_id ?? post?.chatPostId ?? post?.id ?? "");
  const isRemotePost = postReference.startsWith("post:");
  const linkedPostId = postReference.replace(/^(mock|post):/, "");
  const linkedPost = isRemotePost
    ? remotePosts.find((remotePost) => String(remotePost.id) === linkedPostId)
    : initialPosts.find((initialPost) => String(initialPost.id) === linkedPostId);
  const source = post?.host_name || post?.author ? post : linkedPost || post;
  const displayName =
      source?.host_name || source?.author || source?.display_name || FALLBACK_NAME;

  return {
    displayName,
    avatarUrl:
      source?.host_avatar_url ||
      source?.author_avatar_url ||
      source?.avatarUrl ||
      source?.img ||
      getDefaultAvatarUrl(`${source?.post_id || source?.id || "room"}-${displayName}`),
  };
}

import { toImageUrl } from "./imageUrl";

const metaStorageKey = (userId) => {
  if (userId == null || String(userId).length === 0) return null;
  return `nengtul:feedPostMeta:${String(userId)}`;
};

export function loadFeedPostMeta(userId) {
  const k = metaStorageKey(userId);
  if (!k) return {};
  try {
    const raw = localStorage.getItem(k);
    const o = JSON.parse(raw || "{}");
    if (!o || typeof o !== "object") return {};
    return o;
  } catch {
    return {};
  }
}

export function saveFeedPostMeta(userId, meta) {
  const k = metaStorageKey(userId);
  if (!k) return;
  localStorage.setItem(k, JSON.stringify(meta));
}

/**
 * 피드 API 항목의 writer 정보를 저장해, GET /me/liked/posts(닉네임 없음)와 병합할 때 사용
 */
export function mergeWriterMetaFromFeedApiItems(userId, rawItems) {
  if (!userId || !Array.isArray(rawItems) || rawItems.length === 0) return;
  const meta = loadFeedPostMeta(userId);
  let changed = false;
  rawItems.forEach((item) => {
    const id = Number(item.id);
    const w = item.writer;
    if (!Number.isFinite(id) || !w?.nickname) return;
    const key = String(id);
    const next = {
      author: w.nickname,
      avatarUrl: w.profileImageUrl ? toImageUrl(w.profileImageUrl) : "",
    };
    const prev = meta[key];
    if (!prev || prev.author !== next.author || prev.avatarUrl !== next.avatarUrl) {
      meta[key] = next;
      changed = true;
    }
  });
  if (changed) saveFeedPostMeta(userId, meta);
}

export function upsertFeedPostMeta(userId, postId, { author, avatarUrl }) {
  if (postId == null) return;
  const meta = loadFeedPostMeta(userId);
  meta[String(postId)] = {
    author: author || "사용자",
    avatarUrl: avatarUrl || "",
  };
  saveFeedPostMeta(userId, meta);
}

export function removeFeedPostMeta(userId, postId) {
  if (postId == null) return;
  const meta = loadFeedPostMeta(userId);
  const key = String(postId);
  if (!(key in meta)) return;
  delete meta[key];
  saveFeedPostMeta(userId, meta);
}

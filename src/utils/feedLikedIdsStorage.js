export const FEED_POST_UNLIKED_EVENT = 'naengtul-feed-post-unliked';

export const feedLikedStorageKey = (userId) =>
  userId != null && String(userId).length > 0
    ? `nengtul:feedLikedPostIds:${String(userId)}`
    : null;

export const loadFeedLikedIdSet = (key) => {
  if (!key) return new Set();
  try {
    const raw = localStorage.getItem(key);
    const arr = JSON.parse(raw || '[]');
    return new Set(
      (Array.isArray(arr) ? arr : [])
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n)),
    );
  } catch {
    return new Set();
  }
};

export const saveFeedLikedIdSet = (key, set) => {
  if (!key) return;
  localStorage.setItem(key, JSON.stringify([...set]));
};

/** 마이페이지 등에서 좋아요 해제 시 피드와 동일한 localStorage 집합에서 제거 */
export const removeFeedLikedIdFromStorage = (userId, postId) => {
  const key = feedLikedStorageKey(userId);
  if (!key) return;
  const id = Number(postId);
  if (!Number.isFinite(id)) return;
  const set = loadFeedLikedIdSet(key);
  set.delete(id);
  saveFeedLikedIdSet(key, set);
};

export const notifyFeedPostUnliked = (postId) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(FEED_POST_UNLIKED_EVENT, { detail: { postId } }),
  );
};

export const removeFeedLikedIdFromStorageAndNotify = (userId, postId) => {
  removeFeedLikedIdFromStorage(userId, postId);
  notifyFeedPostUnliked(postId);
};

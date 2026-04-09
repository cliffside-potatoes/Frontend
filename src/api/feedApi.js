/**
 * 전체 피드 GET /feed (커서 기반)
 * - 원격 API가 설정된 경우에만 요청. 목 데이터는 사용하지 않음.
 * - Bearer 미포함: 만료·불일치 토큰으로 인한 401 방지, 비로그인·로그인 동일 공개 타임라인 조회.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const isSameOriginBase = (base) =>
  typeof window !== "undefined" &&
  base &&
  (base.startsWith(window.location.origin) || base === window.location.origin);

const hasRemoteFeedApi = (base) =>
  Boolean(base) && !isSameOriginBase(base);

/**
 * @param {Object} params
 * @param {number} [params.size=20]
 * @param {string} [params.sort=LATEST]
 * @param {string} [params.cursorCreatedAt]
 * @param {number} [params.cursorId]
 * @param {number} [params.cursorLikeCount]
 * @param {number} [params.cursorReviewCount]
 */
export const getFeed = async (params = {}) => {
  const {
    size = 20,
    sort = "LATEST",
    cursorCreatedAt,
    cursorId,
    cursorLikeCount,
    cursorReviewCount,
  } = params;

  const baseRaw = (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";
  const base = baseRaw.replace(/\/$/, "");

  const empty = { items: [], hasNext: false, nextCursor: null };

  if (!hasRemoteFeedApi(baseRaw)) {
    return empty;
  }

  const searchParams = new URLSearchParams();
  searchParams.set("size", String(size));
  searchParams.set("sort", sort);

  if (cursorCreatedAt != null && cursorId != null) {
    searchParams.set("cursorCreatedAt", cursorCreatedAt);
    searchParams.set("cursorId", String(cursorId));
  } else if (cursorLikeCount != null && cursorId != null) {
    searchParams.set("cursorLikeCount", String(cursorLikeCount));
    searchParams.set("cursorId", String(cursorId));
  } else if (cursorReviewCount != null && cursorId != null) {
    searchParams.set("cursorReviewCount", String(cursorReviewCount));
    searchParams.set("cursorId", String(cursorId));
  }

  try {
    const url = `${base}/feed?${searchParams.toString()}`;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    let res = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (res.status === 401) {
      res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "omit",
      });
    }

    if (!res.ok) {
      return empty;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return empty;
    }

    const json = await res.json();
    const payload = json?.data ?? {};

    return {
      items: Array.isArray(payload.items) ? payload.items : [],
      hasNext: Boolean(payload.hasNext),
      nextCursor: payload.nextCursor ?? null,
    };
  } catch {
    return empty;
  }
};

export default { getFeed };

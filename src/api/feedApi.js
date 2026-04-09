import { getStoredAccessToken } from "../utils/authStorage";

/**
 * 전체 피드 GET /feed (커서 기반)
 * - 원격 API가 설정된 경우에만 요청. 목 데이터는 사용하지 않음.
 * - 비로그인도 fetch로 호출(토큰이 있으면 헤더에 포함). 401 등 실패 시 빈 목록.
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
    const token = getStoredAccessToken();
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${base}/feed?${searchParams.toString()}`, {
      method: "GET",
      headers,
    });

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

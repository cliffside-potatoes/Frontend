import { getStoredAccessToken } from '../utils/authStorage';

/**
 * 전체 피드 API (다른 사용자 게시글 + 리뷰, 무한 스크롤)
 * - 최신순: cursorCreatedAt + cursorId
 * - 인기순: cursorLikeCount + cursorId
 * - 리뷰순: cursorReviewCount + cursorId
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeader = () => {
  const token = getStoredAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** API 실패 시 사용할 목 데이터 (Feed 스펙 형식) */
const MOCK_FEED_ITEMS = [
  {
    type: 'POST',
    id: 101,
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop'],
    content: '오늘은 이걸 먹었다~ 너무 맛있었다!',
    source: null,
    writer: { profileId: 1, nickname: '사용자 닉네A', profileImageUrl: null },
    likeCount: 12,
    hideLikeCount: false,
    liked: false,
    isMine: false,
    updatedAt: '2026-01-19T12:30:00+09:00',
    createdAt: '2026-01-19T12:30:00+09:00',
  },
  {
    type: 'POST',
    id: 102,
    images: ['https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=600&fit=crop'],
    content: '주말에 파스타 만들어봤어요 🍝',
    source: null,
    writer: { profileId: 2, nickname: '요리왕', profileImageUrl: null },
    likeCount: 8,
    hideLikeCount: false,
    liked: false,
    isMine: false,
    updatedAt: '2026-01-18T10:00:00+09:00',
    createdAt: '2026-01-18T10:00:00+09:00',
  },
  {
    type: 'RECIPE_REVIEW',
    id: 201,
    images: [],
    content: '김치찌개 레시피 따라했는데 대성공!',
    source: '김치찌개[유튜브-3분 뚝딱이 형]',
    writer: { profileId: 3, nickname: '친구B', profileImageUrl: null },
    likeCount: 5,
    hideLikeCount: false,
    liked: false,
    isMine: false,
    updatedAt: '2026-01-17T15:00:00+09:00',
    createdAt: '2026-01-17T15:00:00+09:00',
  },
];

const getMockFeed = (params) => {
  const { size = 20 } = params;
  const items = MOCK_FEED_ITEMS.slice(0, size);
  const last = items[items.length - 1];

  return {
    items,
    hasNext: false,
    nextCursor: last
      ? { cursorCreatedAt: last.createdAt, cursorId: last.id }
      : null,
  };
};

/**
 * 전체 피드 조회 (무한 스크롤)
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
    sort = 'LATEST',
    cursorCreatedAt,
    cursorId,
    cursorLikeCount,
    cursorReviewCount,
  } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('size', String(size));
  searchParams.set('sort', sort);

  if (cursorCreatedAt != null && cursorId != null) {
    searchParams.set('cursorCreatedAt', cursorCreatedAt);
    searchParams.set('cursorId', String(cursorId));
  } else if (cursorLikeCount != null && cursorId != null) {
    searchParams.set('cursorLikeCount', String(cursorLikeCount));
    searchParams.set('cursorId', String(cursorId));
  } else if (cursorReviewCount != null && cursorId != null) {
    searchParams.set('cursorReviewCount', String(cursorReviewCount));
    searchParams.set('cursorId', String(cursorId));
  }

  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    const isSameOrigin =
      typeof window !== 'undefined' &&
      base &&
      (base.startsWith(window.location.origin) || base === window.location.origin);

    if (!base || isSameOrigin || !getStoredAccessToken()) {
      return getMockFeed(params);
    }

    const url = `${base}/feed?${searchParams.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      return getMockFeed(params);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return getMockFeed(params);
    }

    let data;
    try {
      data = await res.json();
    } catch {
      return getMockFeed(params);
    }

    const payload = data?.data ?? {};

    return {
      items: Array.isArray(payload.items) ? payload.items : [],
      hasNext: Boolean(payload.hasNext),
      nextCursor: payload.nextCursor ?? null,
    };
  } catch {
    return getMockFeed(params);
  }
};

export default { getFeed };
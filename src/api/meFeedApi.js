const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** 백엔드 없을 때 사용하는 목 데이터 (API 실패 시 자동 사용) */
const MOCK_FEED_ITEMS = [
  {
    type: 'POST',
    id: 1,
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop'],
    content: '오늘은 이걸 먹었다~ 너무 맛있었다!',
    recipeSource: null,
    likeCount: 5,
    hideLikeCount: false,
    pinned: false,
    updatedAt: '2025-12-23T12:00:00+09:00',
    createdAt: '2025-12-23T12:00:00+09:00',
    cookCount: 0,
  },
  {
    type: 'POST',
    id: 2,
    images: ['https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=600&fit=crop'],
    content: '주말에 파스타 만들어봤어요 🍝',
    recipeSource: null,
    likeCount: 3,
    hideLikeCount: false,
    pinned: false,
    updatedAt: '2025-12-20T12:00:00+09:00',
    createdAt: '2025-12-20T12:00:00+09:00',
    cookCount: 0,
  },
  {
    type: 'POST',
    id: 3,
    images: [],
    content: '간단한 볶음밥 레시피~',
    recipeSource: null,
    likeCount: 8,
    hideLikeCount: false,
    pinned: false,
    updatedAt: '2025-12-15T12:00:00+09:00',
    createdAt: '2025-12-15T12:00:00+09:00',
    cookCount: 0,
  },
];

/** API 실패 시 목 데이터 반환 */
const getMockFeed = (params) => {
  const { size = 20 } = params;
  const items = MOCK_FEED_ITEMS.slice(0, size);
  const last = items[items.length - 1];

  return {
    items,
    hasNext: false,
    nextCursor: last ? { cursorCreatedAt: last.createdAt, cursorId: last.id } : null,
  };
};

/**
 * 내 피드 조회
 * GET /me/feed
 */
export const getMyFeed = async (params = {}) => {
  const {
    size = 20,
    cursorCreatedAt,
    cursorId,
    sort = 'LATEST',
  } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('size', String(size));
  searchParams.set('sort', sort);

  if (cursorCreatedAt != null && cursorId != null) {
    searchParams.set('cursorCreatedAt', cursorCreatedAt);
    searchParams.set('cursorId', String(cursorId));
  }

  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    const isSameOrigin =
      typeof window !== 'undefined' &&
      base &&
      (base.startsWith(window.location.origin) || base === window.location.origin);

    if (!base || isSameOrigin) return getMockFeed(params);

    const url = `${base}/me/feed?${searchParams.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!res.ok) return getMockFeed(params);

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return getMockFeed(params);

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

export default { getMyFeed };
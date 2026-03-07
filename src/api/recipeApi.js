/**
 * 레시피 및 후기 API
 * - 레시피 상세 조회
 * - 후기 목록 조회 (무한 스크롤)
 * - 후기 작성
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Mock 데이터 - 레시피 상세 */
const MOCK_RECIPE_DETAIL = {
  recipeId: 1,
  title: '김치찌개',
  thumbnailImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  source: '유튜브 - 릴리쿡 "김치찌개를 만들어보자~~"',
  likeCount: 8,
  reviewCount: 8,
  cookingTime: 30,
  difficulty: '초보',
  servings: 1,
  description: '잘 익은 김치로 보다니~ 너무 맛있을 것 같은 일품김치찌개를 알려드립니다~! 우리 같이 하는 방법입니다.',
  recipewithLink: {
    url: 'https://youtube.com/example',
    source: '유튜브 - 릴리쿡'
  },
  ingredients: [
    { name: '감자', checked: true },
    { name: '김치', checked: false },
    { name: '돼지고기', checked: true },
    { name: '두부', checked: false },
    { name: '양파', checked: true },
    { name: '대파', checked: true },
    { name: '고춧가루', checked: false }
  ],
  liked: false,
  totalIngredientCount: 7,
  matchedIngredientCount: 4
};

/** Mock 데이터 - 후기 목록 */
const MOCK_REVIEWS = [
  {
    reviewId: 1,
    profileId: 1,
    nickName: '사용자 닉네임',
    profileImage: null,
    content: '오늘도 이걸 먹었다~~ 너무 맛있었다이슈슬 이걸 먹었다 ~~ 너무 맛있었다~~ 너무 맛있...',
    images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop'],
    updatedAt: '2025년 12월 23일',
    hideLikeCount: false,
    likeCount: 5,
    liked: false
  },
  {
    reviewId: 2,
    profileId: 2,
    nickName: '사용자 닉네임',
    profileImage: null,
    content: '오늘도 이걸 먹었다~~ 너무 맛있었다이슈슬 이걸 먹었다 ~~ 너무 맛있었다~~ 너무 맛있...',
    images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop'],
    updatedAt: '2025년 12월 23일',
    hideLikeCount: false,
    likeCount: 8,
    liked: false
  },
  {
    reviewId: 3,
    profileId: 3,
    nickName: '사용자 닉네임',
    profileImage: null,
    content: '오늘도 이걸 먹었다~~ 너무 맛있었다이슈슬 이걸 먹었다 ~~ 너무 맛있었다~~ 너무 맛있...',
    images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop'],
    updatedAt: '2025년 12월 23일',
    hideLikeCount: false,
    likeCount: 3,
    liked: false
  }
];

const getMockReviews = (params) => {
  const { size = 20, sort = 'LATEST' } = params;
  const items = [...MOCK_REVIEWS];
  if (sort === 'POPULAR') {
    items.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
  } else {
    // LATEST - 작성일 기준 (Mock에서는 순서 유지)
  }
  return {
    totalCount: MOCK_REVIEWS.length,
    items: items.slice(0, size),
    hasNext: false,
    nextCursor: null
  };
};

/**
 * 레시피 상세 조회
 * GET /recipes/details/{recipeId}
 */
export const getRecipeDetail = async (recipeId) => {
  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    const isSameOrigin =
      typeof window !== 'undefined' &&
      base &&
      (base.startsWith(window.location.origin) || base === window.location.origin);
    
    if (!base || isSameOrigin) {
      return { ...MOCK_RECIPE_DETAIL, recipeId: Number(recipeId) };
    }

    const url = `${base}/recipes/details/${recipeId}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      return { ...MOCK_RECIPE_DETAIL, recipeId: Number(recipeId) };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ...MOCK_RECIPE_DETAIL, recipeId: Number(recipeId) };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('레시피 상세 조회 실패:', error);
    return { ...MOCK_RECIPE_DETAIL, recipeId: Number(recipeId) };
  }
};

/**
 * 레시피 후기 목록 조회 (무한 스크롤)
 * GET /reviewRecipes/{recipeId}
 * @param {number} recipeId
 * @param {Object} params
 * @param {number} [params.size=20] - 한 번에 조회할 개수
 * @param {string} [params.cursorCreatedAt] - 마지막으로 조회한 feed의 생성 시각
 * @param {number} [params.cursorLikeCount] - 마지막으로 조회한 feed의 좋아요 수
 * @param {number} [params.cursorReviewCount] - 마지막으로 조회한 feed의 리뷰 수
 * @param {number} [params.cursorId] - 마지막으로 조회한 feed의 ID
 * @param {string} [params.sort=LATEST] - 정렬 방식 (LATEST: 최신순, POPULAR: 인기순)
 */
export const getRecipeReviews = async (recipeId, params = {}) => {
  const {
    size = 20,
    cursorCreatedAt,
    cursorLikeCount,
    cursorReviewCount,
    cursorId,
    sort = 'LATEST'
  } = params;

  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    const isSameOrigin =
      typeof window !== 'undefined' &&
      base &&
      (base.startsWith(window.location.origin) || base === window.location.origin);
    
    if (!base || isSameOrigin) {
      return getMockReviews(params);
    }

    const searchParams = new URLSearchParams();
    searchParams.set('size', String(size));
    searchParams.set('sort', sort);
    if (cursorCreatedAt && cursorId) {
      searchParams.set('cursorCreatedAt', cursorCreatedAt);
      searchParams.set('cursorId', String(cursorId));
    }
    if (cursorLikeCount && cursorId) {
      searchParams.set('cursorLikeCount', String(cursorLikeCount));
    }
    if (cursorReviewCount && cursorId) {
      searchParams.set('cursorReviewCount', String(cursorReviewCount));
    }

    const url = `${base}/reviewRecipes/${recipeId}?${searchParams.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      return getMockReviews(params);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return getMockReviews(params);
    }

    const data = await res.json();
    return {
      totalCount: data.totalCount || 0,
      items: Array.isArray(data.items) ? data.items : [],
      hasNext: Boolean(data.hasNext),
      nextCursor: data.nextCursor ?? null
    };
  } catch (error) {
    console.error('후기 목록 조회 실패:', error);
    return getMockReviews(params);
  }
};

/**
 * 레시피 후기 작성
 * POST /reviewRecipes/{recipeId}
 * @param {number} recipeId
 * @param {Object} data
 * @param {string[]} data.images - 이미지 URL 배열
 * @param {string} data.content - 후기 내용 (1자 이상 500자 이하)
 */
export const createRecipeReview = async (recipeId, data) => {
  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    const isSameOrigin =
      typeof window !== 'undefined' &&
      base &&
      (base.startsWith(window.location.origin) || base === window.location.origin);
    
    // Mock 환경에서는 성공으로 간주
    if (!base || isSameOrigin) {
      return {
        success: true,
        data: {
          id: Math.floor(Math.random() * 10000)
        }
      };
    }

    const url = `${base}/reviewRecipes/${recipeId}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('후기 작성 실패');
    }

    const responseData = await res.json();
    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    console.error('후기 작성 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 레시피 후기 삭제
 * DELETE /reviewRecipes/{recipeId}/{reviewId}
 */
export const deleteRecipeReview = async (recipeId, reviewId) => {
  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    const isSameOrigin =
      typeof window !== 'undefined' &&
      base &&
      (base.startsWith(window.location.origin) || base === window.location.origin);

    if (!base || isSameOrigin) {
      return { success: true };
    }

    const url = `${base}/reviewRecipes/${recipeId}/${reviewId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      throw new Error('후기 삭제 실패');
    }

    return { success: true };
  } catch (error) {
    console.error('후기 삭제 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 레시피 찜 생성
 * POST /wishes/{recipeId}
 */
export const addWishlist = async (recipeId) => {
  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    if (!base) return { success: true };

    const res = await fetch(`${base}/wishes/${recipeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!res.ok) throw new Error('찜 추가 실패');
    return { success: true };
  } catch (error) {
    console.error('찜 추가 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 레시피 찜 해제
 * DELETE /wishes/{recipeId}
 */
export const removeWishlist = async (recipeId) => {
  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    if (!base) return { success: true };

    const res = await fetch(`${base}/wishes/${recipeId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!res.ok) throw new Error('찜 해제 실패');
    return { success: true };
  } catch (error) {
    console.error('찜 해제 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 레시피 찜 목록 조회
 * GET /wishes
 */
export const getWishlistRecipes = async (params = {}) => {
  const { size = 20, cursorId, cursorCreatedAt } = params;

  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    if (!base) return { items: [], hasNext: false };

    const searchParams = new URLSearchParams({ size: String(size) });
    if (cursorId && cursorCreatedAt) {
      searchParams.set('cursorId', String(cursorId));
      searchParams.set('cursorCreatedAt', cursorCreatedAt);
    }

    const res = await fetch(`${base}/wishes?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!res.ok) return { items: [], hasNext: false };

    const data = await res.json();
    return {
      items: Array.isArray(data.items) ? data.items : [],
      hasNext: Boolean(data.hasNext),
      nextCursor: data.nextCursor ?? null,
    };
  } catch (error) {
    console.error('찜 목록 조회 실패:', error);
    return { items: [], hasNext: false };
  }
};

/**
 * 인기 레시피 조회
 * GET /recipes/popular
 */
export const getPopularRecipes = async (params = {}) => {
  const { size = 10 } = params;

  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    if (!base) return [];

    const res = await fetch(`${base}/recipes/popular?size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('인기 레시피 조회 실패:', error);
    return [];
  }
};

/**
 * 태그별 레시피 추천 조회
 * GET /recipes?tag={tag}
 */
export const getTaggedRecipes = async (tag, params = {}) => {
  const { size = 10 } = params;

  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    if (!base) return [];

    const searchParams = new URLSearchParams({ tag, size: String(size) });
    const res = await fetch(`${base}/recipes?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('태그별 레시피 조회 실패:', error);
    return [];
  }
};

export default {
  getRecipeDetail,
  getRecipeReviews,
  createRecipeReview,
  deleteRecipeReview,
  addWishlist,
  removeWishlist,
  getWishlistRecipes,
  getPopularRecipes,
  getTaggedRecipes,
};

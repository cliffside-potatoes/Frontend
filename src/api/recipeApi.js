import {
  clearStoredAuth,
  getCurrentPath,
  getStoredAccessToken,
  savePostLoginRedirect,
} from "../utils/authStorage";
/**
 * 레시피 및 후기 API
 * - 레시피 상세 조회
 * - 후기 목록 조회 (무한 스크롤)
 * - 후기 작성
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const getAccessToken = () => {
  return getStoredAccessToken();
};

const getAuthHeader = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const isSameOriginBase = (base) =>
  typeof window !== "undefined" &&
  base &&
  (base.startsWith(window.location.origin) || base === window.location.origin);

const shouldUsePublicRecipeMock = (base) =>
  !base || isSameOriginBase(base) || !getStoredAccessToken();

const redirectToSignIn = () => {
  savePostLoginRedirect(getCurrentPath());
  clearStoredAuth();
  window.location.href = "/signin";
};

const handle401 = () => {
  alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
  redirectToSignIn();
};

const refreshAccessToken = async () => {
  const base = API_BASE_URL.replace(/\/$/, "");

  const res = await fetch(`${base}/oauth/token`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`토큰 재발급 실패 (${res.status})`);
  }

  const data = await res.json();
  const payload = data?.data ?? data;

  if (payload?.accessToken) {
    localStorage.setItem("accessToken", payload.accessToken);
  }

  return payload ?? null;
};

const fetchWithAuthRetry = async (url, options = {}) => {
  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...getAuthHeader(),
    },
  });

  if (res.status === 401) {
    try {
      const refreshPayload = await refreshAccessToken();

      if (!refreshPayload?.accessToken) {
        handle401();
        return null;
      }

      res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          ...getAuthHeader(),
        },
      });
    } catch (error) {
      console.error("토큰 재발급 실패:", error);
      handle401();
      return null;
    }
  }

  return res;
};

/** Mock 데이터 - 레시피 상세 */
const MOCK_RECIPE_DETAIL = {
  recipeId: 1,
  title: "김치찌개",
  thumbnailImage:
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
  source: '유튜브 - 릴리쿡 "김치찌개를 만들어보자~~"',
  likeCount: 8,
  reviewCount: 8,
  cookingTime: 30,
  difficulty: "초보",
  servings: 1,
  description:
    "잘 익은 김치로 보다니~ 너무 맛있을 것 같은 일품김치찌개를 알려드립니다~! 우리 같이 하는 방법입니다.",
  recipewithLink: {
    url: "https://youtube.com/example",
    source: "유튜브 - 릴리쿡",
  },
  ingredients: [
    { name: "감자", checked: true },
    { name: "김치", checked: false },
    { name: "돼지고기", checked: true },
    { name: "두부", checked: false },
    { name: "양파", checked: true },
    { name: "대파", checked: true },
    { name: "고춧가루", checked: false },
  ],
  liked: false,
  totalIngredientCount: 7,
  matchedIngredientCount: 4,
};

/** 목록·상세 폴백용 (API 실패·로컬 개발) — normalizeRecipeItem 입력 형태 */
const MOCK_RECIPE_LIST = [
  {
    recipeId: MOCK_RECIPE_DETAIL.recipeId,
    title: MOCK_RECIPE_DETAIL.title,
    thumbnailImage: MOCK_RECIPE_DETAIL.thumbnailImage,
    source: MOCK_RECIPE_DETAIL.source,
    cookingTime: MOCK_RECIPE_DETAIL.cookingTime,
    difficulty: MOCK_RECIPE_DETAIL.difficulty,
    likeCount: MOCK_RECIPE_DETAIL.likeCount,
    reviewCount: MOCK_RECIPE_DETAIL.reviewCount,
    totalIngredientCount: MOCK_RECIPE_DETAIL.totalIngredientCount,
    matchedIngredientCount: MOCK_RECIPE_DETAIL.matchedIngredientCount,
    liked: MOCK_RECIPE_DETAIL.liked,
  },
  {
    recipeId: 2,
    title: "된장찌개",
    thumbnailImage:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop",
    source: "만개의 레시피",
    cookingTime: 25,
    difficulty: "초보",
    likeCount: 15,
    reviewCount: 3,
    totalIngredientCount: 5,
    matchedIngredientCount: 2,
    liked: false,
  },
  {
    recipeId: 3,
    title: "계란볶음밥",
    thumbnailImage:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop",
    source: "유튜브",
    cookingTime: 15,
    difficulty: "초보",
    likeCount: 20,
    reviewCount: 10,
    totalIngredientCount: 4,
    matchedIngredientCount: 4,
    liked: false,
  },
];

const MOCK_REVIEWS = [];

const getMockReviews = (params) => {
  const { size = 20, sort = "LATEST" } = params;
  const items = [...MOCK_REVIEWS];
  if (sort === "POPULAR") {
    items.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
  }
  return {
    totalCount: MOCK_REVIEWS.length,
    items: items.slice(0, size),
    hasNext: false,
    nextCursor: null,
  };
};

const normalizeRecipeItem = (item) => {
  return {
    recipeId: item?.recipeId ?? item?.id ?? 0,
    title: item?.title ?? item?.name ?? "레시피",
    thumbnailImage:
      item?.thumbnailImage ??
      item?.thumbnailImageUrl ??
      item?.imageUrl ??
      item?.thumbnailUrl ??
      "",
    source: item?.source ?? item?.recipeSource ?? "출처 없음",
    cookingTime: item?.cookingTime ?? item?.cookTime ?? 0,
    difficulty: item?.difficulty ?? "초보",
    likeCount: item?.likeCount ?? 0,
    reviewCount: item?.reviewCount ?? 0,
    totalIngredientCount: item?.totalIngredientCount ?? 0,
    matchedIngredientCount: item?.matchedIngredientCount ?? 0,
    liked: item?.liked ?? false,
  };
};

const getMockRecipeList = (size = 10) =>
  MOCK_RECIPE_LIST.slice(0, size).map(normalizeRecipeItem);

const extractRecipesListFromApiPayload = (payload) => {
  if (!payload || typeof payload !== "object") return [];
  const inner = payload.data;
  const lists = [
    inner?.Recipes,
    inner?.recipes,
    inner?.items,
    payload.Recipes,
    payload.recipes,
    payload.items,
  ];
  for (let i = 0; i < lists.length; i += 1) {
    if (Array.isArray(lists[i])) return lists[i];
  }
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(payload)) return payload;
  return [];
};

/** 원격 레시피 API 사용 가능 (목이 아닌 실제 서버로 요청) */
const hasRemoteRecipeApi = (base) => Boolean(base) && !isSameOriginBase(base);

/**
 * GET /recipes — axios(apiClient)는 401 시 로그인 리다이렉트가 나와 비로그인 메인 노출에 부적합.
 * 게스트도 서버가 허용하면 목록을 받을 수 있도록 fetch로 호출한다.
 * 인증 헤더는 붙이지 않는다. 일부 환경에서 Bearer 포함 시에만 500이 나고 비로그인과 동작이 달라지는 경우가 있어
 * 공개 목록은 게스트와 동일한 요청으로 맞춘다.
 */
const fetchRecipeListFromRemote = async (queryParams) => {
  const base = API_BASE_URL.replace(/\/$/, "");
  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value != null && value !== "") searchParams.set(key, String(value));
  });
  const url = `${base}/recipes?${searchParams.toString()}`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const err = new Error(`GET /recipes ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  const rawItems = extractRecipesListFromApiPayload(json);
  return rawItems.map(normalizeRecipeItem);
};

const getMockRecipeDetail = (recipeId) => {
  const matchedRecipe = MOCK_RECIPE_LIST.find(
    (item) => Number(item.recipeId) === Number(recipeId),
  );

  if (!matchedRecipe) {
    return { ...MOCK_RECIPE_DETAIL, recipeId: Number(recipeId) };
  }

  return {
    ...MOCK_RECIPE_DETAIL,
    ...matchedRecipe,
    recipeId: Number(recipeId),
  };
};

/**
 * 레시피 상세 조회
 * GET /recipes/details/{recipeId}
 */
export const getRecipeDetail = async (recipeId) => {
  try {
    const base =
      (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";

    if (shouldUsePublicRecipeMock(base)) {
      return getMockRecipeDetail(recipeId);
    }

    const url = `${base}/recipes/details/${recipeId}`;
    const res = await fetchWithAuthRetry(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res || !res.ok) {
      return getMockRecipeDetail(recipeId);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return getMockRecipeDetail(recipeId);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("레시피 상세 조회 실패:", error);
    return getMockRecipeDetail(recipeId);
  }
};

/**
 * 레시피 후기 목록 조회
 * GET /reviewRecipes/{recipeId}
 */
export const getRecipeReviews = async (recipeId, params = {}) => {
  const {
    size = 20,
    cursorCreatedAt,
    cursorLikeCount,
    cursorReviewCount,
    cursorId,
    sort = "LATEST",
  } = params;

  try {
    const base =
      (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";

    if (shouldUsePublicRecipeMock(base)) {
      return getMockReviews(params);
    }

    const searchParams = new URLSearchParams();
    searchParams.set("size", String(size));
    searchParams.set("sort", sort);
    if (cursorCreatedAt && cursorId) {
      searchParams.set("cursorCreatedAt", cursorCreatedAt);
      searchParams.set("cursorId", String(cursorId));
    }
    if (cursorLikeCount && cursorId) {
      searchParams.set("cursorLikeCount", String(cursorLikeCount));
    }
    if (cursorReviewCount && cursorId) {
      searchParams.set("cursorReviewCount", String(cursorReviewCount));
    }

    const url = `${base}/reviewRecipes/${recipeId}?${searchParams.toString()}`;
    const res = await fetchWithAuthRetry(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res || !res.ok) {
      return getMockReviews(params);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return getMockReviews(params);
    }

    const data = await res.json();
    return {
      totalCount: data.totalCount || 0,
      items: Array.isArray(data.items) ? data.items : [],
      hasNext: Boolean(data.hasNext),
      nextCursor: data.nextCursor ?? null,
    };
  } catch (error) {
    console.error("후기 목록 조회 실패:", error);
    return getMockReviews(params);
  }
};

/**
 * 레시피 후기 작성
 * POST /reviewRecipes/{recipeId}
 */
export const createRecipeReview = async (recipeId, data) => {
  try {
    const base =
      (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";
    const isSameOrigin =
      typeof window !== "undefined" &&
      base &&
      (base.startsWith(window.location.origin) ||
        base === window.location.origin);

    if (!base || isSameOrigin) {
      return {
        success: true,
        data: {
          id: Math.floor(Math.random() * 10000),
        },
      };
    }

    const url = `${base}/reviewRecipes/${recipeId}`;
    const res = await fetchWithAuthRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res || !res.ok) {
      throw new Error("후기 작성 실패");
    }

    const responseData = await res.json();
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("후기 작성 실패:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 레시피 후기 삭제
 * DELETE /reviewRecipes/{recipeId}/{reviewId}
 */
export const deleteRecipeReview = async (recipeId, reviewId) => {
  try {
    const base =
      (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";
    const isSameOrigin =
      typeof window !== "undefined" &&
      base &&
      (base.startsWith(window.location.origin) ||
        base === window.location.origin);

    if (!base || isSameOrigin) {
      return { success: true };
    }

    const url = `${base}/reviewRecipes/${recipeId}/${reviewId}`;
    const res = await fetchWithAuthRetry(url, {
      method: "DELETE",
    });

    if (!res || !res.ok) {
      throw new Error("후기 삭제 실패");
    }

    return { success: true };
  } catch (error) {
    console.error("후기 삭제 실패:", error);
    return { success: false, error: error.message };
  }
};

/**
 * 레시피 찜 생성
 * POST /wishes/{recipeId}
 */
export const addWishlist = async (recipeId) => {
  try {
    const base =
      (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";
    if (!base) return { success: true };

    const res = await fetchWithAuthRetry(`${base}/wishes/${recipeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res || !res.ok) throw new Error("찜 추가 실패");
    return { success: true };
  } catch (error) {
    console.error("찜 추가 실패:", error);
    return { success: false, error: error.message };
  }
};

/**
 * 레시피 찜 해제
 * DELETE /wishes/{recipeId}
 */
export const removeWishlist = async (recipeId) => {
  try {
    const base =
      (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";
    if (!base) return { success: true };

    const res = await fetchWithAuthRetry(`${base}/wishes/${recipeId}`, {
      method: "DELETE",
    });

    if (!res || !res.ok) throw new Error("찜 해제 실패");
    return { success: true };
  } catch (error) {
    console.error("찜 해제 실패:", error);
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
    const base =
      (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";
    if (!base) return { items: [], hasNext: false };

    const searchParams = new URLSearchParams({ size: String(size) });
    if (cursorId && cursorCreatedAt) {
      searchParams.set("cursorId", String(cursorId));
      searchParams.set("cursorCreatedAt", cursorCreatedAt);
    }

    const res = await fetchWithAuthRetry(
      `${base}/wishes?${searchParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!res || !res.ok) return { items: [], hasNext: false };

    const data = await res.json();
    return {
      items: Array.isArray(data.items) ? data.items : [],
      hasNext: Boolean(data.hasNext),
      nextCursor: data.nextCursor ?? null,
    };
  } catch (error) {
    console.error("찜 목록 조회 실패:", error);
    return { items: [], hasNext: false };
  }
};

/**
 * 레시피 목록 조회 (메인·인기 등)
 * GET /recipes?size=&sort=LATEST|LIKE_COUNT|MATCH_COUNT|...
 */
export const getPopularRecipes = async (params = {}) => {
  const {
    size = 10,
    sort = "LATEST",
    cursorCreatedAt,
    cursorId,
    cursorMatchCount,
    cursorLikeCount,
  } = params;

  try {
    const base =
      (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";
    if (!hasRemoteRecipeApi(base)) return getMockRecipeList(size);

    const queryParams = { size, sort };
    if (cursorCreatedAt != null && cursorId != null) {
      queryParams.cursorCreatedAt = cursorCreatedAt;
      queryParams.cursorId = cursorId;
    }
    if (cursorMatchCount != null && cursorId != null) {
      queryParams.cursorMatchCount = cursorMatchCount;
      queryParams.cursorId = cursorId;
    }
    if (cursorLikeCount != null && cursorId != null) {
      queryParams.cursorLikeCount = cursorLikeCount;
      queryParams.cursorId = cursorId;
    }

    return await fetchRecipeListFromRemote(queryParams);
  } catch (error) {
    console.error("인기 레시피 조회 실패:", error);
    return getMockRecipeList(size);
  }
};

/**
 * 태그별 레시피 추천 조회
 * GET /recipes?category={category}&size=20&sort=LATEST
 */
export const getTaggedRecipes = async (category, params = {}) => {
  const { size = 10, sort = "LATEST", cursorCreatedAt, cursorId } = params;

  try {
    const base =
      (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";
    if (!hasRemoteRecipeApi(base)) return getMockRecipeList(size);

    const paramsObj = {
      category,
      size,
      sort,
      ...(cursorCreatedAt != null && cursorId != null
        ? { cursorCreatedAt, cursorId }
        : {}),
    };

    return await fetchRecipeListFromRemote(paramsObj);
  } catch (error) {
    console.error("태그별 레시피 조회 실패:", error);
    return getMockRecipeList(size);
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

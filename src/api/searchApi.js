import { refreshAccessToken } from "./tokenApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const DEFAULT_RECENT_SEARCHES = ["비빔밥", "김치찌개", "파스타"];
const DEFAULT_RECOMMENDED_SEARCHES = [
  "간단 요리",
  "샐러드",
  "한식",
  "중식",
  "양식",
];

const shouldUsePublicSearchMock = (base) => !base;


const normalizeRecipeItem = (item) => ({
  recipeId: item?.recipeId ?? item?.id ?? 0,
  title: item?.title ?? item?.name ?? "",
  thumbnailImage:
    item?.thumbnailImage ??
    item?.thumbnailImageUrl ??
    item?.imageUrl ??
    item?.thumbnailUrl ??
    "",
  source: item?.source ?? item?.recipeSource ?? item?.description ?? "",
  cookingTime: item?.cookingTime ?? item?.cookTime ?? 0,
  difficulty: item?.difficulty ?? "초보",
  likeCount: item?.likeCount ?? 0,
  reviewCount: item?.reviewCount ?? 0,
  totalIngredientCount: item?.totalIngredientCount ?? 0,
  matchedIngredientCount: item?.matchedIngredientCount ?? 0,
  liked: item?.liked ?? false,
});

const extractRecipeItems = (payload) => {
  if (Array.isArray(payload?.data?.Recipes)) return payload.data.Recipes;
  if (Array.isArray(payload?.Recipes)) return payload.Recipes;
  if (Array.isArray(payload?.data?.recipes)) return payload.data.recipes;
  if (Array.isArray(payload?.recipes)) return payload.recipes;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const normalizeSearchResponse = (payload) => ({
  success: payload?.success ?? true,
  data: {
    Recipes: extractRecipeItems(payload).map(normalizeRecipeItem),
    hasNext: Boolean(payload?.data?.hasNext ?? payload?.hasNext),
    nextCursor: payload?.data?.nextCursor ?? payload?.nextCursor ?? null,
  },
  message: payload?.message ?? "검색을 완료했습니다",
});

const getMockSearchResponse = () =>
  normalizeSearchResponse({
    data: { Recipes: [], hasNext: false, nextCursor: null },
    message: "검색 결과가 없습니다",
  });

const buildSearchParams = (keyword, options = {}) => {
  const { size = 20, sort = "LATEST", cursorCreatedAt, cursorId } = options;
  const params = new URLSearchParams({
    keyword,
    size: String(size),
    sort,
  });

  if (cursorCreatedAt && cursorId) {
    params.set("cursorCreatedAt", cursorCreatedAt);
    params.set("cursorId", String(cursorId));
  }

  return params;
};

const requestSearchRecipes = async (keyword, options = {}) => {
  const base = API_BASE_URL.replace(/\/$/, "");
  const params = buildSearchParams(keyword, options);

  return fetch(`${base}/recipes?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
};

export const searchRecipes = async (keyword, options = {}) => {
  const trimmedKeyword = keyword.trim();
  const base = (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) || "";

  if (!trimmedKeyword) {
    return normalizeSearchResponse({
      data: { Recipes: [], hasNext: false, nextCursor: null },
      message: "검색어가 비어 있습니다",
    });
  }

  if (shouldUsePublicSearchMock(base)) {
    return getMockSearchResponse();
  }

  try {
    let response = await requestSearchRecipes(trimmedKeyword, options);

    if (response.status === 401) {
      const refreshPayload = await refreshAccessToken();

      if (refreshPayload?.accessToken) {
        response = await requestSearchRecipes(trimmedKeyword, options);
      } else {
        return getMockSearchResponse();
      }
    }

    if (!response.ok) {
      throw new Error(`검색에 실패했습니다: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("검색 응답 형식이 올바르지 않습니다");
    }

    const result = await response.json();
    return normalizeSearchResponse(result);
  } catch (error) {
    console.error("searchRecipes 오류:", error);
    return getMockSearchResponse();
  }
};

export const getRecentSearches = async () => {
  try {
    const stored = localStorage.getItem("recentSearches");
    const searches = stored ? JSON.parse(stored) : DEFAULT_RECENT_SEARCHES;

    return {
      success: true,
      data: Array.isArray(searches) ? searches : DEFAULT_RECENT_SEARCHES,
      message: "최근 검색어를 불러왔습니다",
    };
  } catch (error) {
    console.error("getRecentSearches 오류:", error);
    return {
      success: true,
      data: DEFAULT_RECENT_SEARCHES,
      message: "기본 최근 검색어를 반환합니다",
    };
  }
};

export const getRecommendedSearches = async () => {
  return {
    success: true,
    data: DEFAULT_RECOMMENDED_SEARCHES,
    message: "추천 검색어를 불러왔습니다",
  };
};

export const saveRecentSearch = async (keyword) => {
  try {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      return {
        success: false,
        message: "검색어가 비어 있습니다",
      };
    }

    const stored = localStorage.getItem("recentSearches");
    const existing = stored ? JSON.parse(stored) : [];
    const searches = [
      trimmedKeyword,
      ...existing.filter((item) => item !== trimmedKeyword),
    ].slice(0, 10);

    localStorage.setItem("recentSearches", JSON.stringify(searches));

    return {
      success: true,
      data: searches,
      message: "최근 검색어를 저장했습니다",
    };
  } catch (error) {
    console.error("saveRecentSearch 오류:", error);
    return {
      success: false,
      message: "최근 검색어 저장에 실패했습니다",
    };
  }
};

export const deleteRecentSearch = async (keyword) => {
  try {
    const stored = localStorage.getItem("recentSearches");
    const existing = stored ? JSON.parse(stored) : [];
    const searches = existing.filter((item) => item !== keyword);

    localStorage.setItem("recentSearches", JSON.stringify(searches));

    return {
      success: true,
      data: searches,
      message: "최근 검색어를 삭제했습니다",
    };
  } catch (error) {
    console.error("deleteRecentSearch 오류:", error);
    return {
      success: false,
      message: "최근 검색어 삭제에 실패했습니다",
    };
  }
};

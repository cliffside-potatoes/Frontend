import { refreshAccessToken } from './tokenApi';
import { getStoredAccessToken } from '../utils/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const MOCK_SEARCH_RESULTS = [
  {
    recipeId: 1,
    title: 'Kimchi Fried Rice',
    thumbnailImage: 'https://via.placeholder.com/100',
    source: 'Home Kitchen',
    cookingTime: 15,
    difficulty: 'Easy',
    likeCount: 45,
    reviewCount: 12,
    totalIngredientCount: 8,
    matchedIngredientCount: 5,
    liked: false,
  },
  {
    recipeId: 2,
    title: 'Soy Garlic Chicken',
    thumbnailImage: 'https://via.placeholder.com/100',
    source: 'Weekend Table',
    cookingTime: 35,
    difficulty: 'Medium',
    likeCount: 82,
    reviewCount: 21,
    totalIngredientCount: 10,
    matchedIngredientCount: 4,
    liked: false,
  },
  {
    recipeId: 3,
    title: 'Cream Pasta',
    thumbnailImage: 'https://via.placeholder.com/100',
    source: 'Quick Meals',
    cookingTime: 20,
    difficulty: 'Easy',
    likeCount: 37,
    reviewCount: 9,
    totalIngredientCount: 7,
    matchedIngredientCount: 3,
    liked: false,
  },
];

const DEFAULT_RECENT_SEARCHES = ['kimchi', 'pasta', 'rice'];
const DEFAULT_RECOMMENDED_SEARCHES = [
  'easy meal',
  'lunch box',
  'low carb',
  'one pan',
  'soup',
];

const isSameOriginBase = (base) =>
  typeof window !== 'undefined' &&
  base &&
  (base.startsWith(window.location.origin) || base === window.location.origin);

const shouldUsePublicSearchMock = (base) =>
  !base || isSameOriginBase(base) || !getStoredAccessToken();

const getAuthHeader = () => {
  const token = getStoredAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeRecipeItem = (item) => ({
  recipeId: item?.recipeId ?? item?.id ?? 0,
  title: item?.title ?? item?.name ?? '',
  thumbnailImage:
    item?.thumbnailImage ??
    item?.thumbnailImageUrl ??
    item?.imageUrl ??
    item?.thumbnailUrl ??
    '',
  source: item?.source ?? item?.recipeSource ?? item?.description ?? '',
  cookingTime: item?.cookingTime ?? item?.cookTime ?? 0,
  difficulty: item?.difficulty ?? 'Easy',
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
  message: payload?.message ?? 'Search completed',
});

const getMockSearchResponse = (keyword) => {
  const trimmedKeyword = keyword.trim().toLowerCase();

  const filteredItems = trimmedKeyword
    ? MOCK_SEARCH_RESULTS.filter((item) =>
        `${item.title} ${item.source}`.toLowerCase().includes(trimmedKeyword)
      )
    : MOCK_SEARCH_RESULTS;

  return normalizeSearchResponse({
    data: {
      Recipes: filteredItems,
      hasNext: false,
      nextCursor: null,
    },
    message: 'Mock search completed',
  });
};

const buildSearchParams = (keyword, options = {}) => {
  const { size = 20, sort = 'LATEST', cursorCreatedAt, cursorId } = options;
  const params = new URLSearchParams({
    keyword,
    size: String(size),
    sort,
  });

  if (cursorCreatedAt && cursorId) {
    params.set('cursorCreatedAt', cursorCreatedAt);
    params.set('cursorId', String(cursorId));
  }

  return params;
};

const requestSearchRecipes = async (keyword, options = {}) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const params = buildSearchParams(keyword, options);

  return fetch(`${base}/recipes?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });
};

export const searchRecipes = async (keyword, options = {}) => {
  const trimmedKeyword = keyword.trim();
  const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';

  if (!trimmedKeyword) {
    return normalizeSearchResponse({
      data: { Recipes: [], hasNext: false, nextCursor: null },
      message: 'Empty keyword',
    });
  }

  if (shouldUsePublicSearchMock(base)) {
    return getMockSearchResponse(trimmedKeyword);
  }

  try {
    let response = await requestSearchRecipes(trimmedKeyword, options);

    if (response.status === 401) {
      const refreshPayload = await refreshAccessToken();

      if (refreshPayload?.accessToken) {
        response = await requestSearchRecipes(trimmedKeyword, options);
      } else {
        return getMockSearchResponse(trimmedKeyword);
      }
    }

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Search response is not JSON');
    }

    const result = await response.json();
    return normalizeSearchResponse(result);
  } catch (error) {
    console.error('searchRecipes failed:', error);
    return getMockSearchResponse(trimmedKeyword);
  }
};

export const getRecentSearches = async () => {
  try {
    const stored = localStorage.getItem('recentSearches');
    const searches = stored ? JSON.parse(stored) : DEFAULT_RECENT_SEARCHES;

    return {
      success: true,
      data: Array.isArray(searches) ? searches : DEFAULT_RECENT_SEARCHES,
      message: 'Recent searches loaded',
    };
  } catch (error) {
    console.error('getRecentSearches failed:', error);
    return {
      success: true,
      data: DEFAULT_RECENT_SEARCHES,
      message: 'Default recent searches returned',
    };
  }
};

export const getRecommendedSearches = async () => {
  return {
    success: true,
    data: DEFAULT_RECOMMENDED_SEARCHES,
    message: 'Recommended searches loaded',
  };
};

export const saveRecentSearch = async (keyword) => {
  try {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      return {
        success: false,
        message: 'Keyword is empty',
      };
    }

    const stored = localStorage.getItem('recentSearches');
    const existing = stored ? JSON.parse(stored) : [];
    const searches = [trimmedKeyword, ...existing.filter((item) => item !== trimmedKeyword)].slice(0, 10);

    localStorage.setItem('recentSearches', JSON.stringify(searches));

    return {
      success: true,
      data: searches,
      message: 'Recent search saved',
    };
  } catch (error) {
    console.error('saveRecentSearch failed:', error);
    return {
      success: false,
      message: 'Failed to save recent search',
    };
  }
};

export const deleteRecentSearch = async (keyword) => {
  try {
    const stored = localStorage.getItem('recentSearches');
    const existing = stored ? JSON.parse(stored) : [];
    const searches = existing.filter((item) => item !== keyword);

    localStorage.setItem('recentSearches', JSON.stringify(searches));

    return {
      success: true,
      data: searches,
      message: 'Recent search deleted',
    };
  } catch (error) {
    console.error('deleteRecentSearch failed:', error);
    return {
      success: false,
      message: 'Failed to delete recent search',
    };
  }
};

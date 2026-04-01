import axios from 'axios';
import { refreshAccessToken } from './tokenApi';
import {
  clearStoredAuth,
  getCurrentPath,
  getStoredAccessToken,
  savePostLoginRedirect,
} from '../utils/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const DEFAULT_CATEGORY_COLOR = '#90CAF9';

const COLOR_ENUM_HEX = {
  RED: '#EF4444',
  BLUE: '#3B82F6',
  GREEN: '#22C55E',
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handle401 = () => {
  alert('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
  savePostLoginRedirect(getCurrentPath());
  clearStoredAuth();
  window.location.href = '/signin';
};

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshPayload = await refreshAccessToken();

        if (!refreshPayload?.accessToken) {
          handle401();
          return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${refreshPayload.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('fridgeApi 토큰 재발급 실패:', refreshError);
        handle401();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const isHexColor = (value) =>
  typeof value === 'string' &&
  /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());

const normalizeStorageType = (value) => {
  const normalized = String(value ?? '').trim().toUpperCase();

  if (normalized === 'FREEZER' || normalized === 'FROZEN') return 'FROZEN';
  if (
    normalized === 'FRIDGE' ||
    normalized === 'REFRIGERATOR' ||
    normalized === 'REFRIGERATED'
  ) {
    return 'REFRIGERATED';
  }

  return 'REFRIGERATED';
};

const toLegacyLocation = (storageType) =>
  normalizeStorageType(storageType) === 'FROZEN' ? 'FREEZER' : 'FRIDGE';

const toResponseData = (response) => response?.data?.data ?? response?.data ?? null;

const uniqueByJson = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const rgbFromHex = (hex) => {
  const trimmed = hex.replace('#', '');
  const normalized =
    trimmed.length === 3
      ? trimmed
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : trimmed;

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
};

const colorDistance = (a, b) =>
  (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;

const toNearestColorEnum = (value) => {
  const normalized = String(value ?? '').trim().toUpperCase();

  if (COLOR_ENUM_HEX[normalized]) {
    return normalized;
  }

  if (!isHexColor(value)) {
    return 'GREEN';
  }

  const target = rgbFromHex(value.trim().toUpperCase());

  return Object.entries(COLOR_ENUM_HEX).reduce(
    (best, [colorEnum, colorHex]) => {
      const distance = colorDistance(target, rgbFromHex(colorHex));
      if (distance < best.distance) {
        return { colorEnum, distance };
      }
      return best;
    },
    { colorEnum: 'GREEN', distance: Number.POSITIVE_INFINITY }
  ).colorEnum;
};

const shouldRetryWithFallback = (error, fallbackStatuses) => {
  const status = error?.response?.status;
  return status != null && fallbackStatuses.includes(status);
};

const runWithFallback = async (requestFactories, fallbackStatuses = [404, 405]) => {
  let lastError = null;

  for (let index = 0; index < requestFactories.length; index += 1) {
    try {
      return await requestFactories[index]();
    } catch (error) {
      lastError = error;

      if (
        index === requestFactories.length - 1 ||
        !shouldRetryWithFallback(error, fallbackStatuses)
      ) {
        throw error;
      }
    }
  }

  throw lastError;
};

const buildCategoryPayloads = ({ name, color, location, storageType }) => {
  const normalizedStorageType = normalizeStorageType(storageType ?? location);
  const trimmedName = String(name ?? '').trim();
  const colorCandidates = uniqueByJson(
    [color, toNearestColorEnum(color), DEFAULT_CATEGORY_COLOR]
      .filter(Boolean)
      .map((item) => String(item).trim())
  );

  const payloads = colorCandidates.flatMap((candidateColor) => [
    {
      name: trimmedName,
      color: candidateColor,
      storageType: normalizedStorageType,
    },
    {
      name: trimmedName,
      color: candidateColor,
      location: toLegacyLocation(normalizedStorageType),
    },
  ]);

  return uniqueByJson(payloads);
};

const buildIngredientPayloads = ({ categoryId, ingredientId, ingredientName, name }) => {
  const numericCategoryId = Number(categoryId);
  const resolvedName = String(ingredientName ?? name ?? '').trim();
  const payloads = [];

  if (Number.isFinite(numericCategoryId) && ingredientId != null) {
    payloads.push({
      categoryId: numericCategoryId,
      ingredientId: Number(ingredientId),
    });
  }

  if (Number.isFinite(numericCategoryId) && resolvedName) {
    payloads.push({
      categoryId: numericCategoryId,
      ingredientName: resolvedName,
    });
    payloads.push({
      categoryId: numericCategoryId,
      name: resolvedName,
    });
  }

  return uniqueByJson(payloads);
};

const normalizeIngredient = (item, fallbackColor = DEFAULT_CATEGORY_COLOR) => {
  const id =
    item?.fridgeIngredientId ??
    item?.ingredientId ??
    item?.id ??
    item?.fridgeItemId ??
    '';

  const label =
    item?.ingredientName ??
    item?.name ??
    item?.label ??
    '';

  return {
    id: String(id),
    ingredientId: item?.ingredientId ?? item?.id ?? null,
    label,
    color: item?.color ?? fallbackColor,
  };
};

const normalizeCategory = (category, fallbackStorageType) => {
  const id = category?.categoryId ?? category?.id ?? '';
  const color = category?.color ?? DEFAULT_CATEGORY_COLOR;

  return {
    id: String(id),
    label: category?.categoryName ?? category?.name ?? category?.label ?? '',
    color,
    location: normalizeStorageType(
      category?.storageType ?? category?.location ?? fallbackStorageType
    ),
    order: category?.categoryOrder ?? category?.order ?? 0,
    ingredients: Array.isArray(category?.ingredients)
      ? category.ingredients.map((item) => normalizeIngredient(item, color))
      : [],
  };
};

const normalizeFridgeData = (payload) => {
  const rawSections = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.sections)
      ? payload.sections
      : null;

  let sections = [];

  if (rawSections) {
    sections = rawSections.map((section) => {
      const storageType = normalizeStorageType(section?.storageType);
      const categories = Array.isArray(section?.categories)
        ? section.categories.map((category) => normalizeCategory(category, storageType))
        : [];

      return {
        storageType,
        categories: categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      };
    });
  } else {
    const rawCategories = Array.isArray(payload?.categories)
      ? payload.categories
      : Array.isArray(payload)
        ? payload
        : [];

    const sectionMap = new Map();

    rawCategories.forEach((category) => {
      const normalizedCategory = normalizeCategory(category);
      const storageType = normalizedCategory.location;

      if (!sectionMap.has(storageType)) {
        sectionMap.set(storageType, []);
      }

      sectionMap.get(storageType).push(normalizedCategory);
    });

    sections = Array.from(sectionMap.entries()).map(([storageType, categories]) => ({
      storageType,
      categories: categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }));
  }

  const categories = sections
    .flatMap((section) => section.categories)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return {
    sections,
    categories,
  };
};

const normalizeSuggestion = (item) => {
  if (typeof item === 'string') {
    return {
      ingredientId: null,
      ingredientName: item,
      label: item,
    };
  }

  const ingredientId = item?.ingredientId ?? item?.id ?? null;
  const ingredientName =
    item?.ingredientName ??
    item?.name ??
    item?.label ??
    '';

  return {
    ingredientId,
    ingredientName,
    label: ingredientName,
  };
};

export const fridgeApi = {
  getMyFridge: async () => {
    const response = await runWithFallback(
      [
        () => apiClient.get('/me/ingredients'),
        () => apiClient.get('/ingredients/me'),
      ],
      [404, 405]
    );

    return normalizeFridgeData(toResponseData(response));
  },

  searchIngredients: async (query) => {
    const trimmedQuery = String(query ?? '').trim();
    if (!trimmedQuery) return [];

    const response = await runWithFallback(
      [
        () =>
          apiClient.get('/ingredients/suggestions', {
            params: { query: trimmedQuery },
          }),
        () =>
          apiClient.get('/ingredients/search', {
            params: { name: trimmedQuery },
          }),
      ],
      [400, 404, 405]
    );

    const payload = toResponseData(response);
    const rawItems = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.suggestions)
        ? payload.suggestions
        : Array.isArray(payload)
          ? payload
          : [];

    return rawItems
      .map(normalizeSuggestion)
      .filter((item) => item.label && (item.ingredientId != null || item.ingredientName));
  },

  createCategory: async (input) => {
    const payloads = buildCategoryPayloads(input);

    const response = await runWithFallback(
      payloads.map((payload) => () => apiClient.post('/ingredients/categories', payload)),
      [400, 404, 405, 422]
    );

    return toResponseData(response);
  },

  updateCategory: async (id, input) => {
    const payloads = buildCategoryPayloads(input).map((payload) => {
      const nextPayload = {};

      if (payload.name) nextPayload.name = payload.name;
      if (payload.color) nextPayload.color = payload.color;
      if (payload.storageType) nextPayload.storageType = payload.storageType;
      if (payload.location) nextPayload.location = payload.location;

      return nextPayload;
    });

    const response = await runWithFallback(
      payloads.map(
        (payload) => () => apiClient.patch(`/ingredients/categories/${id}`, payload)
      ),
      [400, 404, 405, 422]
    );

    return toResponseData(response);
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/ingredients/categories/${id}`);
    return toResponseData(response);
  },

  reorderCategories: async ({ storageType, orders }) => {
    const payloads = [
      {
        storageType: normalizeStorageType(storageType),
        orders,
      },
      {
        location: toLegacyLocation(storageType),
        orders,
      },
    ];

    const response = await runWithFallback(
      [
        () => apiClient.put('/ingredients/categories/order', payloads[0]),
        () => apiClient.put('/ingredients/categories/reorder', payloads[1]),
      ],
      [400, 404, 405, 422]
    );

    return toResponseData(response);
  },

  addIngredient: async (input) => {
    const payloads = buildIngredientPayloads(input);

    const response = await runWithFallback(
      payloads.map((payload) => () => apiClient.post('/ingredients', payload)),
      [400, 404, 405, 422]
    );

    return toResponseData(response);
  },

  updateIngredient: async (id, input) => {
    const payloads = buildIngredientPayloads(input);

    const response = await runWithFallback(
      payloads.map((payload) => () => apiClient.patch(`/ingredients/${id}`, payload)),
      [400, 404, 405, 422]
    );

    return toResponseData(response);
  },

  deleteIngredient: async (id) => {
    const response = await apiClient.delete(`/ingredients/${id}`);
    return toResponseData(response);
  },

  getRecommendedRecipes: (params = {}) => {
    const {
      sort = 'MATCH_COUNT',
      size = 3,
      cursorMatchCount,
      cursorId,
      keyword,
    } = params;

    return apiClient.get('/recipes', {
      params: {
        sort,
        size,
        ...(keyword != null && keyword !== '' ? { keyword } : {}),
        ...(cursorMatchCount != null && cursorId != null
          ? { cursorMatchCount, cursorId }
          : {}),
      },
    });
  },
};

export default fridgeApi;

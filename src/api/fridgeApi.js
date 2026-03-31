import axios from 'axios';
import { refreshAccessToken } from './tokenApi';
import {
  clearStoredAuth,
  getCurrentPath,
  getStoredAccessToken,
  savePostLoginRedirect,
} from '../utils/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
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

        const newAccessToken = refreshPayload.accessToken;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

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

const toStorageType = (value) => {
  if (value === 'FREEZER' || value === 'FROZEN') return 'FROZEN';
  return 'REFRIGERATED';
};

const toCategoryColor = (value) => {
  if (value === 'RED' || value === 'BLUE' || value === 'GREEN') return value;
  return 'GREEN';
};

export const fridgeApi = {
  // 내 냉장고 조회
  getMyFridge: () => apiClient.get('/me/ingredients'),

  // 재료 자동완성
  searchIngredients: (query) =>
    apiClient.get('/ingredients/suggestions', {
      params: { query },
    }),

  // 카테고리 생성
  createCategory: ({ name, color, location, storageType }) =>
    apiClient.post('/ingredients/categories', {
      name,
      color: toCategoryColor(color),
      storageType: toStorageType(storageType ?? location),
    }),

  // 카테고리 수정
  updateCategory: (id, { name, color, location, storageType }) =>
    apiClient.patch(`/ingredients/categories/${id}`, {
      ...(name ? { name } : {}),
      ...(color ? { color: toCategoryColor(color) } : {}),
      ...((storageType || location)
        ? { storageType: toStorageType(storageType ?? location) }
        : {}),
    }),

  // 카테고리 삭제
  deleteCategory: (id) => apiClient.delete(`/ingredients/categories/${id}`),

  // 카테고리 순서 변경
  reorderCategories: ({ storageType, orders }) =>
    apiClient.put('/ingredients/categories/order', {
      storageType: toStorageType(storageType),
      orders,
    }),

  // 재료 추가
  addIngredient: ({ categoryId, ingredientId }) =>
    apiClient.post('/ingredients', {
      categoryId,
      ingredientId,
    }),

  // 재료 수정
  updateIngredient: (id, { categoryId, ingredientId }) =>
    apiClient.patch(`/ingredients/${id}`, {
      ...(categoryId != null ? { categoryId } : {}),
      ...(ingredientId != null ? { ingredientId } : {}),
    }),

  // 재료 삭제
  deleteIngredient: (id) => apiClient.delete(`/ingredients/${id}`),
};

export default fridgeApi;
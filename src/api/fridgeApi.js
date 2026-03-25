import axios from 'axios';
import {
  clearStoredAuth,
  getCurrentPath,
  savePostLoginRedirect,
} from '../utils/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const redirectToSignIn = () => {
  savePostLoginRedirect(getCurrentPath());
  clearStoredAuth();
  alert('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
  window.location.href = '/signin';
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/oauth/token`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshRes.ok) {
          redirectToSignIn();
          return Promise.reject(error);
        }

        const refreshData = await refreshRes.json();
        const newAccessToken =
          refreshData?.data?.accessToken ?? refreshData?.accessToken ?? '';

        if (!newAccessToken) {
          redirectToSignIn();
          return Promise.reject(error);
        }

        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        redirectToSignIn();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const fridgeApi = {
  createCategory: (data) => apiClient.post('/ingredients/categories', data),

  updateCategory: (id, data) => apiClient.patch(`/ingredients/categories/${id}`, data),

  deleteCategory: (id) => apiClient.delete(`/ingredients/categories/${id}`),

  reorderCategories: (data) => apiClient.put('/ingredients/categories/reorder', data),

  getMyFridge: () => apiClient.get('/ingredients/me'),

  searchIngredients: (keyword) => apiClient.get(`/ingredients/search?name=${keyword}`),

  addIngredient: (data) => apiClient.post('/ingredients', data),

  updateIngredient: (id, data) => apiClient.patch(`/ingredients/${id}`, data),

  deleteIngredient: (id) => apiClient.delete(`/ingredients/${id}`),

  getRecommendedRecipes: (params = {}) => {
    const { sort = 'MATCH_COUNT', size = 3 } = params;
    return apiClient.get(`/recipes/recommend?sort=${sort}&size=${size}`);
  },
};

export default fridgeApi;

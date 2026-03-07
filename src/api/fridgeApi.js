import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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

export const fridgeApi = {
    // --- 카테고리 관련 ---
    // 카테고리 생성 (POST)
    createCategory: (data) => apiClient.post('/ingredients/categories', data),

    // 카테고리 수정 (PATCH)
    updateCategory: (id, data) => apiClient.patch(`/ingredients/categories/${id}`, data),

    // 카테고리 삭제 (DELETE)
    deleteCategory: (id) => apiClient.delete(`/ingredients/categories/${id}`),

    // 카테고리 순서 수정 (PUT)
    reorderCategories: (data) => apiClient.put('/ingredients/categories/reorder', data),

    // --- 식재료 관련 ---
    // 내 냉장고 재료 조회 (GET)
    getMyFridge: () => apiClient.get('/ingredients/me'),

    // 재료 연관 검색 조회 (GET)
    searchIngredients: (keyword) => apiClient.get(`/ingredients/search?name=${keyword}`),

    // 재료 생성/추가 (POST)
    addIngredient: (data) => apiClient.post('/ingredients', data),

    // 재료 수정 (PATCH)
    updateIngredient: (id, data) => apiClient.patch(`/ingredients/${id}`, data),

    // 재료 삭제 (DELETE)
    deleteIngredient: (id) => apiClient.delete(`/ingredients/${id}`),

    // --- 레시피 관련 ---
    // 내 냉장고 매칭 레시피 추천 조회 (GET)
    getRecommendedRecipes: () => apiClient.get('/recipes/recommend'),
};

export default fridgeApi;

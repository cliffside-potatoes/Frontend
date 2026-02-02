// 백엔드 API URL 설정 (import.meta 미지원 환경 방어)
let API_BASE_URL = 'http://localhost:8080/api';
try {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    API_BASE_URL = import.meta.env.VITE_API_URL;
  }
} catch (_) {
  // ignore
}

// Mock 데이터 사용 여부 (실제 API 준비되면 false로 변경)
const USE_MOCK_DATA = false;

// ==================== Mock 데이터 ====================
const MOCK_SEARCH_RESULTS = [
  { 
    recipeId: 1, 
    title: '맛있는 비빔밥', 
    thumbnailImage: 'https://via.placeholder.com/100',
    source: '백종원의 요리비책',
    cookingTime: 30, 
    difficulty: '초보', 
    likeCount: 45,
    reviewCount: 120,
    totalIngredientCount: 8,
    matchedIngredientCount: 5,
    liked: false
  },
  { 
    recipeId: 2, 
    title: '얼큰한 김치찌개', 
    thumbnailImage: 'https://via.placeholder.com/100',
    source: '유튜브 - 릴리쿡',
    cookingTime: 40, 
    difficulty: '초보', 
    likeCount: 120,
    reviewCount: 200,
    totalIngredientCount: 6,
    matchedIngredientCount: 4,
    liked: false
  },
  { 
    recipeId: 3, 
    title: '크림 파스타', 
    thumbnailImage: 'https://via.placeholder.com/100',
    source: '만개의 레시피',
    cookingTime: 25, 
    difficulty: '중급', 
    likeCount: 89,
    reviewCount: 80,
    totalIngredientCount: 7,
    matchedIngredientCount: 3,
    liked: false
  },
];

const MOCK_RECENT_SEARCHES = ['비빔밥', '김치찌개', '파스타'];
const MOCK_RECOMMENDED_SEARCHES = ['간단 요리', '샐러드', '한식', '중식', '양식'];

// ==================== API 함수들 ====================

/**
 * 레시피 검색 API (무한 스크롤 지원)
 * @param {string} keyword - 검색 키워드
 * @param {Object} options - 검색 옵션
 * @param {number} options.size - 한 번에 조회할 개수 (기본값: 20)
 * @param {string} options.sort - 정렬 방식 (LATEST, LIKES 등, 기본값: LATEST)
 * @param {string} options.cursorCreatedAt - 마지막 조회한 레시피의 생성 시각
 * @param {number} options.cursorId - 마지막 조회한 레시피의 ID
 * @returns {Promise<Object>} 검색 결과 { recipes, hasNext, nextCursor }
 */
export const searchRecipes = async (keyword, options = {}) => {
  const {
    size = 20,
    sort = 'LATEST',
    cursorCreatedAt,
    cursorId
  } = options;

  if (USE_MOCK_DATA) {
    // Mock 데이터 사용 (로딩 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const filtered = MOCK_SEARCH_RESULTS.filter(item => 
      item.title.includes(keyword)
    );

    return {
      success: true,
      data: {
        Recipes: filtered,
        hasNext: false,
        nextCursor: null
      },
      message: '검색 성공'
    };
  }

  // 실제 API 호출
  try {
    // Query String 생성
    const params = new URLSearchParams({
      keyword,
      size: size.toString(),
      sort
    });

    // 커서가 있으면 추가 (무한 스크롤 시)
    if (cursorCreatedAt && cursorId) {
      params.append('cursorCreatedAt', cursorCreatedAt);
      params.append('cursorId', cursorId.toString());
    }

    const response = await fetch(`${API_BASE_URL}/recipes?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 인증 토큰이 필요한 경우
        // 'Authorization': `Bearer ${getToken()}`
      },
    });

    if (!response.ok) {
      throw new Error(`검색 실패: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('검색 API 오류:', error);
    throw error;
  }
};

/**
 * 최근 검색어 조회 (로컬 스토리지 사용)
 * @returns {Promise<Object>} 최근 검색어 목록
 */
export const getRecentSearches = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const stored = localStorage.getItem('recentSearches');
    const searches = stored ? JSON.parse(stored) : MOCK_RECENT_SEARCHES;
    
    return {
      success: true,
      data: searches,
      message: '최근 검색어 조회 성공'
    };
  } catch (error) {
    console.error('최근 검색어 조회 오류:', error);
    return {
      success: true,
      data: MOCK_RECENT_SEARCHES,
      message: '기본 검색어 반환'
    };
  }
};

/**
 * 추천 검색어 조회 (로컬 데이터 사용)
 * @returns {Promise<Object>} 추천 검색어 목록
 */
export const getRecommendedSearches = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 추천 검색어는 고정값 사용
    return {
      success: true,
      data: MOCK_RECOMMENDED_SEARCHES,
      message: '추천 검색어 조회 성공'
    };
  } catch (error) {
    console.error('추천 검색어 조회 오류:', error);
    return {
      success: true,
      data: MOCK_RECOMMENDED_SEARCHES,
      message: '기본 추천 검색어 반환'
    };
  }
};

/**
 * 최근 검색어 저장 (로컬 스토리지 사용)
 * @param {string} keyword - 저장할 검색어
 * @returns {Promise<Object>} 저장 결과
 */
export const saveRecentSearch = async (keyword) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const stored = localStorage.getItem('recentSearches');
    let searches = stored ? JSON.parse(stored) : [];
    
    // 중복 제거
    searches = searches.filter(item => item !== keyword);
    
    // 맨 앞에 추가
    searches.unshift(keyword);
    
    // 최대 10개까지만 저장
    searches = searches.slice(0, 10);
    
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    
    return {
      success: true,
      message: '검색어 저장 성공'
    };
  } catch (error) {
    console.error('검색어 저장 오류:', error);
    return {
      success: false,
      message: '검색어 저장 실패'
    };
  }
};

/**
 * 최근 검색어 삭제 (로컬 스토리지 사용)
 * @param {string} keyword - 삭제할 검색어
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteRecentSearch = async (keyword) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const stored = localStorage.getItem('recentSearches');
    let searches = stored ? JSON.parse(stored) : [];
    
    // 해당 검색어 제거
    searches = searches.filter(item => item !== keyword);
    
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    
    return {
      success: true,
      message: '검색어 삭제 성공'
    };
  } catch (error) {
    console.error('검색어 삭제 오류:', error);
    return {
      success: false,
      message: '검색어 삭제 실패'
    };
  }
};

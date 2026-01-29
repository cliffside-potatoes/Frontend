import React from 'react';
import BottomNav from '../../components/common/BottomNav';
import RecipeCard from '../../components/card/RecipeCard';
import { RECIPE_CATEGORIES } from '../../constants/categories';
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './MainPage.css';

const MainPage = () => {
  // 더미 데이터 (백엔드 API 연동 전 임시 데이터)
  const recipes = [
    {
      recipeId: 1,
      title: '김치찌개',
      thumbnailImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop',
      source: '유튜브 - 릴리쿡',
      cookingTime: 30,
      difficulty: '초보',
      likeCount: 6,
      reviewCount: 8,
      totalIngredientCount: 7,
      matchedIngredientCount: 4,
      liked: false,
    },
    {
      recipeId: 2,
      title: '된장찌개',
      thumbnailImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
      source: '만개의레시피',
      cookingTime: 25,
      difficulty: '초보',
      likeCount: 12,
      reviewCount: 15,
      totalIngredientCount: 6,
      matchedIngredientCount: 6,
      liked: true,
    },
    {
      recipeId: 3,
      title: '제육볶음',
      thumbnailImage: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop',
      source: '백종원의 요리비책',
      cookingTime: 20,
      difficulty: '중급',
      likeCount: 24,
      reviewCount: 18,
      totalIngredientCount: 8,
      matchedIngredientCount: 5,
      liked: false,
    },
    {
      recipeId: 4,
      title: '계란볶음밥',
      thumbnailImage: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop',
      source: '쿡쿡TV',
      cookingTime: 10,
      difficulty: '초보',
      likeCount: 8,
      reviewCount: 5,
      totalIngredientCount: 4,
      matchedIngredientCount: 3,
      liked: false,
    },
  ];

  return (
    <div className="main-page">
      {/* 상단 헤더 영역 */}
      <header className="main-header">
        <div className="header-top">
          <div className="tomato-icon">
            <img
              src={naengGuIcon}
              alt="냉구"
              className="tomato-image"
            />
          </div>
          <div className="search-bar">
            <input type="text" placeholder="검색" className="search-input" />
            <span className="search-icon">🔍</span>
          </div>
        </div>
        <h1 className="main-title">내 냉장고</h1>
        <p className="header-description">
          👀 현재 냉장고에 있는 재료를 채워봐요!
        </p>
        <p className="header-description">
          재료를 이용해서 만들 수 있는 레시피들을 추천해 줍니다
        </p>
        <button className="fill-refrigerator-btn">
          <span>🍲</span>
          냉장고 채우러 가기
          <span>&gt;</span>
        </button>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="main-content">
        {/* 상황별 레시피 추천 */}
        <section className="recipe-section">
          <h2 className="section-title">상황별 레시피 추천</h2>
          <div className="category-grid">
            {RECIPE_CATEGORIES.map((category) => (
              <div key={category.id} className="category-item">
                <div className="category-icon">{category.icon}</div>
                <span className="category-label">{category.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 내 냉장고 레시피 추천 */}
        <section className="recipe-section">
          <h2 className="section-title">내 냉장고 레시피 추천</h2>
          <div className="recipe-list">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.recipeId} recipe={recipe} />
            ))}
          </div>
        </section>
      </main>

      {/* 하단 네비게이션 바 */}
      <BottomNav />
    </div>
  );
};

export default MainPage;

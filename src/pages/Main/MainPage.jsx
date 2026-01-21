import React from 'react';
import BottomNav from '../../components/common/BottomNav';
import RecipeCard from '../../components/card/RecipeCard';
import { RECIPE_CATEGORIES } from '../../constants/categories';
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './MainPage.css';

const MainPage = () => {


    const recipes = [

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
              <RecipeCard key={recipe.id} recipe={recipe} />
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import RecipeCard from '../../components/card/RecipeCard';
import Modal from '../../components/ui/Modal';
import { useUser } from '../../context/UserContext';
import { RECIPE_CATEGORIES } from '../../constants/categories';
import { fridgeApi } from '../../api/fridgeApi';
import { getPopularRecipes } from '../../api/recipeApi';
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isInitializing } = useUser();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      setRecipesLoading(true);
      try {
        const [popular] = await Promise.all([
          getPopularRecipes({ size: 10 }),
        ]);
        setPopularRecipes(popular);
      } catch (error) {
        console.error('레시피 조회 실패:', error);
      } finally {
        setRecipesLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || isInitializing) return;

    const fetchMatched = async () => {
      try {
        const res = await fridgeApi.getRecommendedRecipes();
        const data = res.data?.data ?? res.data ?? [];
        setMatchedRecipes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('내 냉장고 매칭 레시피 조회 실패:', error);
      }
    };

    fetchMatched();
  }, [isLoggedIn, isInitializing]);

  const handleFillRefrigeratorClick = () => {
    if (isInitializing) {
      alert('로그인 확인 중이야. 잠깐만 다시 눌러줘!');
      return;
    }

    if (isLoggedIn) {
      navigate('/refrigerator');
    } else {
      setShowLoginModal(true);
    }
  };

  const displayedRecipes = isLoggedIn && matchedRecipes.length > 0 ? matchedRecipes : popularRecipes;

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <div className="main-page">
      {/* 상단 헤더 영역 */}
      <header className="main-header">
        <div className="header-top">
          <div className="tomato-icon">
            <img src={naengGuIcon} alt="냉구" className="tomato-image" />
          </div>

          <div className="search-bar" onClick={handleSearchClick} style={{ cursor: 'pointer' }}>
            <input type="text" placeholder="검색" className="search-input" readOnly />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <h1 className="main-title">내 냉장고</h1>

        <p className="header-description">👀 현재 냉장고에 있는 재료를 채워봐요!</p>
        <p className="header-description">재료를 이용해서 만들 수 있는 레시피들을 추천해 줍니다</p>

        <button type="button" className="fill-refrigerator-btn" onClick={handleFillRefrigeratorClick}>
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

        {/* 내 냉장고 레시피 추천 / 인기 레시피 */}
        <section className="recipe-section">
          <h2 className="section-title">
            {isLoggedIn && matchedRecipes.length > 0 ? '내 냉장고 레시피 추천' : '인기 레시피'}
          </h2>
          {recipesLoading ? (
            <p style={{ padding: '16px', color: '#888' }}>레시피 불러오는 중...</p>
          ) : (
            <div className="recipe-list">
              {displayedRecipes.map((recipe) => (
                <RecipeCard key={recipe.recipeId} recipe={recipe} />
              ))}
              {displayedRecipes.length === 0 && (
                <p style={{ padding: '16px', color: '#888' }}>추천 레시피가 없어요</p>
              )}
            </div>
          )}
        </section>
      </main>

      {/* 하단 네비게이션 바 */}
      <BottomNav />

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="로그인 이후 이용해주세요"
        description="더 많은 기능을 이용할 수 있어요!"
        cancelLabel="취소"
        confirmLabel="로그인"
        onCancel={() => setShowLoginModal(false)}
        onConfirm={() => {
          setShowLoginModal(false);
          navigate('/signin');
        }}
        variant="login"
      />
    </div>
  );
};

export default MainPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import RecipeCard from '../../components/card/RecipeCard';
import Modal from '../../components/ui/Modal';
import { useUser } from '../../context/UserContext';
import { RECIPE_CATEGORIES } from '../../constants/categories';
import { fridgeApi } from '../../api/fridgeApi';
import { getPopularRecipes } from '../../api/recipeApi';
import { hasStoredAccessToken } from '../../utils/authStorage';
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './MainPage.css';

const normalizeRecipe = (item) => ({
  recipeId: item?.recipeId ?? item?.id ?? 0,
  title: item?.title ?? item?.name ?? '레시피',
  thumbnailImage:
    item?.thumbnailImage ??
    item?.thumbnailImageUrl ??
    item?.imageUrl ??
    item?.thumbnailUrl ??
    '',
  source: item?.source ?? item?.recipeSource ?? '출처 없음',
  cookingTime: item?.cookingTime ?? item?.cookTime ?? 0,
  difficulty: item?.difficulty ?? '초보',
  likeCount: item?.likeCount ?? 0,
  reviewCount: item?.reviewCount ?? 0,
  totalIngredientCount: item?.totalIngredientCount ?? 0,
  matchedIngredientCount: item?.matchedIngredientCount ?? 0,
  liked: item?.liked ?? false,
});

const MainPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isInitializing } = useUser();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);

  useEffect(() => {
    if (!hasStoredAccessToken()) {
      setPopularRecipes([]);
      setRecipesLoading(false);
      return;
    }

    const fetchRecipes = async () => {
      setRecipesLoading(true);
      try {
        const popular = await getPopularRecipes({ size: 10 });
        setPopularRecipes(Array.isArray(popular) ? popular : []);
      } catch (error) {
        console.error('레시피 조회 실패:', error);
        setPopularRecipes([]);
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
        const res = await fridgeApi.getRecommendedRecipes({
          sort: 'MATCH_COUNT',
          size: 3,
        });

        const data = res.data?.data?.Recipes ?? res.data?.Recipes ?? [];
        const normalized = Array.isArray(data) ? data.map(normalizeRecipe) : [];
        setMatchedRecipes(normalized);
      } catch (error) {
        console.error('내 냉장고 매칭 레시피 조회 실패:', error);
        setMatchedRecipes([]);
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

  const displayedRecipes =
    isLoggedIn && matchedRecipes.length > 0 ? matchedRecipes : popularRecipes;

  const sectionTitle =
    isLoggedIn && matchedRecipes.length > 0
      ? '내 냉장고 레시피 추천'
      : '인기 레시피';

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <div className="main-page">
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

      <main className="main-content">
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

        <section className="recipe-section">
          <h2 className="section-title">{sectionTitle}</h2>

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

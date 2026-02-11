import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import RecipeCard from '../../components/card/RecipeCard';
import './RecipeSavedPage.css';

const MOCK_SAVED_RECIPES = [
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
    liked: true,
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
];

const RecipeSavedPage = () => {
  const navigate = useNavigate();
  const recipes = MOCK_SAVED_RECIPES;

  const handleBack = () => navigate(-1);

  return (
    <div className="recipe-saved-page">
      <header className="recipe-saved-header">
        <button type="button" className="rsp-header__back" onClick={handleBack} aria-label="뒤로가기">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="rsp-header__title">저장</h1>
        <div className="rsp-header__spacer" />
      </header>

      <main className="recipe-saved-main">
        {recipes.length > 0 ? (
          <div className="recipe-saved-list">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.recipeId} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="recipe-saved-empty">
            <span className="material-symbols-outlined rsp-empty-icon">bookmark</span>
            <p className="rsp-empty-text">저장한 레시피가 없어요</p>
            <p className="rsp-empty-sub">찜한 레시피가 여기에 모여요</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default RecipeSavedPage;

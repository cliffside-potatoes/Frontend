import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/common/BottomNav";
import RecipeCard from "../../components/card/RecipeCard";
import "./MyRecipesPage.css";

const MyRecipesPage = () => {
  const navigate = useNavigate();
  const recipes = MOCK_MY_RECIPES;

  const handleBack = () => navigate(-1);

  return (
    <div className="my-recipes-page">
      <header className="my-recipes-header">
        <button
          type="button"
          className="mrp-header__back"
          onClick={handleBack}
          aria-label="뒤로가기"
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="mrp-header__title">내가 쓴 레시피</h1>
        <div className="mrp-header__spacer" />
      </header>

      <main className="my-recipes-main">
        {recipes.length > 0 ? (
          <div className="my-recipes-list">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.recipeId} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="my-recipes-empty">
            <span className="material-symbols-outlined mrp-empty-icon">
              edit_note
            </span>
            <p className="mrp-empty-text">아직 작성한 레시피가 없어요</p>
            <p className="mrp-empty-sub">레시피를 작성해보세요!</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default MyRecipesPage;

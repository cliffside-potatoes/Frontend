import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toImageUrl } from '../../utils/imageUrl';
import './SearchResultsList.css';

const RecipeCardSmall = ({ recipe, onClick }) => {
  if (!recipe) return null;

  const id = recipe.recipeId ?? recipe.id;
  const imageUrl = toImageUrl(
    recipe.thumbnailImage ??
      recipe.thumbnailUrl ??
      recipe.imageUrl ??
      ''
  );
  const title = recipe.title ?? '';
  const description = recipe.source ?? recipe.description ?? '';
  const time =
    recipe.cookingTime != null ? `${recipe.cookingTime}분` : recipe.time ?? '';
  const difficulty = recipe.difficulty ?? '';
  const likeCount = recipe.likeCount ?? recipe.rating ?? 0;
  const reviewCount = recipe.reviewCount ?? recipe.reviews ?? 0;
  const totalIngredientCount = recipe.totalIngredientCount ?? 0;
  const matchedIngredientCount = recipe.matchedIngredientCount ?? 0;
  const showIngredientsStatus = totalIngredientCount > 0;
  const isComplete =
    showIngredientsStatus && matchedIngredientCount === totalIngredientCount;

  return (
    <button
      type="button"
      className="recipe-card-small"
      onClick={() => onClick?.(id)}
      disabled={!id}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={title} />
      ) : (
        <div className="recipe-card-small__image-placeholder" aria-hidden="true" />
      )}
      <div className="recipe-info">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="recipe-meta">
          <span>⏱ {time}</span>
          <span>난이도 {difficulty}</span>
          <span>❤️ {likeCount} · 💬 {reviewCount}</span>
        </div>
        {showIngredientsStatus && (
          <p
            className={`ingredients-status ${isComplete ? 'complete' : 'incomplete'}`}
          >
            내 냉장고 재료상황 ({matchedIngredientCount}/{totalIngredientCount})
          </p>
        )}
      </div>
    </button>
  );
};

const SearchResultsList = ({ results }) => {
  const navigate = useNavigate();
  const list = Array.isArray(results) ? results.filter(Boolean) : [];

  const handleMoveToRecipe = (recipeId) => {
    if (!recipeId) return;
    navigate(`/recipe/${recipeId}`);
  };

  if (list.length === 0) {
    return <p className="no-results">검색 결과가 없습니다.</p>;
  }

  return (
    <div className="search-results-list-container">
      <div className="result-summary">
        <span>{list.length}개</span>
        <span className="sort-option">정확도순</span>
      </div>
      <div className="recipe-list">
        {list.map((recipe, index) => (
          <RecipeCardSmall
            key={recipe.recipeId ?? recipe.id ?? index}
            recipe={recipe}
            onClick={handleMoveToRecipe}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResultsList;

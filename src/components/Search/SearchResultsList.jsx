import React from 'react';
import './SearchResultsList.css';

// API 필드: recipeId, title, thumbnailImage, source, cookingTime, difficulty, likeCount, reviewCount
const RecipeCardSmall = ({ recipe }) => {
  if (!recipe) return null;
  const id = recipe.recipeId ?? recipe.id;
  const imageUrl = recipe.thumbnailImage ?? recipe.imageUrl ?? '';
  const title = recipe.title ?? '';
  const description = recipe.source ?? recipe.description ?? '';
  const time = recipe.cookingTime != null ? `${recipe.cookingTime}분` : (recipe.time ?? '');
  const difficulty = recipe.difficulty ?? '';
  const likeCount = recipe.likeCount ?? recipe.rating ?? 0;
  const reviewCount = recipe.reviewCount ?? recipe.reviews ?? 0;

  return (
    <div className="recipe-card-small">
      <img src={imageUrl} alt={title} />
      <div className="recipe-info">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="recipe-meta">
          <span>⏱️ {time}</span>
          <span>난이도: {difficulty}</span>
          <span>❤️ {likeCount} · 💬 {reviewCount}</span>
        </div>
      </div>
    </div>
  );
};

const SearchResultsList = ({ results }) => {
  const list = Array.isArray(results) ? results.filter(Boolean) : [];

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
          <RecipeCardSmall key={recipe.recipeId ?? recipe.id ?? index} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default SearchResultsList;

import React from 'react';
import './SearchResultsList.css';
// RecipeCard 컴포넌트를 재사용하거나 여기에 직접 구현할 수 있습니다.
// 일단은 간단한 카드 형태로 구현하겠습니다.

const RecipeCardSmall = ({ recipe }) => (
  <div className="recipe-card-small">
    <img src={recipe.imageUrl} alt={recipe.title} />
    <div className="recipe-info">
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
      <div className="recipe-meta">
        <span>⏱️ {recipe.time}</span>
        <span>난이도: {recipe.difficulty}</span>
        <span>⭐️ {recipe.rating} ({recipe.reviews})</span>
      </div>
    </div>
  </div>
);

const SearchResultsList = ({ results }) => {
  if (results.length === 0) {
    return <p className="no-results">검색 결과가 없습니다.</p>;
  }

  return (
    <div className="search-results-list-container">
      <div className="result-summary">
        <span>{results.length}개</span>
        <span className="sort-option">정확도순</span>
      </div>
      <div className="recipe-list">
        {results.map((recipe) => (
          <RecipeCardSmall key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default SearchResultsList;

import React from 'react';
import './RecipeCard.css';

const RecipeCard = ({ recipe }) => {
  const {
    id,
    title,
    source,
    servings,
    time,
    difficulty,
    ingredientsStatus,
    likes,
    reviews,
    image,
    isLiked,
  } = recipe;

  const isComplete =
    ingredientsStatus.available === ingredientsStatus.total;

  return (
    <div className="recipe-card">
      <div className="recipe-image-container">
        {image ? (
          <img src={image} alt={title} className="recipe-image" />
        ) : (
          <div className="recipe-image-placeholder"></div>
        )}
        <button className={`like-button ${isLiked ? 'liked' : ''}`}>
          ❤️
        </button>
      </div>
      <div className="recipe-info">
        <h3 className="recipe-title">{title}</h3>
        <p className="recipe-source">{source}</p>
        <div className="recipe-meta">
          <span className="meta-item">👤 {servings}인분</span>
          <span className="meta-item">🍲 {time}분</span>
          <span className="meta-item">🔥 난이도 {difficulty}</span>
        </div>
        <p
          className={`ingredients-status ${isComplete ? 'complete' : 'incomplete'}`}
        >
          내 냉장고 재료상황 ({ingredientsStatus.available}/
          {ingredientsStatus.total})
        </p>
        <div className="recipe-stats">
          <span className="stat-item">❤️ 찜 {likes}</span>
          <span className="stat-item">💬 후기 {reviews}</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

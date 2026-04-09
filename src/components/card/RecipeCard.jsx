import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toImageUrl } from '../../utils/imageUrl';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onToggleLike }) => {
  const navigate = useNavigate();
  const {
    recipeId,
    title,
    thumbnailImage,
    source,
    cookingTime,
    difficulty,
    likeCount,
    reviewCount,
    totalIngredientCount,
    matchedIngredientCount,
    liked,
  } = recipe;

  const [isLiked, setIsLiked] = useState(liked);
  const recipeImage = toImageUrl(thumbnailImage);

  useEffect(() => {
    setIsLiked(Boolean(liked));
  }, [liked]);

  const isComplete = matchedIngredientCount === totalIngredientCount;
  const displayLikeCount =
    likeCount +
    (isLiked && !liked ? 1 : 0) -
    (!isLiked && liked ? 1 : 0);

  const handleCardClick = (e) => {
    // 좋아요 버튼 클릭 시에는 카드 클릭 이벤트가 발생하지 않도록
    if (e.target.closest('.like-button')) {
      return;
    }
    if (!recipeId) return;
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="recipe-card" onClick={handleCardClick}>
      <div className="recipe-image-container">
        {recipeImage ? (
          <img src={recipeImage} alt={title} className="recipe-image" />
        ) : (
          <div className="recipe-image-placeholder"></div>
        )}
        <button
          type="button"
          className={`like-button ${isLiked ? 'liked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked((prev) => {
              const next = !prev;
              if (onToggleLike) {
                onToggleLike(recipeId, next);
              }
              return next;
            });
          }}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {isLiked ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </div>
      <div className="recipe-info">
        <h3 className="recipe-title">{title}</h3>
        <p className="recipe-source">{source}</p>
        <div className="recipe-meta">
          <span className="meta-item">🍲 {cookingTime}분</span>
          <span className="meta-item">🔥 난이도 {difficulty}</span>
        </div>
        <p
          className={`ingredients-status ${isComplete ? 'complete' : 'incomplete'}`}
        >
          내 냉장고 재료상황 ({matchedIngredientCount}/{totalIngredientCount})
        </p>
        <div className="recipe-stats">
          <span className="stat-item">❤️ 찜 {displayLikeCount}</span>
          <span className="stat-item">💬 후기 {reviewCount}</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

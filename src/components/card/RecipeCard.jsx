import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getRecipeWishlistDisplayDelta } from '../../utils/recipeWishlistDisplayDelta';
import { toImageUrl } from '../../utils/imageUrl';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onToggleLike }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
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
    likedByApi,
  } = recipe;

  const [isLiked, setIsLiked] = useState(liked);
  const recipeImage = toImageUrl(thumbnailImage);

  useEffect(() => {
    setIsLiked(Boolean(liked));
  }, [liked]);

  const isComplete = matchedIngredientCount === totalIngredientCount;
  const apiLiked = Boolean(likedByApi ?? false);
  const delta = getRecipeWishlistDisplayDelta(recipeId);
  const extraWishlist =
    isLoggedIn && isLiked && !apiLiked && delta === 0 ? 1 : 0;
  const displayLikeCount = Math.max(
    0,
    (likeCount ?? 0) + delta + extraWishlist,
  );

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
        {isLoggedIn && (
          <button
            type="button"
            className={`like-button ${isLiked ? 'liked' : ''}`}
            aria-label={isLiked ? '찜 취소' : '찜하기'}
            onClick={async (e) => {
              e.stopPropagation();
              const prev = isLiked;
              const next = !prev;
              if (onToggleLike) {
                const ret = onToggleLike(recipeId, next);
                const ok =
                  ret != null && typeof ret.then === 'function'
                    ? await ret
                    : ret;
                if (ok === false) return;
              }
              setIsLiked(next);
            }}
          >
            <svg
              className="like-button__heart"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={isLiked ? '0' : '2.4'}
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
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

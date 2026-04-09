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
            <span className="material-symbols-outlined" aria-hidden="true">
              {isLiked ? 'favorite' : 'favorite_border'}
            </span>
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

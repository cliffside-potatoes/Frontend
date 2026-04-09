import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  addWishlist,
  getRecipeDetail,
  getRecipeReviews,
  removeWishlist,
} from '../../api/recipeApi';
import { useUser } from '../../context/UserContext';
import { buildSignInState } from '../../utils/authStorage';
import { notifyRecipeWishlistChanged } from '../../utils/recipeWishlistSync';
import {
  addRecipeWishlistIdToStorage,
  mergeRecipeWithStoredWishlist,
  removeRecipeWishlistIdFromStorage,
} from '../../utils/recipeWishlistIdsStorage';
import { applyRecipeWishlistDisplayDeltaChange, getRecipeWishlistDisplayDelta } from '../../utils/recipeWishlistDisplayDelta';
import { toImageUrl } from '../../utils/imageUrl';
import './RecipeDetailPage.css';

const RECIPE_TABS = {
  PUBLIC: 'PUBLIC',
  RECIPE: 'RECIPE',
};

const RecipeDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const { isLoggedIn, isInitializing, user } = useUser();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(RECIPE_TABS.PUBLIC);
  const [isLiked, setIsLiked] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [reviewPreview, setReviewPreview] = useState([]);
  const [isWishlistSubmitting, setIsWishlistSubmitting] = useState(false);

  useEffect(() => {
    if (isInitializing) return;

    let cancelled = false;

    const fetchRecipe = async () => {
      setLoading(true);
      setError('');

      try {
        const recipeData = await getRecipeDetail(recipeId);

        if (cancelled) return;

        if (!recipeData) {
          setRecipe(null);
          setError('레시피 정보를 불러오지 못했습니다.');
          return;
        }

        const mergedRecipe =
          isLoggedIn && user?.id
            ? mergeRecipeWithStoredWishlist(
                {
                  ...recipeData,
                  recipeId: recipeData?.recipeId ?? recipeId,
                },
                user.id,
              )
            : recipeData;
        setRecipe(mergedRecipe);
        setActiveTab(RECIPE_TABS.PUBLIC);
        setIsLiked(Boolean(mergedRecipe?.liked));
        setIngredients(Array.isArray(recipeData?.ingredients) ? recipeData.ingredients : []);

        if (isLoggedIn) {
          const reviewData = await getRecipeReviews(recipeId, { size: 2, sort: 'LATEST' });
          if (!cancelled) {
            setReviewPreview(Array.isArray(reviewData?.items) ? reviewData.items : []);
          }
        }
      } catch (fetchError) {
        console.error('Failed to load recipe detail:', fetchError);
        if (cancelled) return;
        setRecipe(null);
        setReviewPreview([]);
        setError('레시피 정보를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (recipeId) {
      void fetchRecipe();
    }

    return () => {
      cancelled = true;
    };
  }, [recipeId, isLoggedIn, isInitializing, user?.id]);

  const handleLikeToggle = async () => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;

    if (!isLoggedIn) {
      navigate('/signin', {
        state: buildSignInState(currentPath, currentPath),
      });
      return;
    }

    if (isWishlistSubmitting) return;

    const nextLiked = !isLiked;
    const previousIsLiked = isLiked;

    setIsLiked(nextLiked);
    setRecipe((prev) =>
      prev
        ? {
            ...prev,
            liked: nextLiked,
          }
        : prev
    );
    setIsWishlistSubmitting(true);

    try {
      const result = nextLiked
        ? await addWishlist(recipeId)
        : await removeWishlist(recipeId);

      if (!result?.success) {
        throw new Error('Wishlist request failed');
      }

      const rid = Number(recipeId);
      if (Number.isFinite(rid)) {
        applyRecipeWishlistDisplayDeltaChange(rid, nextLiked ? 1 : -1);
        if (user?.id) {
          if (nextLiked) {
            addRecipeWishlistIdToStorage(user.id, rid);
          } else {
            removeRecipeWishlistIdFromStorage(user.id, rid);
          }
        }
        notifyRecipeWishlistChanged(
          nextLiked
            ? { kind: 'add', recipeId: rid }
            : { kind: 'remove', recipeId: rid },
        );
      }
    } catch (wishlistError) {
      console.error('Failed to update wishlist:', wishlistError);
      setIsLiked(previousIsLiked);
      setRecipe((prev) =>
        prev
          ? {
              ...prev,
              liked: previousIsLiked,
            }
          : prev
      );
    } finally {
      setIsWishlistSubmitting(false);
    }
  };

  const handleIngredientToggle = (index) => {
    setIngredients((prev) =>
      prev.map((ingredient, ingredientIndex) =>
        ingredientIndex === index
          ? { ...ingredient, checked: !ingredient.checked }
          : ingredient
      )
    );
  };

  const handleReviewClick = () => {
    navigate(`/recipe/${recipeId}/reviews`);
  };

  const handleWriteReviewClick = () => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    const writeReviewPath = `/recipe/${recipeId}/reviews/write`;

    if (!isLoggedIn) {
      navigate('/signin', {
        state: buildSignInState(writeReviewPath, currentPath),
      });
      return;
    }

    navigate(writeReviewPath);
  };

  const handleLinkClick = () => {
    const recipeUrl = recipe?.sourceUrl ?? recipe?.recipewithLink?.url;

    if (!recipeUrl) {
      alert('원본 레시피 링크가 없습니다.');
      return;
    }

    window.open(recipeUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-state">로딩 중...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-state">{error || '레시피를 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  const recipeImage = toImageUrl(recipe.thumbnailImage);
  const recipeSteps = Array.isArray(recipe.recipeSteps) ? recipe.recipeSteps : [];
  const hasRecipeSteps = recipeSteps.length > 0;

  const rid = Number(recipe.recipeId ?? recipeId);
  const baseWish = Number(recipe.likeCount ?? 0);
  const displayWishCount = (() => {
    if (!Number.isFinite(rid)) return Math.max(0, baseWish);
    const delta = getRecipeWishlistDisplayDelta(rid);
    const apiLiked = Boolean(recipe.likedByApi);
    const extra =
      isLoggedIn && isLiked && !apiLiked && delta === 0 ? 1 : 0;
    return Math.max(0, baseWish + delta + extra);
  })();

  return (
    <div className="recipe-detail-page">
      <div className="recipe-image-section">
        {recipeImage ? (
          <img src={recipeImage} alt={recipe.title} className="recipe-main-image" />
        ) : (
          <div className="recipe-main-image recipe-main-image--empty" aria-hidden="true" />
        )}

        <button
          type="button"
          className="recipe-image-back-button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
      </div>

      <div className="recipe-content">
        <div className="recipe-header-info">
          <div className="recipe-header-copy">
            <h1 className="recipe-detail-title">{recipe.title}</h1>
            {recipe.tags?.length > 0 && (
              <div className="recipe-tag-list">
                {recipe.tags.map((tag) => (
                  <span key={tag} className="recipe-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="recipe-actions">
            {isLoggedIn ? (
              <button
                type="button"
                className={`like-icon ${isLiked ? 'liked' : ''}`}
                onClick={handleLikeToggle}
                disabled={isWishlistSubmitting}
              >
                <span className="material-symbols-outlined like-icon-symbol" aria-hidden="true">
                  {isLiked ? 'favorite' : 'favorite_border'}
                </span>
                <span className="like-icon-count">{displayWishCount}</span>
              </button>
            ) : (
              <span className="like-icon like-icon--guest">
                <span className="like-icon-count">찜 {displayWishCount}</span>
              </span>
            )}
            <span className="review-count">💬 {recipe.reviewCount}</span>
          </div>
        </div>

        <div className="recipe-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === RECIPE_TABS.PUBLIC ? 'active' : ''}`}
            onClick={() => setActiveTab(RECIPE_TABS.PUBLIC)}
          >
            공개
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === RECIPE_TABS.RECIPE ? 'active' : ''}`}
            onClick={() => setActiveTab(RECIPE_TABS.RECIPE)}
          >
            레시피
          </button>
        </div>

        {activeTab === RECIPE_TABS.PUBLIC ? (
          <>
            <div className="refrigerator-status">
              <p className="status-title">
                내 냉장고 재료상황 ({recipe.matchedIngredientCount || 0} /{' '}
                {recipe.totalIngredientCount || 0})
              </p>
              <p className="status-description">{recipe.description}</p>

              <div className="difficulty-icons">
                <div className="difficulty-item">
                  <span className="icon">🍽</span>
                  <span className="label">{recipe.servings || 1}인분</span>
                </div>
                <div className="difficulty-item">
                  <span className="icon">⏱</span>
                  <span className="label">{recipe.cookingTime || 0}분</span>
                </div>
                <div className="difficulty-item">
                  <span className="icon">📈</span>
                  <span className="label">난이도 {recipe.difficulty}</span>
                </div>
              </div>
            </div>

            <div className="recipe-link-section">
              <h3 className="section-title">원본 레시피 링크</h3>
              <p className="recipe-source">{recipe.source || '출처 정보 없음'}</p>
              <button className="link-button" onClick={handleLinkClick}>
                원본 레시피 보러가기
                <span>&gt;</span>
              </button>
            </div>

            <div className="ingredients-section">
              <h3 className="section-title">준비할 재료</h3>
              <div className="ingredients-list">
                {ingredients.map((ingredient, index) => (
                  <label
                    key={ingredient.id ?? `${ingredient.name}-${index}`}
                    className="ingredient-item"
                  >
                    <input
                      type="checkbox"
                      checked={ingredient.checked}
                      onChange={() => handleIngredientToggle(index)}
                    />
                    <span>
                      {ingredient.name}
                      {ingredient.amount ? ` ${ingredient.amount}` : ''}
                    </span>
                  </label>
                ))}

                {ingredients.length === 0 && (
                  <p className="ingredients-empty">등록된 재료 정보가 없습니다.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <section className="recipe-steps-section">
            <h3 className="section-title">레시피 설명</h3>

            {hasRecipeSteps ? (
              <ol className="recipe-step-list">
                {recipeSteps.map((stepItem) => (
                  <li key={`${stepItem.step}-${stepItem.text}`} className="recipe-step-item">
                    <span className="recipe-step-badge">STEP {stepItem.step}</span>
                    <p className="recipe-step-text">{stepItem.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="recipe-step-empty">
                <p>
                  이 레시피는 조리 순서가 직접 등록되어 있지 않습니다.
                </p>
                <button type="button" className="link-button" onClick={handleLinkClick}>
                  원본 레시피에서 확인하기
                  <span>&gt;</span>
                </button>
              </div>
            )}
          </section>
        )}

        <div className="review-section">
          <div className="review-header">
            <h3 className="section-title">후기 ({recipe.reviewCount})</h3>
            <button type="button" className="review-more-button" onClick={handleReviewClick}>
              전체보기 &gt;
            </button>
          </div>

          <div className="review-preview-list">
            {reviewPreview.length > 0 ? (
              reviewPreview.map((review) => (
                <button
                  key={review.reviewId}
                  type="button"
                  className="review-preview-item"
                  onClick={handleReviewClick}
                >
                  <div className="review-preview-top">
                    <strong>{review.nickName}</strong>
                    <span>{review.updatedAt}</span>
                  </div>
                  <p>{review.content}</p>
                </button>
              ))
            ) : (
              <p className="review-preview-empty">아직 등록된 후기가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      <div className="write-review-section">
        <button className="write-review-button" onClick={handleWriteReviewClick}>
          <span className="heart-icon">❤️</span>
          후기 작성하기
        </button>
      </div>
    </div>
  );
};

export default RecipeDetailPage;

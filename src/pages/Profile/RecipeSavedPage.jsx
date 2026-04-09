import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import GuestLoginPrompt from '../../components/common/GuestLoginPrompt';
import RecipeCard from '../../components/card/RecipeCard';
import { getWishlistRecipes, removeWishlist } from '../../api/recipeApi';
import { useUser } from '../../context/UserContext';
import { notifyRecipeWishlistChanged, RECIPE_WISHLIST_CHANGED_EVENT } from '../../utils/recipeWishlistSync';
import { applyRecipeWishlistDisplayDeltaChange } from '../../utils/recipeWishlistDisplayDelta';
import { removeRecipeWishlistIdFromStorage } from '../../utils/recipeWishlistIdsStorage';
import {
  listWishlistRecipesFromSnapshotCache,
  removeWishlistRecipeSnapshot,
} from '../../utils/recipeWishlistSnapshotCache';
import './RecipeSavedPage.css';

const RecipeSavedPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isInitializing, user } = useUser();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLocalWishlistBanner, setShowLocalWishlistBanner] = useState(false);

  useEffect(() => {
    if (isInitializing) return;

    if (!isLoggedIn) {
      setLoading(false);
      setRecipes([]);
      setError(null);
      setShowLocalWishlistBanner(false);
      return undefined;
    }

    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      setShowLocalWishlistBanner(false);
      try {
        const result = await getWishlistRecipes({ size: 50 });
        if (result.ok) {
          setRecipes(Array.isArray(result.items) ? result.items : []);
          return;
        }
        const fallback =
          user?.id != null ? listWishlistRecipesFromSnapshotCache(user.id) : [];
        setRecipes(fallback);
        if (fallback.length > 0) {
          setShowLocalWishlistBanner(true);
        } else {
          setError(
            '서버에서 찜 목록을 불러오지 못했어요. 잠시 후 다시 시도하거나 백엔드 점검이 필요할 수 있어요.',
          );
        }
      } catch (err) {
        console.error('찜 목록 조회 실패:', err);
        const fallback =
          user?.id != null ? listWishlistRecipesFromSnapshotCache(user.id) : [];
        setRecipes(fallback);
        if (fallback.length > 0) {
          setShowLocalWishlistBanner(true);
        } else {
          setError('찜 목록을 불러올 수 없습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchWishlist();

    const onWishlistChanged = () => {
      void fetchWishlist();
    };

    window.addEventListener(RECIPE_WISHLIST_CHANGED_EVENT, onWishlistChanged);
    return () =>
      window.removeEventListener(RECIPE_WISHLIST_CHANGED_EVENT, onWishlistChanged);
  }, [isInitializing, isLoggedIn, user?.id]);

  const handleBack = () => navigate(-1);

  const handleToggleLike = async (recipeId, nextLiked) => {
    if (nextLiked) return false;

    const id = Number(recipeId);
    if (!Number.isFinite(id)) return false;

    const result = await removeWishlist(id);
    if (!result?.success) {
      console.error('저장 레시피 찜 해제 실패:', result?.error);
      return false;
    }

    applyRecipeWishlistDisplayDeltaChange(id, -1);
    setRecipes((prev) =>
      (prev || []).filter((recipe) => Number(recipe.recipeId) !== id)
    );
    if (user?.id) {
      removeRecipeWishlistIdFromStorage(user.id, id);
      removeWishlistRecipeSnapshot(user.id, id);
    }
    notifyRecipeWishlistChanged({ kind: 'remove', recipeId: id });
    return true;
  };

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
        {showLocalWishlistBanner && !loading && (
          <p className="rsp-local-banner" role="status">
            서버 연결이 불안정해 이 기기에 저장된 찜 목록을 보여요. 복구되면 자동으로
            다시 맞춰져요.
          </p>
        )}
        {loading ? (
          <div className="recipe-saved-empty">
            <p className="rsp-empty-text">불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="recipe-saved-empty">
            <p className="rsp-empty-text">{error}</p>
          </div>
        ) : recipes.length > 0 ? (
          <div className="recipe-saved-list">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                onToggleLike={handleToggleLike}
              />
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

      <GuestLoginPrompt afterLoginPath="/recipe-saved" />
    </div>
  );
};

export default RecipeSavedPage;

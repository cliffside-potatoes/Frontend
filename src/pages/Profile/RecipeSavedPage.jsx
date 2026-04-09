import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import GuestLoginPrompt from '../../components/common/GuestLoginPrompt';
import RecipeCard from '../../components/card/RecipeCard';
import { getWishlistRecipes, removeWishlist } from '../../api/recipeApi';
import { useUser } from '../../context/UserContext';
import { notifyRecipeWishlistChanged, RECIPE_WISHLIST_CHANGED_EVENT } from '../../utils/recipeWishlistSync';
import { removeRecipeWishlistIdFromStorage } from '../../utils/recipeWishlistIdsStorage';
import './RecipeSavedPage.css';

const RecipeSavedPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isInitializing, user } = useUser();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isInitializing) return;

    if (!isLoggedIn) {
      setLoading(false);
      setRecipes([]);
      setError(null);
      return undefined;
    }

    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getWishlistRecipes({ size: 50 });
        setRecipes(Array.isArray(result.items) ? result.items : []);
      } catch (err) {
        console.error('찜 목록 조회 실패:', err);
        setError('찜 목록을 불러올 수 없습니다.');
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
  }, [isInitializing, isLoggedIn]);

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

    setRecipes((prev) =>
      (prev || []).filter((recipe) => Number(recipe.recipeId) !== id)
    );
    if (user?.id) {
      removeRecipeWishlistIdFromStorage(user.id, id);
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

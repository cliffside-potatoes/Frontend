import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import RecipeCard from '../../components/card/RecipeCard';
import Modal from '../../components/ui/Modal';
import { useUser } from '../../context/UserContext';
import { RECIPE_CATEGORIES } from '../../constants/categories';
import { fridgeApi } from '../../api/fridgeApi';
import { addWishlist, getPopularRecipes, removeWishlist } from '../../api/recipeApi';
import { buildSignInState } from '../../utils/authStorage';
import { notifyRecipeWishlistChanged } from '../../utils/recipeWishlistSync';
import { applyRecipeWishlistDisplayDeltaChange } from '../../utils/recipeWishlistDisplayDelta';
import {
  addRecipeWishlistIdToStorage,
  mergeRecipeWithStoredWishlist,
  removeRecipeWishlistIdFromStorage,
} from '../../utils/recipeWishlistIdsStorage';
import {
  removeWishlistRecipeSnapshot,
  upsertWishlistRecipeSnapshot,
} from '../../utils/recipeWishlistSnapshotCache';
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './MainPage.css';

const normalizeRecipe = (item) => {
  const apiLiked = Boolean(item?.liked ?? false);
  return {
    recipeId: item?.recipeId ?? item?.id ?? 0,
    title: item?.title ?? item?.name ?? '레시피',
    thumbnailImage:
      item?.thumbnailImage ??
      item?.thumbnailImageUrl ??
      item?.imageUrl ??
      item?.thumbnailUrl ??
      '',
    source: item?.source ?? item?.recipeSource ?? '출처 없음',
    cookingTime: item?.cookingTime ?? item?.cookTime ?? 0,
    difficulty: item?.difficulty ?? '초보',
    likeCount: item?.likeCount ?? 0,
    reviewCount: item?.reviewCount ?? 0,
    totalIngredientCount: item?.totalIngredientCount ?? 0,
    matchedIngredientCount: item?.matchedIngredientCount ?? 0,
    liked: apiLiked,
    likedByApi: Boolean(item?.likedByApi ?? item?.liked ?? false),
  };
};

const shuffleArray = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = out[i];
    out[i] = out[j];
    out[j] = t;
  }
  return out;
};

const countFridgeIngredients = (body) => {
  const items = body?.data?.items ?? [];
  if (!Array.isArray(items)) return 0;
  let n = 0;
  for (let s = 0; s < items.length; s += 1) {
    const categories = items[s]?.categories ?? [];
    for (let c = 0; c < categories.length; c += 1) {
      const ings = categories[c]?.ingredients ?? [];
      n += ings.length;
    }
  }
  return n;
};

const extractRecipeRowsFromListBody = (body) => {
  const rows =
    body?.data?.items ?? body?.data?.Recipes ?? body?.Recipes ?? [];
  return Array.isArray(rows) ? rows : [];
};

const MainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isInitializing, user } = useUser();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [displayedRecipes, setDisplayedRecipes] = useState([]);
  const [recipeSectionKind, setRecipeSectionKind] = useState('popular');
  const [recipesLoading, setRecipesLoading] = useState(false);

  useEffect(() => {
    if (isInitializing) return;

    let cancelled = false;

    const loadMainRecipes = async () => {
      setRecipesLoading(true);
      try {
        let nextList = [];
        let nextKind = 'popular';

        if (isLoggedIn) {
          try {
            const fridgeRes = await fridgeApi.getMyFridge();
            if (cancelled) return;
            const ingredientCount = countFridgeIngredients(fridgeRes.data);
            if (ingredientCount > 0) {
              const matchRes = await fridgeApi.getRecommendedRecipes({
                sort: 'MATCH_COUNT',
                size: 20,
              });
              if (cancelled) return;
              const rows = extractRecipeRowsFromListBody(matchRes.data);
              nextList = rows.map(normalizeRecipe);
              nextList.sort(
                (a, b) =>
                  (b.matchedIngredientCount - a.matchedIngredientCount) ||
                  (b.likeCount - a.likeCount)
              );
              nextList = nextList.slice(0, 10);
              const hasRealMatch = nextList.some(
                (r) => (r.matchedIngredientCount ?? 0) > 0
              );
              if (nextList.length > 0 && hasRealMatch) {
                nextKind = 'fridge';
              } else {
                nextList = [];
              }
            }
          } catch (error) {
            console.error('냉장고·매칭 레시피 조회 실패:', error);
          }
        }

        if (nextList.length === 0) {
          let popular = await getPopularRecipes({ size: 10, sort: 'LIKE_COUNT' });
          if (cancelled) return;
          if (popular.length > 0) {
            nextList = popular;
            nextKind = 'popular';
          } else {
            let pool = await getPopularRecipes({ size: 30, sort: 'LATEST' });
            if (cancelled) return;
            pool = shuffleArray(pool).slice(0, 10);
            nextList = pool;
            nextKind = pool.length > 0 ? 'random' : 'popular';
          }
        }

        if (!cancelled) {
          const withWishlist =
            isLoggedIn && user?.id
              ? nextList.map((r) => mergeRecipeWithStoredWishlist(r, user.id))
              : nextList;
          setDisplayedRecipes(withWishlist);
          setRecipeSectionKind(nextKind);
        }
      } catch (error) {
        console.error('메인 레시피 조회 실패:', error);
        if (!cancelled) {
          setDisplayedRecipes([]);
          setRecipeSectionKind('popular');
        }
      } finally {
        setRecipesLoading(false);
      }
    };

    void loadMainRecipes();

    return () => {
      cancelled = true;
    };
  }, [isInitializing, isLoggedIn, user?.id]);

  const handleFillRefrigeratorClick = () => {
    if (isInitializing) {
      alert('로그인 확인 중이야. 잠깐만 다시 눌러줘!');
      return;
    }

    if (isLoggedIn) {
      navigate('/refrigerator');
    } else {
      setShowLoginModal(true);
    }
  };

  const sectionTitle =
    recipeSectionKind === 'fridge'
      ? '내 냉장고 레시피 추천'
      : recipeSectionKind === 'random'
        ? '오늘의 추천 레시피'
        : '인기 레시피';

  const handleSearchClick = () => {
    navigate('/search');
  };

  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  const handleToggleRecipeLike = async (recipeId, nextLiked) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }

    const id = Number(recipeId);
    if (!Number.isFinite(id)) return false;

    const result = nextLiked ? await addWishlist(id) : await removeWishlist(id);
    if (!result?.success) {
      console.error('메인 레시피 찜 토글 실패:', result?.error);
      return false;
    }

    applyRecipeWishlistDisplayDeltaChange(id, nextLiked ? 1 : -1);

    setDisplayedRecipes((prev) =>
      (prev || []).map((recipe) => {
        if (Number(recipe.recipeId) !== id) return recipe;
        return {
          ...recipe,
          liked: nextLiked,
        };
      })
    );

    if (user?.id) {
      if (nextLiked) {
        addRecipeWishlistIdToStorage(user.id, id);
        const snap = (displayedRecipes || []).find((r) => Number(r.recipeId) === id);
        if (snap) {
          upsertWishlistRecipeSnapshot(user.id, { ...snap, liked: true });
        }
      } else {
        removeRecipeWishlistIdFromStorage(user.id, id);
        removeWishlistRecipeSnapshot(user.id, id);
      }
    }

    notifyRecipeWishlistChanged(
      nextLiked ? { kind: 'add', recipeId: id } : { kind: 'remove', recipeId: id },
    );
    return true;
  };

  return (
    <div className="main-page">
      <header className="main-header">
        <div className="header-top">
          <div className="tomato-icon">
            <img src={naengGuIcon} alt="냉구" className="tomato-image" />
          </div>

          <div className="search-bar" onClick={handleSearchClick}>
            <input type="text" placeholder="검색" className="search-input" readOnly />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <h1 className="main-title">내 냉장고</h1>

        <p className="header-description">👀 현재 냉장고에 있는 재료를 채워봐요!</p>
        <p className="header-description">재료를 이용해서 만들 수 있는 레시피들을 추천해 줍니다</p>

        <button type="button" className="fill-refrigerator-btn" onClick={handleFillRefrigeratorClick}>
          <span>🍲</span>
          냉장고 채우러 가기
          <span>&gt;</span>
        </button>
      </header>

      <main className="main-content">
        <section className="recipe-section">
          <h2 className="section-title">상황별 레시피 추천</h2>
          <div className="category-grid">
            {RECIPE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className="category-item"
                onClick={() => navigate(`/situation/${category.id}`)}
              >
                <div className="category-icon">{category.icon}</div>
                <span className="category-label">{category.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="recipe-section">
          <h2 className="section-title">{sectionTitle}</h2>

          {recipesLoading ? (
            <p style={{ padding: '16px', color: '#888' }}>레시피 불러오는 중...</p>
          ) : (
            <div className="recipe-list">
              {displayedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.recipeId}
                  recipe={recipe}
                  onToggleLike={handleToggleRecipeLike}
                />
              ))}
              {displayedRecipes.length === 0 && (
                <p style={{ padding: '16px', color: '#888' }}>추천 레시피가 없어요</p>
              )}
            </div>
          )}
        </section>
      </main>

      <BottomNav />

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="로그인 이후 이용해주세요"
        description="더 많은 기능을 이용할 수 있어요!"
        cancelLabel="취소"
        confirmLabel="로그인"
        onCancel={() => setShowLoginModal(false)}
        onConfirm={() => {
          setShowLoginModal(false);
          navigate('/signin', {
            state: buildSignInState('/refrigerator', currentPath),
          });
        }}
        variant="login"
      />
    </div>
  );
};

export default MainPage;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import RecipeCard from '../../components/card/RecipeCard';
import Modal from '../../components/ui/Modal';
import { useUser } from '../../context/UserContext';
import { RECIPE_CATEGORIES } from '../../constants/categories';
import { fridgeApi } from '../../api/fridgeApi';
import { getPopularRecipes } from '../../api/recipeApi';
import { buildSignInState } from '../../utils/authStorage';
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './MainPage.css';

const normalizeRecipe = (item) => ({
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
  liked: item?.liked ?? false,
});

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
  const { isLoggedIn, isInitializing } = useUser();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [fridgeMatchRecipes, setFridgeMatchRecipes] = useState([]);
  const [popularSubtitle, setPopularSubtitle] = useState('');
  const [recipesLoading, setRecipesLoading] = useState(false);

  useEffect(() => {
    if (isInitializing) return;

    let cancelled = false;

    const loadPopular = async () => {
      let list = await getPopularRecipes({ size: 10, sort: 'LIKE_COUNT' });
      if (cancelled) return { list: [], subtitle: '' };
      if (list.length > 0) {
        return { list, subtitle: '' };
      }
      let pool = await getPopularRecipes({ size: 30, sort: 'LATEST' });
      if (cancelled) return { list: [], subtitle: '' };
      pool = shuffleArray(pool).slice(0, 10);
      return {
        list: pool,
        subtitle: pool.length > 0 ? '새로 골라 볼 만한 레시피' : '',
      };
    };

    const loadMainRecipes = async () => {
      setRecipesLoading(true);
      try {
        const { list: popularList, subtitle } = await loadPopular();
        if (cancelled) return;
        setPopularRecipes(popularList);
        setPopularSubtitle(subtitle);

        if (!isLoggedIn) {
          setFridgeMatchRecipes([]);
        } else {
          try {
            const fridgeRes = await fridgeApi.getMyFridge();
            if (cancelled) return;
            const ingredientCount = countFridgeIngredients(fridgeRes.data);
            if (ingredientCount <= 0) {
              setFridgeMatchRecipes([]);
            } else {
              const matchRes = await fridgeApi.getRecommendedRecipes({
                sort: 'MATCH_COUNT',
                size: 20,
              });
              if (cancelled) return;
              const rows = extractRecipeRowsFromListBody(matchRes.data);
              let nextList = rows.map(normalizeRecipe);
              nextList.sort(
                (a, b) =>
                  (b.matchedIngredientCount - a.matchedIngredientCount) ||
                  (b.likeCount - a.likeCount)
              );
              nextList = nextList.slice(0, 10);
              const hasRealMatch = nextList.some(
                (r) => (r.matchedIngredientCount ?? 0) > 0
              );
              setFridgeMatchRecipes(
                nextList.length > 0 && hasRealMatch ? nextList : []
              );
            }
          } catch (error) {
            console.error('냉장고·매칭 레시피 조회 실패:', error);
            if (!cancelled) setFridgeMatchRecipes([]);
          }
        }
      } catch (error) {
        console.error('메인 레시피 조회 실패:', error);
        if (!cancelled) {
          setPopularRecipes([]);
          setPopularSubtitle('');
          setFridgeMatchRecipes([]);
        }
      } finally {
        if (!cancelled) setRecipesLoading(false);
      }
    };

    void loadMainRecipes();

    return () => {
      cancelled = true;
    };
  }, [isInitializing, isLoggedIn]);

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

  const handleSearchClick = () => {
    navigate('/search');
  };

  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div className="main-page">
      <header className="main-header">
        <div className="header-top">
          <div className="tomato-icon">
            <img src={naengGuIcon} alt="냉구" className="tomato-image" />
          </div>

          <div className="search-bar" onClick={handleSearchClick} style={{ cursor: 'pointer' }}>
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
          <h2 className="section-title">인기 레시피</h2>
          {popularSubtitle ? (
            <p className="section-subtitle" style={{ margin: '-8px 0 12px', fontSize: 13, color: '#666' }}>
              {popularSubtitle}
            </p>
          ) : null}

          {recipesLoading ? (
            <p style={{ padding: '16px', color: '#888' }}>레시피 불러오는 중...</p>
          ) : (
            <div className="recipe-list">
              {popularRecipes.map((recipe) => (
                <RecipeCard key={`pop-${recipe.recipeId}`} recipe={recipe} />
              ))}
              {popularRecipes.length === 0 && (
                <p style={{ padding: '16px', color: '#888' }}>인기 레시피를 불러올 수 없어요</p>
              )}
            </div>
          )}
        </section>

        {isLoggedIn && !recipesLoading && fridgeMatchRecipes.length > 0 && (
          <section className="recipe-section">
            <h2 className="section-title">내 냉장고와 잘 맞는 레시피</h2>
            <div className="recipe-list">
              {fridgeMatchRecipes.map((recipe) => (
                <RecipeCard key={`fridge-${recipe.recipeId}`} recipe={recipe} />
              ))}
            </div>
          </section>
        )}
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

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import PageHeader from '../../components/common/PageHeader';
import RecipeCard from '../../components/card/RecipeCard';
import Modal from '../../components/ui/Modal';
import { getSituationCategoryById } from '../../constants/categories';
import { addWishlist, getTaggedRecipes, removeWishlist } from '../../api/recipeApi';
import { useUser } from '../../context/UserContext';
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
import './SituationRecipesPage.css';

const SORT_LATEST = 'LATEST';
const SORT_POPULAR = 'LIKE_COUNT';

const SituationRecipesPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const meta = getSituationCategoryById(categoryId);
  const { isLoggedIn, isInitializing, user } = useUser();

  const [sort, setSort] = useState(SORT_LATEST);
  const [recipes, setRecipes] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (isInitializing) return;

    if (!meta) {
      setLoading(false);
      setRecipes([]);
      setHasNext(false);
      setNextCursor(null);
      setLoadError(null);
      return undefined;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setLoadError(null);
      setHasNext(false);
      setNextCursor(null);
      try {
        const result = await getTaggedRecipes(meta.apiCategory, {
          size: 20,
          sort,
        });
        if (cancelled) return;
        if (!result.ok) {
          setLoadError('레시피 목록을 불러오지 못했어요.');
          setRecipes([]);
          return;
        }
        let list = Array.isArray(result.items) ? result.items : [];
        if (isLoggedIn && user?.id) {
          list = list.map((r) => mergeRecipeWithStoredWishlist(r, user.id));
        }
        setRecipes(list);
        setHasNext(Boolean(result.hasNext));
        setNextCursor(result.nextCursor ?? null);
      } catch (e) {
        console.error('상황별 레시피 조회 실패:', e);
        if (!cancelled) {
          setLoadError('레시피 목록을 불러오지 못했어요.');
          setRecipes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [isInitializing, meta?.apiCategory, sort, isLoggedIn, user?.id]);

  const handleLoadMore = async () => {
    if (!meta || !hasNext || loadingMore || loading || !nextCursor) return;

    const cur = nextCursor;
    const cursorId = cur.cursorId != null ? cur.cursorId : null;
    if (cursorId == null) return;

    setLoadingMore(true);
    try {
      const params = {
        size: 20,
        sort,
        ...(sort === SORT_POPULAR
          ? {
              cursorLikeCount: cur.cursorLikeCount,
              cursorId,
            }
          : {
              cursorCreatedAt: cur.cursorCreatedAt,
              cursorId,
            }),
      };
      const result = await getTaggedRecipes(meta.apiCategory, params);
      if (!result.ok) return;
      let more = Array.isArray(result.items) ? result.items : [];
      if (isLoggedIn && user?.id) {
        more = more.map((r) => mergeRecipeWithStoredWishlist(r, user.id));
      }
      setRecipes((prev) => [...(prev || []), ...more]);
      setHasNext(Boolean(result.hasNext));
      setNextCursor(result.nextCursor ?? null);
    } catch (e) {
      console.error('상황별 레시피 추가 로드 실패:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggleRecipeLike = async (recipeId, nextLiked) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }

    const id = Number(recipeId);
    if (!Number.isFinite(id)) return false;

    const result = nextLiked ? await addWishlist(id) : await removeWishlist(id);
    if (!result?.success) {
      console.error('태그 레시피 찜 토글 실패:', result?.error);
      return false;
    }

    applyRecipeWishlistDisplayDeltaChange(id, nextLiked ? 1 : -1);

    setRecipes((prev) => {
      const next = (prev || []).map((recipe) =>
        Number(recipe.recipeId) !== id
          ? recipe
          : { ...recipe, liked: nextLiked }
      );
      if (nextLiked && user?.id) {
        const snap = next.find((r) => Number(r.recipeId) === id);
        if (snap) {
          upsertWishlistRecipeSnapshot(user.id, { ...snap, liked: true });
        }
      }
      return next;
    });

    if (user?.id) {
      if (nextLiked) {
        addRecipeWishlistIdToStorage(user.id, id);
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

  if (!meta) {
    return (
      <div className="situation-recipes-page">
        <PageHeader
          title="목록"
          onBack={() => navigate(-1)}
          onHome={() => navigate('/main')}
        />
        <main className="situation-recipes-page__main">
          <p className="situation-recipes-page__hint">잘못된 카테고리입니다.</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="situation-recipes-page">
      <PageHeader
        title={meta.label}
        onBack={() => navigate(-1)}
        onHome={() => navigate('/main')}
      />
      <div className="situation-recipes-page__toolbar">
        <p className="situation-recipes-page__tag-label">
          태그 <strong>{meta.apiCategory}</strong>
        </p>
        <div className="situation-recipes-page__sort" role="tablist" aria-label="정렬">
          <button
            type="button"
            role="tab"
            aria-selected={sort === SORT_LATEST}
            className={`situation-recipes-page__sort-btn ${sort === SORT_LATEST ? 'is-active' : ''}`}
            onClick={() => setSort(SORT_LATEST)}
          >
            최신순
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={sort === SORT_POPULAR}
            className={`situation-recipes-page__sort-btn ${sort === SORT_POPULAR ? 'is-active' : ''}`}
            onClick={() => setSort(SORT_POPULAR)}
          >
            인기순
          </button>
        </div>
      </div>
      <main className="situation-recipes-page__main">
        {loading ? (
          <p className="situation-recipes-page__hint">불러오는 중…</p>
        ) : loadError ? (
          <p className="situation-recipes-page__hint situation-recipes-page__hint--error">
            {loadError}
          </p>
        ) : (
          <>
            <div className="situation-recipes-page__list">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.recipeId}
                  recipe={recipe}
                  onToggleLike={handleToggleRecipeLike}
                />
              ))}
              {recipes.length === 0 && (
                <p className="situation-recipes-page__hint">이 태그의 레시피가 없어요.</p>
              )}
            </div>
            {hasNext && recipes.length > 0 && (
              <button
                type="button"
                className="situation-recipes-page__more"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? '불러오는 중…' : '더 보기'}
              </button>
            )}
          </>
        )}
      </main>
      <BottomNav />

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="로그인 이후 이용해주세요"
        description="찜하기는 로그인 후 사용할 수 있어요."
        cancelLabel="취소"
        confirmLabel="로그인"
        onCancel={() => setShowLoginModal(false)}
        onConfirm={() => {
          setShowLoginModal(false);
          navigate('/signin', {
            state: buildSignInState(currentPath, currentPath),
          });
        }}
        variant="login"
      />
    </div>
  );
};

export default SituationRecipesPage;

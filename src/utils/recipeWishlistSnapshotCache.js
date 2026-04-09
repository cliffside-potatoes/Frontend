import { loadRecipeWishlistIdSet } from './recipeWishlistIdsStorage';

const snapshotStorageKey = (userId) =>
  userId != null && String(userId).length > 0
    ? `nengtul:wishlistRecipeSnapshots:${String(userId)}`
    : null;

const loadSnapshotMap = (userId) => {
  const key = snapshotStorageKey(userId);
  if (!key) return {};
  try {
    const obj = JSON.parse(localStorage.getItem(key) || '{}');
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
};

const saveSnapshotMap = (userId, map) => {
  const key = snapshotStorageKey(userId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(map));
};

/** 찜 API 성공 직후·목록 표시용(서버 500 대비) */
export const upsertWishlistRecipeSnapshot = (userId, recipe) => {
  if (!userId || recipe == null) return;
  const id = Number(recipe.recipeId);
  if (!Number.isFinite(id)) return;
  const map = loadSnapshotMap(userId);
  map[String(id)] = {
    recipeId: id,
    title: recipe.title ?? '레시피',
    thumbnailImage: recipe.thumbnailImage ?? '',
    source: recipe.source ?? '출처 없음',
    cookingTime: recipe.cookingTime ?? 0,
    difficulty: recipe.difficulty ?? '초보',
    likeCount: recipe.likeCount ?? 0,
    reviewCount: recipe.reviewCount ?? 0,
    totalIngredientCount: recipe.totalIngredientCount ?? 0,
    matchedIngredientCount: recipe.matchedIngredientCount ?? 0,
    liked: true,
    likedByApi: Boolean(recipe.likedByApi),
  };
  saveSnapshotMap(userId, map);
};

export const removeWishlistRecipeSnapshot = (userId, recipeId) => {
  const id = Number(recipeId);
  if (!Number.isFinite(id)) return;
  const key = snapshotStorageKey(userId);
  if (!key) return;
  const map = loadSnapshotMap(userId);
  delete map[String(id)];
  saveSnapshotMap(userId, map);
};

const minimalStubRecipe = (recipeId) => ({
  recipeId,
  title: '레시피',
  thumbnailImage: '',
  source: '출처 없음',
  cookingTime: 0,
  difficulty: '초보',
  likeCount: 0,
  reviewCount: 0,
  totalIngredientCount: 0,
  matchedIngredientCount: 0,
  liked: true,
  likedByApi: false,
});

/** 저장 탭 오프라인 폴백: 찜 ID 순서 + 스냅샷(없으면 최소 카드) */
export const listWishlistRecipesFromSnapshotCache = (userId) => {
  const key = snapshotStorageKey(userId);
  if (!key) return [];
  const map = loadSnapshotMap(userId);
  const ids = [...loadRecipeWishlistIdSet(userId)];
  return ids.map((rid) => {
    const cached = map[String(rid)];
    if (cached) return cached;
    return minimalStubRecipe(rid);
  });
};

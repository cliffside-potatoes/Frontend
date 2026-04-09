export const recipeWishlistIdsStorageKey = (userId) =>
  userId != null && String(userId).length > 0
    ? `nengtul:recipeWishlistIds:${String(userId)}`
    : null;

export const loadRecipeWishlistIdSet = (userId) => {
  const key = recipeWishlistIdsStorageKey(userId);
  if (!key) return new Set();
  try {
    const raw = localStorage.getItem(key);
    const arr = JSON.parse(raw || '[]');
    return new Set(
      (Array.isArray(arr) ? arr : [])
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n)),
    );
  } catch {
    return new Set();
  }
};

export const saveRecipeWishlistIdSet = (userId, set) => {
  const key = recipeWishlistIdsStorageKey(userId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify([...set]));
};

export const addRecipeWishlistIdToStorage = (userId, recipeId) => {
  const id = Number(recipeId);
  if (!Number.isFinite(id)) return;
  const key = recipeWishlistIdsStorageKey(userId);
  if (!key) return;
  const set = loadRecipeWishlistIdSet(userId);
  set.add(id);
  saveRecipeWishlistIdSet(userId, set);
};

export const removeRecipeWishlistIdFromStorage = (userId, recipeId) => {
  const id = Number(recipeId);
  if (!Number.isFinite(id)) return;
  const key = recipeWishlistIdsStorageKey(userId);
  if (!key) return;
  const set = loadRecipeWishlistIdSet(userId);
  set.delete(id);
  saveRecipeWishlistIdSet(userId, set);
};

/** 공개 목록에 liked가 안 올 때(비인증 GET) 저장소와 맞춤 */
export const mergeRecipeWithStoredWishlist = (recipe, userId) => {
  const rid = Number(recipe?.recipeId);
  if (!Number.isFinite(rid)) return recipe;
  const key = recipeWishlistIdsStorageKey(userId);
  if (!key) return recipe;
  const wishIds = loadRecipeWishlistIdSet(userId);
  if (!wishIds.has(rid)) return recipe;
  const already = Boolean(recipe.liked);
  return {
    ...recipe,
    liked: true,
    likeCount: Math.max(
      0,
      (recipe.likeCount ?? 0) + (already ? 0 : 1),
    ),
  };
};

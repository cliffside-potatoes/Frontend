const STORAGE_KEY = 'nengtul:recipeWishlistDisplayDelta';

const loadMap = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const obj = JSON.parse(raw || '{}');
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
};

const saveMap = (obj) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
};

export const getRecipeWishlistDisplayDelta = (recipeId) => {
  const id = Number(recipeId);
  if (!Number.isFinite(id)) return 0;
  const map = loadMap();
  const n = Number(map[String(id)]);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

/** 찜 API 성공 시에만 호출. 로그아웃 후에도 동일 브라우저에서는 표시 숫자 유지 */
export const applyRecipeWishlistDisplayDeltaChange = (recipeId, change) => {
  const id = Number(recipeId);
  if (!Number.isFinite(id)) return;
  const c = Number(change);
  if (!Number.isFinite(c) || c === 0) return;
  const map = loadMap();
  const key = String(id);
  const next = Math.max(0, (Number(map[key]) || 0) + c);
  if (next === 0) {
    delete map[key];
  } else {
    map[key] = next;
  }
  saveMap(map);
};

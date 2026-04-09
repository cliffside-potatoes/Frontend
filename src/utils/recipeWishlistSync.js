export const RECIPE_WISHLIST_CHANGED_EVENT = "nengtul:recipeWishlistChanged";

/**
 * 찜 추가·해제 후 저장 탭 등에서 목록을 다시 붙일 때 사용
 * @param {Object} detail
 * @param {"add"|"remove"} detail.kind
 * @param {number} detail.recipeId
 */
export const notifyRecipeWishlistChanged = (detail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(RECIPE_WISHLIST_CHANGED_EVENT, { detail }),
  );
};

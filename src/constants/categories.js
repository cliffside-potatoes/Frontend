// 상황별 레시피 카테고리 상수
// apiCategory → GET /recipes?category= (백엔드 허용 값 확정 시 여기만 수정)
export const RECIPE_CATEGORIES = [
  { id: 1, label: '초스피드', icon: '⚡', apiCategory: '초스피드' },
  { id: 2, label: '갓성비', icon: '💰', apiCategory: '갓성비' },
  { id: 3, label: '원팬', icon: '🍳', apiCategory: '원팬' },
  { id: 4, label: '안주', icon: '🍺', apiCategory: '안주' },
  { id: 5, label: '해장', icon: '🥣', apiCategory: '해장' },
];

export const getSituationCategoryById = (id) =>
  RECIPE_CATEGORIES.find((c) => String(c.id) === String(id));

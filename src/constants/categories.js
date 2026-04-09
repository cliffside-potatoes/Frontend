// 상황별 레시피 카테고리 — GET /recipes?category={태그명} (백엔드 지원 태그)
export const RECIPE_CATEGORIES = [
  { id: 1, label: '한식', icon: '🍚', apiCategory: '한식' },
  { id: 2, label: '서양', icon: '🍽️', apiCategory: '서양' },
  { id: 3, label: '이탈리아', icon: '🍝', apiCategory: '이탈리아' },
  { id: 4, label: '일본', icon: '🍱', apiCategory: '일본' },
  { id: 5, label: '중국', icon: '🥢', apiCategory: '중국' },
  { id: 6, label: '동남아시아', icon: '🌶️', apiCategory: '동남아시아' },
  { id: 7, label: '퓨전', icon: '✨', apiCategory: '퓨전' },
];

export const getSituationCategoryById = (id) =>
  RECIPE_CATEGORIES.find((c) => String(c.id) === String(id));

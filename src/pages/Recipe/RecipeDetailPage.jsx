import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './RecipeDetailPage.css';

const RecipeDetailPage = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();

  // 임시 데이터 (나중에 API에서 가져올 수 있음)
  const recipe = {
    recipeId: 1,
    title: '김치찌개',
    thumbnailImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    source: '유튜브 - 릴리쿡 "김치찌개를 만들어보자~~"',
    likeCount: 8,
    reviewCount: 8,
    cookingTime: 30,
    difficulty: '초보',
    spicyLevel: 3,
    description: '잘 익은 김치로 보다니~ 너무 맛있을 것 같은 일품김치찌개를 알려드립니다~! 우리 같이 하는 방법입니다.',
    ingredients: [
      { name: '감자', checked: true },
      { name: '김치', checked: false }
    ]
  };

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(recipe.likeCount);
  const [ingredients, setIngredients] = useState(recipe.ingredients);

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleIngredientToggle = (index) => {
    const newIngredients = [...ingredients];
    newIngredients[index].checked = !newIngredients[index].checked;
    setIngredients(newIngredients);
  };

  const handleReviewClick = () => {
    navigate(`/recipe/${recipeId}/reviews`);
  };

  const handleWriteReviewClick = () => {
    navigate(`/recipe/${recipeId}/reviews/write`);
  };

  const handleLinkClick = () => {
    // 레시피 링크 처리
    alert('레시피 링크로 이동합니다.');
  };

  return (
    <div className="recipe-detail-page">
      {/* 헤더 */}
      <header className="recipe-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
      </header>

      {/* 레시피 이미지 */}
      <div className="recipe-image-section">
        <img src={recipe.thumbnailImage} alt={recipe.title} className="recipe-main-image" />
      </div>

      {/* 레시피 정보 */}
      <div className="recipe-content">
        <div className="recipe-header-info">
          <h1 className="recipe-detail-title">{recipe.title}</h1>
          <div className="recipe-actions">
            <button 
              className={`like-icon ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeToggle}
            >
              ❤️ {likeCount}
            </button>
            <span className="review-count">💬 {recipe.reviewCount}</span>
          </div>
        </div>

        <div className="recipe-tabs">
          <button className="tab-button active">공개자</button>
          <button className="tab-button">레시피</button>
        </div>

        {/* 내 냉장고 재료상황 */}
        <div className="refrigerator-status">
          <p className="status-title">내 냉장고 재료상황 ( 4 / 7 )</p>
          <p className="status-description">
            잘 익은 김치로 보다니~ 너무 맛있을 것 같은 일품김치찌개를 알려드립니다~! 우리 같이 하는 방법입니다.
          </p>
          <div className="difficulty-icons">
            <div className="difficulty-item">
              <span className="icon">👨</span>
              <span className="label">1인분</span>
            </div>
            <div className="difficulty-item">
              <span className="icon">⏱️</span>
              <span className="label">30분</span>
            </div>
            <div className="difficulty-item">
              <span className="icon">🔥</span>
              <span className="label">난이도 {recipe.spicyLevel}</span>
            </div>
          </div>
        </div>

        {/* 레시피 링크 */}
        <div className="recipe-link-section">
          <h3 className="section-title">🔗 레시피 링크</h3>
          <p className="recipe-source">{recipe.source}</p>
          <button className="link-button" onClick={handleLinkClick}>
            🔍 레시피 보러가기 &gt;
          </button>
        </div>

        {/* 필수 요리 재료 */}
        <div className="ingredients-section">
          <h3 className="section-title">🥕 필수 요리 재료</h3>
          <div className="ingredients-list">
            {ingredients.map((ingredient, index) => (
              <label key={index} className="ingredient-item">
                <input
                  type="checkbox"
                  checked={ingredient.checked}
                  onChange={() => handleIngredientToggle(index)}
                />
                <span>{ingredient.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 후기 섹션 */}
        <div className="review-section" onClick={handleReviewClick}>
          <div className="review-header">
            <h3 className="section-title">🍀 후기 ({recipe.reviewCount})</h3>
            <span className="view-more">&gt;</span>
          </div>
        </div>
      </div>

      {/* 후기 작성하기 버튼 */}
      <div className="write-review-section">
        <button className="write-review-button" onClick={handleWriteReviewClick}>
          <span className="heart-icon">❤️</span>
          후기 작성하기
        </button>
      </div>
    </div>
  );
};

export default RecipeDetailPage;

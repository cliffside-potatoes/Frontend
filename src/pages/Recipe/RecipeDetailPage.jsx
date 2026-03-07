import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecipeDetail, addWishlist, removeWishlist } from '../../api/recipeApi';
import './RecipeDetailPage.css';

const RecipeDetailPage = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [ingredients, setIngredients] = useState([]);

  // 레시피 데이터 로드
  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const data = await getRecipeDetail(recipeId);
        setRecipe(data);
        setIsLiked(data.liked || false);
        setLikeCount(data.likeCount || 0);
        setIngredients(data.ingredients || []);
      } catch (error) {
        console.error('레시피 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  const handleLikeToggle = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount(nextLiked ? likeCount + 1 : likeCount - 1);

    try {
      if (nextLiked) {
        await addWishlist(recipeId);
      } else {
        await removeWishlist(recipeId);
      }
    } catch (error) {
      console.error('찜 토글 실패:', error);
      setIsLiked(!nextLiked);
      setLikeCount(nextLiked ? likeCount - 1 : likeCount + 1);
    }
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
    if (recipe?.recipewithLink?.url) {
      window.open(recipe.recipewithLink.url, '_blank');
    } else {
      alert('레시피 링크가 없습니다.');
    }
  };

  if (loading) {
    return (
      <div className="recipe-detail-page">
        <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-page">
        <div style={{ padding: '20px', textAlign: 'center' }}>레시피를 찾을 수 없습니다.</div>
      </div>
    );
  }

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
          <p className="status-title">
            내 냉장고 재료상황 ({recipe.matchedIngredientCount || 0} / {recipe.totalIngredientCount || 0})
          </p>
          <p className="status-description">{recipe.description}</p>
          <div className="difficulty-icons">
            <div className="difficulty-item">
              <span className="icon">👨</span>
              <span className="label">{recipe.servings || 1}인분</span>
            </div>
            <div className="difficulty-item">
              <span className="icon">⏱️</span>
              <span className="label">{recipe.cookingTime || 30}분</span>
            </div>
            <div className="difficulty-item">
              <span className="icon">🔥</span>
              <span className="label">난이도 {recipe.difficulty}</span>
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

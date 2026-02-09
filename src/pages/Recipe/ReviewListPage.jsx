import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecipeReviews, getRecipeDetail } from '../../api/recipeApi';
import './ReviewListPage.css';

const ReviewListPage = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // 레시피 정보 및 후기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 레시피 정보 가져오기
        const recipeData = await getRecipeDetail(recipeId);
        setRecipe(recipeData);

        // 후기 목록 가져오기
        const reviewData = await getRecipeReviews(recipeId, { size: 20 });
        setReviews(reviewData.items);
        setTotalCount(reviewData.totalCount);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchData();
    }
  }, [recipeId]);

  const handleLikeToggle = (reviewId) => {
    setReviews(reviews.map(review => {
      if (review.reviewId === reviewId) {
        return {
          ...review,
          liked: !review.liked,
          likeCount: review.liked ? review.likeCount - 1 : review.likeCount + 1
        };
      }
      return review;
    }));
  };

  const handleWriteReview = () => {
    navigate(`/recipe/${recipeId}/reviews/write`);
  };

  if (loading) {
    return (
      <div className="review-list-page">
        <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="review-list-page">
      {/* 헤더 */}
      <header className="review-list-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h1 className="header-title">후기</h1>
        <button className="home-button" onClick={() => navigate('/main')}>
          🏠
        </button>
      </header>

      {/* 레시피 정보 */}
      {recipe && (
        <div className="recipe-summary">
          <div className="recipe-summary-image">
            <img 
              src={recipe.thumbnailImage} 
              alt={recipe.title} 
            />
          </div>
          <div className="recipe-summary-info">
            <h2 className="recipe-title">{recipe.title}</h2>
            <p className="recipe-source">{recipe.source}</p>
            <div className="recipe-tabs">
              <button className="tab-button active">공개자</button>
              <button className="tab-button">레시피</button>
            </div>
          </div>
        </div>
      )}

      {/* 후기 개수 */}
      <div className="review-count-section">
        <p className="total-reviews">총 {totalCount}개</p>
        <p className="sort-text">리뷰순 ⓘ</p>
      </div>

      {/* 후기 목록 */}
      <div className="review-list">
        {reviews.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            아직 작성된 후기가 없습니다.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.reviewId} className="review-item">
              <div className="review-header">
                <div className="review-user">
                  <div className="user-avatar">
                    {review.profileImage ? (
                      <img src={review.profileImage} alt={review.nickName} />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <div className="user-info">
                    <p className="user-name">{review.nickName}</p>
                    <p className="review-date">{review.updatedAt}</p>
                  </div>
                </div>
              </div>
              <div className="review-content-section">
                <p className="review-text">{review.content}</p>
                {review.images && review.images.length > 0 && (
                  <img src={review.images[0]} alt="후기 사진" className="review-image" />
                )}
              </div>
              {!review.hideLikeCount && (
                <div className="review-actions">
                  <button 
                    className={`like-button ${review.liked ? 'liked' : ''}`}
                    onClick={() => handleLikeToggle(review.reviewId)}
                  >
                    ❤️ {review.likeCount}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 후기 작성하기 버튼 */}
      <div className="write-review-fixed">
        <button className="write-review-button" onClick={handleWriteReview}>
          ❤️ 후기 작성하기
        </button>
      </div>
    </div>
  );
};

export default ReviewListPage;

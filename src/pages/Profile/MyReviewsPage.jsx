import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import { getMyFeed } from '../../api/meFeedApi';
import './MyReviewsPage.css';

const MyReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMyFeed({ type: 'RECIPE_REVIEW', size: 50, sort: 'LATEST' });
        const items = (result.items ?? []).map((item) => ({
          reviewId: item.id,
          recipeTitle: item.source ?? '레시피 후기',
          recipeId: item.recipeId ?? null,
          content: item.content ?? '',
          updatedAt: item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : '',
        }));
        setReviews(items);
      } catch (err) {
        console.error('내 후기 조회 실패:', err);
        setError('후기 목록을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleBack = () => navigate(-1);

  const handleReviewClick = (recipeId) => {
    if (recipeId) navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="my-reviews-page">
      <header className="my-reviews-header">
        <button type="button" className="mrv-header__back" onClick={handleBack} aria-label="뒤로가기">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="mrv-header__title">내가 쓴 후기</h1>
        <div className="mrv-header__spacer" />
      </header>

      <main className="my-reviews-main">
        {loading ? (
          <div className="my-reviews-empty">
            <p className="mrv-empty-text">불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="my-reviews-empty">
            <p className="mrv-empty-text">{error}</p>
          </div>
        ) : reviews.length > 0 ? (
          <ul className="my-reviews-list">
            {reviews.map((review) => (
              <li key={review.reviewId} className="my-reviews-item">
                <button
                  type="button"
                  className="my-reviews-item-button"
                  onClick={() => handleReviewClick(review.recipeId)}
                >
                  <span className="mrv-item-recipe">{review.recipeTitle}</span>
                  <p className="mrv-item-content">{review.content}</p>
                  <span className="mrv-item-date">{review.updatedAt}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="my-reviews-empty">
            <span className="material-symbols-outlined mrv-empty-icon">rate_review</span>
            <p className="mrv-empty-text">아직 작성한 후기가 없어요</p>
            <p className="mrv-empty-sub">레시피 후기를 작성해보세요!</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default MyReviewsPage;

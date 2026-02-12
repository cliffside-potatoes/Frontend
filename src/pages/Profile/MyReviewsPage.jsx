import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import './MyReviewsPage.css';

const MOCK_MY_REVIEWS = [
  {
    reviewId: 1,
    recipeTitle: '김치찌개',
    recipeId: 1,
    content: '오늘도 이걸 먹었다~~ 너무 맛있었다!',
    updatedAt: '2025년 12월 23일',
  },
];

const MyReviewsPage = () => {
  const navigate = useNavigate();
  const reviews = MOCK_MY_REVIEWS;

  const handleBack = () => navigate(-1);

  const handleReviewClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
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
        {reviews.length > 0 ? (
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

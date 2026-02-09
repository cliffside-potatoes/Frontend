import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ReviewListPage.css';

const ReviewListPage = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();

  // 임시 데이터
  const [reviews, setReviews] = useState([
    {
      reviewId: 1,
      userName: '사용자 닉네임',
      date: '2025년 12월 23일',
      content: '오늘도 이걸 먹었다~~ 너무 맛있었다이슈슬 이걸 먹었다 ~~ 너무 맛있었다~~ 너무 맛있...',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop',
      likeCount: 5,
      commentCount: 0,
      liked: false
    },
    {
      reviewId: 2,
      userName: '사용자 닉네임',
      date: '2025년 12월 23일',
      content: '오늘도 이걸 먹었다~~ 너무 맛있었다이슈슬 이걸 먹었다 ~~ 너무 맛있었다~~ 너무 맛있...',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop',
      likeCount: 5,
      commentCount: 0,
      liked: false
    },
    {
      reviewId: 3,
      userName: '사용자 닉네임',
      date: '2025년 12월 23일',
      content: '오늘도 이걸 먹었다~~ 너무 맛있었다이슈슬 이걸 먹었다 ~~ 너무 맛있었다~~ 너무 맛있...',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop',
      likeCount: 5,
      commentCount: 0,
      liked: false
    }
  ]);

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
      <div className="recipe-summary">
        <div className="recipe-summary-image">
          <img 
            src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop" 
            alt="김치찌개" 
          />
        </div>
        <div className="recipe-summary-info">
          <h2 className="recipe-title">김치찌개</h2>
          <p className="recipe-source">유튜브 - 릴리쿡 "김치찌개를 만들어보자~~"</p>
          <div className="recipe-tabs">
            <button className="tab-button active">공개자</button>
            <button className="tab-button">레시피</button>
          </div>
        </div>
      </div>

      {/* 후기 개수 */}
      <div className="review-count-section">
        <p className="total-reviews">총 8개</p>
        <p className="sort-text">리뷰순 ⓘ</p>
      </div>

      {/* 후기 목록 */}
      <div className="review-list">
        {reviews.map((review) => (
          <div key={review.reviewId} className="review-item">
            <div className="review-header">
              <div className="review-user">
                <div className="user-avatar">👤</div>
                <div className="user-info">
                  <p className="user-name">{review.userName}</p>
                  <p className="review-date">{review.date}</p>
                </div>
              </div>
            </div>
            <div className="review-content-section">
              <p className="review-text">{review.content}</p>
              {review.image && (
                <img src={review.image} alt="후기 사진" className="review-image" />
              )}
            </div>
            <div className="review-actions">
              <button 
                className={`like-button ${review.liked ? 'liked' : ''}`}
                onClick={() => handleLikeToggle(review.reviewId)}
              >
                ❤️ {review.likeCount}
              </button>
            </div>
          </div>
        ))}
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

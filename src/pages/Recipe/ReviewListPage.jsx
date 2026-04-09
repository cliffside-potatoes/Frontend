import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getRecipeReviews, getRecipeDetail, deleteRecipeReview } from '../../api/recipeApi';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import { useUser } from '../../context/UserContext';
import { buildSignInState } from '../../utils/authStorage';
import './ReviewListPage.css';

const SORT_OPTIONS = [
  { value: 'POPULAR', label: '인기순' },
  { value: 'LATEST', label: '최신순' },
];

const ReviewListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const { isLoggedIn } = useUser();

  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [sort, setSort] = useState('POPULAR');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [menuOpenReviewId, setMenuOpenReviewId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [localOverrides, setLocalOverrides] = useState({}); // { reviewId: { hideLikeCount, pinned } }
  const sortButtonRef = useRef(null);
  const menuRefs = useRef({});

  const fetchReviews = async () => {
    if (!recipeId) return;
    setLoading(true);
    try {
      const recipeData = await getRecipeDetail(recipeId);
      setRecipe(recipeData);
      const reviewData = await getRecipeReviews(recipeId, { size: 20, sort });
      setReviews(reviewData.items);
      setTotalCount(reviewData.totalCount);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [recipeId, sort]);

  const handleSortSelect = (value) => {
    setSort(value);
    setSortDropdownOpen(false);
  };

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

  const handleMenuSelect = (reviewId, action) => {
    setMenuOpenReviewId(null);
    if (action === 'pin') {
      setLocalOverrides(prev => ({
        ...prev,
        [reviewId]: { ...prev[reviewId], pinned: !(prev[reviewId]?.pinned) }
      }));
    } else if (action === 'hideLikeCount') {
      setLocalOverrides(prev => ({
        ...prev,
        [reviewId]: { ...prev[reviewId], hideLikeCount: !(prev[reviewId]?.hideLikeCount) }
      }));
    } else if (action === 'delete') {
      setDeleteTarget(reviewId);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await deleteRecipeReview(recipeId, deleteTarget);
    if (result.success) {
      setReviews(reviews.filter(r => r.reviewId !== deleteTarget));
      setTotalCount(prev => Math.max(0, prev - 1));
    }
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const handleWriteReview = () => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    const writeReviewPath = `/recipe/${recipeId}/reviews/write`;

    if (!isLoggedIn) {
      navigate('/signin', {
        state: buildSignInState(writeReviewPath, currentPath),
      });
      return;
    }

    navigate(writeReviewPath);
  };

  const getReviewDisplay = (review) => {
    const overrides = localOverrides[review.reviewId] || {};
    return {
      hideLikeCount: overrides.hideLikeCount ?? review.hideLikeCount ?? false,
      pinned: overrides.pinned ?? false,
    };
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

      {/* 후기 개수 및 정렬 */}
      <div className="review-count-section">
        <p className="total-reviews">총 {totalCount}개</p>
        <div className="sort-wrapper">
          <button
            ref={sortButtonRef}
            className="sort-button"
            onClick={() => setSortDropdownOpen(prev => !prev)}
          >
            {SORT_OPTIONS.find(o => o.value === sort)?.label || '인기순'} ▾
          </button>
          <Dropdown
            isOpen={sortDropdownOpen}
            onClose={() => setSortDropdownOpen(false)}
            anchorRef={sortButtonRef}
            options={SORT_OPTIONS}
            onSelect={handleSortSelect}
          />
        </div>
      </div>

      {/* 후기 목록 */}
      <div className="review-list">
        {reviews.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            아직 작성된 후기가 없습니다.
          </div>
        ) : (
          reviews.map((review) => {
            const display = getReviewDisplay(review);
            return (
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
                  <div className="review-menu-wrapper" ref={el => { menuRefs.current[review.reviewId] = el; }}>
                    <button
                      type="button"
                      className="review-menu-button"
                      onClick={() => setMenuOpenReviewId(menuOpenReviewId === review.reviewId ? null : review.reviewId)}
                      aria-label="메뉴"
                    >
                      ⋮
                    </button>
                    <Dropdown
                      isOpen={menuOpenReviewId === review.reviewId}
                      onClose={() => setMenuOpenReviewId(null)}
                      anchorRef={menuRefs.current[review.reviewId]}
                      options={[
                        { value: 'pin', label: display.pinned ? '프로필 고정 해제' : '프로필에 고정' },
                        { value: 'hideLikeCount', label: display.hideLikeCount ? '좋아요 수 표시' : '좋아요 수 숨기기' },
                        { value: 'delete', label: '삭제', danger: true },
                      ]}
                      onSelect={(val) => handleMenuSelect(review.reviewId, val)}
                    />
                  </div>
                </div>
                <div className="review-content-section">
                  <p className="review-text">{review.content}</p>
                  {review.images && review.images.length > 0 && (
                    <img src={review.images[0]} alt="후기 사진" className="review-image" />
                  )}
                </div>
                {!display.hideLikeCount && (
                  <div className="review-actions">
                    <button
                      className={`like-button ${review.liked ? 'liked' : ''}`}
                      onClick={() => handleLikeToggle(review.reviewId)}
                    >
                      {review.liked ? '❤️' : '♡'} {review.likeCount}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={handleDeleteCancel}
        title="후기를 삭제하시겠어요?"
        description="후기를 삭제하면 복원할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />

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

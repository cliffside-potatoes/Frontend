import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { deleteRecipeReview, getRecipeDetail, getRecipeReviews } from '../../api/recipeApi';
import profileImg from '../../assets/image/profile.png';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import { useUser } from '../../context/UserContext';
import { buildSignInState } from '../../utils/authStorage';
import { toImageUrl } from '../../utils/imageUrl';
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
  const [localOverrides, setLocalOverrides] = useState({});
  const [brokenImages, setBrokenImages] = useState({});
  const sortButtonRef = useRef(null);
  const menuRefs = useRef({});

  const markImageBroken = (key) => {
    setBrokenImages((prev) => ({ ...prev, [key]: true }));
  };

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
    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.reviewId !== reviewId) return review;

        return {
          ...review,
          liked: !review.liked,
          likeCount: review.liked ? review.likeCount - 1 : review.likeCount + 1,
        };
      })
    );
  };

  const handleMenuSelect = (reviewId, action) => {
    setMenuOpenReviewId(null);
    if (action === 'pin') {
      setLocalOverrides((prev) => ({
        ...prev,
        [reviewId]: { ...prev[reviewId], pinned: !(prev[reviewId]?.pinned) },
      }));
    } else if (action === 'hideLikeCount') {
      setLocalOverrides((prev) => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          hideLikeCount: !(prev[reviewId]?.hideLikeCount),
        },
      }));
    } else if (action === 'delete') {
      setDeleteTarget(reviewId);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await deleteRecipeReview(recipeId, deleteTarget);
    if (result.success) {
      setReviews((prev) => prev.filter((review) => review.reviewId !== deleteTarget));
      setTotalCount((prev) => Math.max(0, prev - 1));
    }
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
        <div className="review-list-state">로딩 중...</div>
      </div>
    );
  }

  const recipeImageUrl = toImageUrl(recipe?.thumbnailImage);
  const showRecipeImage = recipeImageUrl && !brokenImages.recipe;

  return (
    <div className="review-list-page">
      <header className="review-list-header">
        <button className="back-button" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="header-title">후기</h1>
        <button className="home-button" onClick={() => navigate('/main')} aria-label="홈">
          <span className="material-symbols-outlined">home</span>
        </button>
      </header>

      {recipe && (
        <div className="recipe-summary">
          <div className="recipe-summary-image">
            {showRecipeImage ? (
              <img
                src={recipeImageUrl}
                alt=""
                onError={() => markImageBroken('recipe')}
              />
            ) : (
              <span className="material-symbols-outlined" aria-hidden="true">
                restaurant
              </span>
            )}
          </div>
          <div className="recipe-summary-info">
            <h2 className="recipe-title">{recipe.title}</h2>
            <p className="recipe-source">{recipe.source}</p>
          </div>
        </div>
      )}

      <div className="review-count-section">
        <p className="total-reviews">총 {totalCount}개</p>
        <div className="sort-wrapper">
          <button
            ref={sortButtonRef}
            className="sort-button"
            onClick={() => setSortDropdownOpen((prev) => !prev)}
          >
            {SORT_OPTIONS.find((option) => option.value === sort)?.label || '인기순'}
            <span className="material-symbols-outlined" aria-hidden="true">
              expand_more
            </span>
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

      <div className="review-list">
        {reviews.length === 0 ? (
          <div className="review-list-state">아직 작성된 후기가 없습니다.</div>
        ) : (
          reviews.map((review) => {
            const display = getReviewDisplay(review);
            const profileKey = `profile-${review.reviewId}`;
            const profileImageUrl = toImageUrl(review.profileImage);
            const avatarUrl =
              profileImageUrl && !brokenImages[profileKey] ? profileImageUrl : profileImg;
            const reviewImageKey = `review-${review.reviewId}`;
            const reviewImageUrl = toImageUrl(review.images?.[0]);
            const showReviewImage = reviewImageUrl && !brokenImages[reviewImageKey];

            return (
              <div key={review.reviewId} className="review-item">
                <div className="review-header">
                  <div className="review-user">
                    <div className="user-avatar">
                      <img
                        src={avatarUrl}
                        alt=""
                        className="user-avatar-img"
                        onError={() => markImageBroken(profileKey)}
                      />
                    </div>
                    <div className="user-info">
                      <p className="user-name">{review.nickName}</p>
                      <p className="review-date">{review.updatedAt}</p>
                    </div>
                  </div>
                  <div
                    className="review-menu-wrapper"
                    ref={(element) => {
                      menuRefs.current[review.reviewId] = element;
                    }}
                  >
                    <button
                      type="button"
                      className="review-menu-button"
                      onClick={() =>
                        setMenuOpenReviewId(
                          menuOpenReviewId === review.reviewId ? null : review.reviewId
                        )
                      }
                      aria-label="메뉴"
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    <Dropdown
                      isOpen={menuOpenReviewId === review.reviewId}
                      onClose={() => setMenuOpenReviewId(null)}
                      anchorRef={menuRefs.current[review.reviewId]}
                      options={[
                        {
                          value: 'pin',
                          label: display.pinned ? '프로필 고정 해제' : '프로필에 고정',
                        },
                        {
                          value: 'hideLikeCount',
                          label: display.hideLikeCount ? '좋아요 수 표시' : '좋아요 수 숨기기',
                        },
                        { value: 'delete', label: '삭제', danger: true },
                      ]}
                      onSelect={(value) => handleMenuSelect(review.reviewId, value)}
                    />
                  </div>
                </div>

                <div className="review-content-section">
                  <p className="review-text">{review.content}</p>
                  {showReviewImage && (
                    <img
                      src={reviewImageUrl}
                      alt=""
                      className="review-image"
                      onError={() => markImageBroken(reviewImageKey)}
                    />
                  )}
                </div>

                {!display.hideLikeCount && (
                  <div className="review-actions">
                    <button
                      className={`like-button ${review.liked ? 'liked' : ''}`}
                      onClick={() => handleLikeToggle(review.reviewId)}
                    >
                      <span className="material-symbols-outlined">
                        {review.liked ? 'favorite' : 'favorite_border'}
                      </span>
                      {review.likeCount}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="후기를 삭제하시겠어요?"
        description="후기를 삭제하면 복원할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />

      <div className="write-review-fixed">
        <button className="write-review-button" onClick={handleWriteReview}>
          <span className="material-symbols-outlined" aria-hidden="true">
            edit
          </span>
          후기 작성하기
        </button>
      </div>
    </div>
  );
};

export default ReviewListPage;

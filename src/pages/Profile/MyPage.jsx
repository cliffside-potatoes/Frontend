import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import FeedCard from '../../components/card/FeedCard';
import { getMyFeed } from '../../api/meFeedApi';
import { useUser } from '../../context/UserContext';
import profileImg from '../../assets/image/profile.png';
import './MyPage.css';

const MAX_POST_IMAGES = 5;
const FEED_PAGE_SIZE = 20;

/** API item을 FeedCard용 post 형태로 변환 (createdAt은 정렬/커서용) */
const mapFeedItemToPost = (item, authorName) => {
  const createdAt = item.createdAt || '';
  const dateStr =
    createdAt &&
    (() => {
      try {
        return new Date(createdAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return createdAt;
      }
    })();

  return {
    id: item.id,
    type: item.type,
    author: authorName,
    date: dateStr,
    content: item.content ?? '',
    images: item.images ?? [],
    image: (item.images && item.images[0]) ?? '',
    likeCount: item.likeCount ?? 0,
    liked: false,
    hideLikeCount: Boolean(item.hideLikeCount),
    pinned: Boolean(item.pinned),
    createdAt,
    updatedAt: item.updatedAt ?? createdAt,
    cookCount: item.cookCount ?? 0,
  };
};

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isInitializing } = useUser(); // ⭐ 여기 수정

  useEffect(() => {
    // ⭐ UserContext 초기화 끝날 때까지 기다림
    if (isInitializing) return;

    if (!isLoggedIn) {
      navigate('/signin', { replace: true });
    }
  }, [isInitializing, isLoggedIn, navigate]);

  const displayUser = user ?? {
    nickname: '사용자 닉네임',
    id: '',
    triedCount: 0,
    bio: '아직 자기소개가 없어요😊',
    profileImage: '',
  };

  const [postItems, setPostItems] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState(null);

  const [postMenuPostId, setPostMenuPostId] = useState(null);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState(null);

  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;

    setLoading(true);
    setFeedError(null);

    getMyFeed({ type: 'POST', size: FEED_PAGE_SIZE, sort: 'LATEST' })
      .then(({ items, hasNext: next, nextCursor: cursor }) => {
        if (!cancelled) {
          setPostItems(
            items.map((item) =>
              mapFeedItemToPost(item, displayUser.nickname)
            )
          );
          setHasNext(next);
          setNextCursor(cursor);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeedError('게시글을 불러올 수 없습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, displayUser.nickname]);

  const openPostMenu = (e, postId) => {
    e.stopPropagation();
    setPostMenuPostId(postId);
  };

  const closePostMenu = () => {
    setPostMenuPostId(null);
  };

  const openDeleteConfirm = (postId) => {
    setPostMenuPostId(null);
    setDeleteConfirmPostId(postId);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmPostId(null);
  };

  const handleDeletePost = () => {
    if (deleteConfirmPostId) {
      setPostItems((prev) => prev.filter((p) => p.id !== deleteConfirmPostId));
      setDeleteConfirmPostId(null);
    }
  };

  const sortedPosts = [...postItems].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return bTime - aTime;
  });

  return (
    <div className="mypage">
      <header className="mypage-header">
        <button
          type="button"
          className="icon-button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>

        <h1 className="mypage-title">마이페이지</h1>

        <button
          type="button"
          className="icon-button"
          aria-label="설정"
          onClick={() => navigate('/profile/settings')}
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="mypage-content">
        <section className="profile-section">
          <div className="profile-main">
            <div className="profile-avatar">
              <img
                src={displayUser.profileImage || profileImg}
                alt="프로필"
                className="profile-avatar-image"
              />
            </div>

            <div className="profile-info-line">
              <div>
                <span className="profile-nickname">
                  {displayUser.nickname}&nbsp;&nbsp;
                </span>
                <span className="profile-id">
                  {displayUser.id ? `@${displayUser.id}` : ''}
                </span>
              </div>

              <div className="profile-count-div">
                <span className="profile-count">
                  🍽 도전한 음식 수 :
                  <span className="highlight">{displayUser.triedCount}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="profile-bio-div">
            <p className="profile-bio">{displayUser.bio}</p>
          </div>

          <button type="button" className="profile-edit-button">
            프로필 편집
          </button>
        </section>

        <section className="mypage-tabs-section">
          <div className="mypage-posts">
            {loading && sortedPosts.length === 0 && (
              <p className="mypage-posts-loading">게시글을 불러오는 중...</p>
            )}

            {feedError && sortedPosts.length === 0 && (
              <p className="mypage-posts-error">{feedError}</p>
            )}

            {sortedPosts.map((post) => (
              <div key={post.id} className="mypage-post-item">
                <FeedCard
                  post={post}
                  isMine
                  avatarUrl={displayUser.profileImage || profileImg}
                  onOpenMenu={openPostMenu}
                />

                {postMenuPostId === post.id && (
                  <>
                    <div
                      className="modal-backdrop"
                      onClick={closePostMenu}
                    />
                    <div className="modal post-menu-modal">
                      <button
                        type="button"
                        className="post-menu-item post-menu-item-delete"
                        onClick={() => openDeleteConfirm(post.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {deleteConfirmPostId && (
        <>
          <div className="modal-backdrop" onClick={closeDeleteConfirm} />
          <div className="modal delete-confirm-modal">
            <h3 className="delete-confirm-title">
              게시물을 삭제하시겠어요?
            </h3>

            <div className="delete-confirm-actions">
              <button
                type="button"
                className="delete-confirm-btn-delete"
                onClick={handleDeletePost}
              >
                삭제
              </button>

              <button
                type="button"
                className="delete-confirm-btn-cancel"
                onClick={closeDeleteConfirm}
              >
                취소
              </button>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default MyPage;
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import FeedCard from '../../components/card/FeedCard';
import { getMyFeed } from '../../api/meFeedApi';
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
  const user = {
    nickname: '사용자 닉네임',
    id: '@사용자아이디',
    triedCount: 7,
    bio: '아직 자기소개가 없어요😊',
  };

  const [postItems, setPostItems] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState(null);

  const [postMenuPostId, setPostMenuPostId] = useState(null);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState(null);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [draftImages, setDraftImages] = useState([]);
  const fileInputRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFeedError(null);
    getMyFeed({ type: 'POST', size: FEED_PAGE_SIZE, sort: 'LATEST' })
      .then(({ items, hasNext: next, nextCursor: cursor }) => {
        if (!cancelled) {
          setPostItems(items.map((item) => mapFeedItemToPost(item, user.nickname)));
          setHasNext(next);
          setNextCursor(cursor);
        }
      })
      .catch(() => {
        if (!cancelled) setFeedError('게시글을 불러올 수 없습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const openPostMenu = (e, postId) => {
    e.stopPropagation();
    setPostMenuPostId(postId);
  };

  const closePostMenu = () => setPostMenuPostId(null);

  const openDeleteConfirm = (postId) => {
    setPostMenuPostId(null);
    setDeleteConfirmPostId(postId);
  };

  const closeDeleteConfirm = () => setDeleteConfirmPostId(null);

  const handleDeletePost = () => {
    if (deleteConfirmPostId) {
      setPostItems((prev) => prev.filter((p) => p.id !== deleteConfirmPostId));
      setDeleteConfirmPostId(null);
    }
  };

  const handleToggleHideLikeCount = (postId) => {
    setPostItems((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, hideLikeCount: !p.hideLikeCount } : p))
    );
    setPostMenuPostId(null);
  };

  const handleTogglePin = (postId) => {
    setPostItems((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p))
    );
    setPostMenuPostId(null);
  };

  const handleToggleLike = (postId) => {
    setPostItems((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.liked;
        return {
          ...p,
          liked: nextLiked,
          likeCount: Math.max(0, p.likeCount + (nextLiked ? 1 : -1)),
        };
      })
    );
  };

  const sortedPosts = [...postItems].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  const openWriteModal = (post = null) => {
    if (post) {
      setEditingPostId(post.id);
      setDraftContent(post.content);
      setDraftImages(
        post.images && post.images.length > 0
          ? [...post.images]
          : post.image
            ? [post.image]
            : []
      );
    } else {
      setEditingPostId(null);
      setDraftContent('');
      setDraftImages([]);
    }
    setPostMenuPostId(null);
    setWriteModalOpen(true);
  };

  const closeWriteModal = () => {
    setWriteModalOpen(false);
    setEditingPostId(null);
    setDraftContent('');
    setDraftImages([]);
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageSelect = (e) => {
    const files = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      e.target.value = '';
      return;
    }
    Promise.all(files.map(readFileAsDataUrl)).then((urls) => {
      setDraftImages((prev) => [...prev, ...urls].slice(0, MAX_POST_IMAGES));
    });
    e.target.value = '';
  };

  const removeDraftImage = (index) => {
    setDraftImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePost = () => {
    const images = draftImages.length > 0 ? draftImages : [];
    const image = images[0] || '';
    const nowIso = new Date().toISOString();
    const dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    if (editingPostId) {
      setPostItems((prev) =>
        prev.map((p) =>
          p.id === editingPostId
            ? { ...p, content: draftContent, image, images, updatedAt: nowIso }
            : p
        )
      );
    } else {
      setPostItems((prev) => {
        const nextId = Math.max(0, ...prev.map((p) => p.id)) + 1;
        return [
          {
            id: nextId,
            type: 'POST',
            author: user.nickname,
            date: dateStr,
            content: draftContent,
            image,
            images,
            likeCount: 0,
            liked: false,
            hideLikeCount: false,
            pinned: false,
            createdAt: nowIso,
            updatedAt: nowIso,
            cookCount: 0,
          },
          ...prev,
        ];
      });
    }
    closeWriteModal();
  };

  const editingPost = editingPostId ? postItems.find((p) => p.id === editingPostId) : null;

  return (
    <div className="mypage">
      <header className="mypage-header">
        <button type="button" className="icon-button" aria-label="뒤로가기">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="mypage-title">마이페이지</h1>
        <button type="button" className="icon-button" aria-label="설정" onClick={() => navigate('/profile/settings')}>
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="mypage-content">
        <section className="profile-section">
          <div className="profile-main">
            <div className="profile-avatar">
              <img src={profileImg} alt="프로필" className="profile-avatar-image" />
            </div>
            <div className="profile-info-line">
              <div>
                <span className="profile-nickname">{user.nickname}&nbsp;&nbsp;</span>
                <span className="profile-id">{user.id}</span>
              </div>
              <div className="profile-count-div">
                <span className="profile-count">
                  🍽 도전한 음식 수 : <span className="highlight">{user.triedCount}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="profile-bio-div">
            <p className="profile-bio">{user.bio}</p>
          </div>
          <button type="button" className="profile-edit-button">
            프로필 편집
          </button>

          <div className="profile-shortcuts">
            <button type="button" className="shortcut-card">
              <span className="shortcut-icon">🔎</span>
              <span className="shortcut-label">my 냉장고</span>
            </button>
            <button type="button" className="shortcut-card">
              <span className="shortcut-icon">🔖</span>
              <span className="shortcut-label">레시피 저장</span>
            </button>
          </div>
        </section>

        <section className="mypage-tabs-section">
          <div className="mypage-tabs">
            <button type="button" className="tab active">
              게시물
            </button>
            <button type="button" className="tab">
              마음에 들어요
            </button>
          </div>

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
                  avatarUrl={profileImg}
                  onToggleLike={handleToggleLike}
                  onOpenMenu={openPostMenu}
                />
                {postMenuPostId === post.id && (
                  <>
                    <div className="modal-backdrop" onClick={closePostMenu} aria-hidden="true" />
                    <div className="modal post-menu-modal">
                      <button type="button" className="post-menu-item" onClick={() => openWriteModal(post)}>
                        게시글 수정
                      </button>
                      <button type="button" className="post-menu-item" onClick={() => handleTogglePin(post.id)}>
                        {post.pinned ? '프로필 고정 해제' : '프로필에 고정'}
                      </button>
                      <button type="button" className="post-menu-item" onClick={() => handleToggleHideLikeCount(post.id)}>
                        {post.hideLikeCount ? '좋아요 수 보이기' : '좋아요 수 숨기기'}
                      </button>
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

      <button
        type="button"
        className="floating-write-button"
        aria-label="게시물 작성"
        onClick={() => openWriteModal()}
      >
        <span className="material-symbols-outlined">add</span>
      </button>

      {deleteConfirmPostId && (
        <>
          <div className="modal-backdrop" onClick={closeDeleteConfirm} aria-hidden="true" />
          <div className="modal delete-confirm-modal">
            <h3 className="delete-confirm-title">게시물을 삭제하시겠어요?</h3>
            <p className="delete-confirm-message">
              이 게시물을 삭제하면 복원할 수 없습니다.
            </p>
            <div className="delete-confirm-actions">
              <button type="button" className="delete-confirm-btn-delete" onClick={handleDeletePost}>
                삭제
              </button>
              <button type="button" className="delete-confirm-btn-cancel" onClick={closeDeleteConfirm}>
                취소
              </button>
            </div>
          </div>
        </>
      )}

      {writeModalOpen && (
        <>
          <div className="modal-backdrop write-modal-backdrop" onClick={closeWriteModal} aria-hidden="true" />
          <div className={`write-modal ${writeModalOpen ? 'write-modal-open' : ''}`}>
            <header className="write-modal-header">
              <button type="button" className="icon-button" onClick={closeWriteModal} aria-label="닫기">
                <span className="material-symbols-outlined">arrow_back_ios</span>
              </button>
              <h2 className="write-modal-title">
                {editingPostId ? '게시글 수정' : '새로운 게시글'}
              </h2>
            </header>
            <div className="write-modal-user">
              <img src={profileImg} alt="" className="write-modal-avatar" />
              <div>
                <p className="write-modal-nickname">{user.nickname}</p>
                <p className="write-modal-prompt">
                  {editingPostId ? '수정할 내용을 입력해주세요' : '새로운 글을 작성해주세요'}
                </p>
              </div>
            </div>
            <div className="write-modal-body">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="write-modal-file-input"
                aria-hidden="true"
                onChange={handleImageSelect}
              />
              <div className="write-modal-image-row">
                {draftImages.map((src, i) => (
                  <div key={i} className="write-modal-image-placeholder">
                    <img src={src} alt="" className="write-modal-preview" />
                    <button type="button" className="write-modal-image-remove" onClick={() => removeDraftImage(i)} aria-label="사진 제거">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ))}
                {draftImages.length < MAX_POST_IMAGES && (
                  <button type="button" className="write-modal-add-image-btn" onClick={() => fileInputRef.current?.click()}>
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                    사진 추가 ({draftImages.length}/{MAX_POST_IMAGES})
                  </button>
                )}
                <button type="button" className="write-modal-save-btn" onClick={handleSavePost}>
                  저장
                </button>
              </div>
              <textarea
                className="write-modal-textarea"
                placeholder="내용을 입력하세요..."
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default MyPage;

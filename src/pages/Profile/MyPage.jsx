import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import FeedCard from '../../components/card/FeedCard';
import { getMyFeed } from '../../api/meFeedApi';
import { useUser } from '../../context/UserContext';
import { useMyPosts } from '../../context/MyPostsContext';
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

const mergePostsByIdPreferLocal = (localPosts, serverPosts) => {
  // ✅ localPosts를 우선으로 유지하면서, 서버에만 있는 글은 추가
  // (추후 백엔드 연동 시에도 로컬에서 만든 글/수정한 글을 덮어버리지 않도록)
  const map = new Map();
  (serverPosts || []).forEach((p) => map.set(p.id, p));
  (localPosts || []).forEach((p) => map.set(p.id, { ...(map.get(p.id) || {}), ...p }));
  return Array.from(map.values());
};

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUser();

  // ✅ MyPage도 Feed와 동일한 게시글 원본 상태를 사용
  const { posts: myPosts, setPosts } = useMyPosts();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const displayUser = user ?? {
    nickname: '사용자 닉네임',
    id: '',
    triedCount: 0,
    bio: '아직 자기소개가 없어요😊',
    profileImage: '',
  };

  // --- 아래 상태들은 기존 코드 유지 (추후 무한스크롤/백엔드 연결 대비) ---
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const loadMoreRef = useRef(null);

  const [postMenuPostId, setPostMenuPostId] = useState(null);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState(null);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [draftImages, setDraftImages] = useState([]);
  const fileInputRef = useRef(null);

  // ✅ 서버(또는 목데이터)에서 내 피드(POST만) 초기 로딩 → Context에 합치기
  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;
    setLoading(true);
    setFeedError(null);

    getMyFeed({ type: 'POST', size: FEED_PAGE_SIZE, sort: 'LATEST' })
      .then(({ items, hasNext: next, nextCursor: cursor }) => {
        if (cancelled) return;

        const serverPosts = (items || []).map((item) => mapFeedItemToPost(item, displayUser.nickname));

        // ✅ 이미 로컬에 작성/수정한 글이 있어도 덮어쓰지 않고 합치기
        setPosts((prev) => mergePostsByIdPreferLocal(prev, serverPosts));

        setHasNext(Boolean(next));
        setNextCursor(cursor ?? null);
      })
      .catch(() => {
        if (!cancelled) setFeedError('게시글을 불러올 수 없습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, displayUser.nickname, setPosts]);

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
      // ✅ Context에서 삭제 → Feed에도 반영됨
      setPosts((prev) => prev.filter((p) => p.id !== deleteConfirmPostId));
      setDeleteConfirmPostId(null);
    }
  };

  const handleToggleHideLikeCount = (postId) => {
    // ✅ Context에서 토글 → Feed에도 반영됨
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, hideLikeCount: !p.hideLikeCount } : p))
    );
    setPostMenuPostId(null);
  };

  const handleTogglePin = (postId) => {
    // ✅ Context에서 토글 → Feed에도 반영됨
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p))
    );
    setPostMenuPostId(null);
  };

  const handleToggleLike = (postId) => {
    // ✅ Context에서 토글 → Feed에도 반영됨
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.liked;
        return {
          ...p,
          liked: nextLiked,
          likeCount: Math.max(0, (p.likeCount ?? 0) + (nextLiked ? 1 : -1)),
        };
      })
    );
  };

  const sortedPosts = [...(myPosts || [])].sort((a, b) => {
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
      // ✅ Context에서 수정 → Feed에도 반영됨
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPostId
            ? { ...p, content: draftContent, image, images, updatedAt: nowIso }
            : p
        )
      );
    } else {
      // ✅ Context에서 생성 → Feed에도 반영됨 + localStorage에 남음
      setPosts((prev) => {
        const nextId = Math.max(0, ...(prev || []).map((p) => (typeof p.id === 'number' ? p.id : 0))) + 1;
        return [
          {
            id: nextId,
            type: 'POST',
            author: displayUser.nickname,
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
          ...(prev || []),
        ];
      });
    }

    closeWriteModal();
  };

  const editingPost = editingPostId ? (myPosts || []).find((p) => p.id === editingPostId) : null;

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
              <img src={displayUser.profileImage || profileImg} alt="프로필" className="profile-avatar-image" />
            </div>
            <div className="profile-info-line">
              <div>
                <span className="profile-nickname">{displayUser.nickname}&nbsp;&nbsp;</span>
                <span className="profile-id">{displayUser.id ? `@${displayUser.id}` : ''}</span>
              </div>
              <div className="profile-count-div">
                <span className="profile-count">
                  🍽 도전한 음식 수 : <span className="highlight">{displayUser.triedCount}</span>
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
                  avatarUrl={displayUser.profileImage || profileImg}
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

            <div className="write-modal-body">
              {/* 유저 정보 행 */}
              <div className="write-modal-user-row">
                <img src={displayUser.profileImage || profileImg} alt="" className="write-modal-avatar" />
                <span className="write-modal-nickname">{displayUser.nickname}</span>
              </div>

              {/* 본문 및 액션 영역 */}
              <div className="write-modal-content-area">
                <textarea
                  className="write-modal-textarea"
                  placeholder={editingPostId ? '수정할 내용을 입력해주세요' : '새로운 글을 작성해주세요'}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  rows={5}
                />

                {/* 이미지 미리보기 */}
                {draftImages.length > 0 && (
                  <div className="write-modal-image-row">
                    {draftImages.map((src, i) => (
                      <div key={i} className="write-modal-image-placeholder">
                        <img src={src} alt="" className="write-modal-preview" />
                        <button type="button" className="write-modal-image-remove" onClick={() => removeDraftImage(i)} aria-label="사진 제거">
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 하단 액션 버튼들 */}
                <div className="write-modal-actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="write-modal-file-input"
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                  />
                  <button type="button" className="write-modal-add-image-btn" onClick={() => fileInputRef.current?.click()}>
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                    {draftImages.length > 0 && `(${draftImages.length}/${MAX_POST_IMAGES})`}
                  </button>
                  <button type="button" className="write-modal-save-btn" onClick={handleSavePost}>
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default MyPage;

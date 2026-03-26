import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMyPosts } from '../../context/MyPostsContext';
import { useUser } from '../../context/UserContext';
import BottomNav from '../../components/common/BottomNav';
import FeedCard from '../../components/card/FeedCard';
import { getFeed } from '../../api/feedApi';
import { createPost, updatePost, deletePost } from '../../api/postApi';
import { buildSignInState } from '../../utils/authStorage';
import profileImg from '../../assets/image/profile.png';
import './Feed.css';

const MAX_POST_IMAGES = 5;

const toTime = (value) => {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
};

const mapApiItemToPost = (item) => ({
  id: item.id,
  type: item.type,
  author: item.writer?.nickname ?? item.author ?? '사용자',
  date: item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '',
  createdAt: item.createdAt ?? '',
  updatedAt: item.updatedAt ?? item.createdAt ?? '',
  content: item.content ?? '',
  images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
  image: Array.isArray(item.images) ? (item.images[0] ?? '') : (item.image ?? ''),
  likeCount: item.likeCount ?? 0,
  liked: Boolean(item.liked),
  hideLikeCount: Boolean(item.hidLikeCount ?? item.hideLikeCount),
  pinned: Boolean(item.pinned),
  isMine: Boolean(item.isMine),
});

const Feed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUser();
  const { posts: myPosts, setPosts } = useMyPosts();

  const currentNickname = user?.nickname ?? '사용자 닉네임';
  const currentProfileImg = user?.profileImage || profileImg;

  const myPostIds = useMemo(() => new Set((myPosts || []).map((p) => p.id)), [myPosts]);

  const [serverFeed, setServerFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  const [postMenuPostId, setPostMenuPostId] = useState(null);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState(null);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [draftImages, setDraftImages] = useState([]);
  const [otherPostsLike, setOtherPostsLike] = useState({});
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const loadFeed = useCallback(async (cursor = null) => {
    setFeedLoading(true);
    try {
      const params = { size: 20, sort: 'LATEST' };
      if (cursor) {
        params.cursorCreatedAt = cursor.cursorCreatedAt;
        params.cursorId = cursor.cursorId;
      }
      const result = await getFeed(params);
      const mapped = (result.items ?? []).map(mapApiItemToPost);
      setServerFeed((prev) => cursor ? [...prev, ...mapped] : mapped);
      setHasNext(Boolean(result.hasNext));
      setNextCursor(result.nextCursor ?? null);
    } catch (error) {
      console.error('피드 조회 실패:', error);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  const navigateToSignIn = (redirectPath = '/feed') => {
    navigate('/signin', {
      state: buildSignInState(redirectPath, currentPath),
    });
  };

  const feedList = useMemo(() => {
    const serverIds = new Set(serverFeed.map((p) => p.id));
    const localOnly = (myPosts || []).filter((p) => !serverIds.has(p.id));
    const combined = [
      ...serverFeed,
      ...localOnly.map((p) => ({ ...p, isOther: false })),
    ];
    return combined.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
  }, [serverFeed, myPosts]);

  const openPostMenu = (e, postId) => {
    e.stopPropagation();
    setPostMenuPostId(postId);
  };

  const closePostMenu = () => setPostMenuPostId(null);

  useEffect(() => {
    if (postMenuPostId) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [postMenuPostId]);

  useEffect(() => {
    if (writeModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [writeModalOpen]);

  const openDeleteConfirm = (postId) => {
    setPostMenuPostId(null);
    setDeleteConfirmPostId(postId);
  };

  const closeDeleteConfirm = () => setDeleteConfirmPostId(null);

  const handleDeletePost = async () => {
    if (!deleteConfirmPostId) return;
    if (!isLoggedIn) {
      navigateToSignIn('/feed');
      return;
    }

    try {
      await deletePost(deleteConfirmPostId);
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
    }
    setPosts((prev) => (prev || []).filter((p) => p.id !== deleteConfirmPostId));
    setServerFeed((prev) => prev.filter((p) => p.id !== deleteConfirmPostId));
    setDeleteConfirmPostId(null);
  };

  const handleToggleHideLikeCount = (postId) => {
    setPosts((prev) =>
      (prev || []).map((p) => (p.id === postId ? { ...p, hideLikeCount: !p.hideLikeCount } : p))
    );
    setPostMenuPostId(null);
  };

  const handleTogglePin = (postId) => {
    setPosts((prev) =>
      (prev || []).map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p))
    );
    setPostMenuPostId(null);
  };

  const handleToggleLike = (postId) => {
    if (myPostIds.has(postId)) {
      setPosts((prev) =>
        (prev || []).map((p) => {
          if (p.id !== postId) return p;
          const nextLiked = !p.liked;
          return {
            ...p,
            liked: nextLiked,
            likeCount: Math.max(0, (p.likeCount ?? 0) + (nextLiked ? 1 : -1)),
          };
        })
      );
    } else {
      setOtherPostsLike((prev) => {
        const current = prev[postId] ?? false;
        return { ...prev, [postId]: !current };
      });
    }
  };

  const openWriteModal = (post = null) => {
    if (!isLoggedIn) {
      navigateToSignIn('/feed');
      return;
    }

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

  const handleSavePost = async () => {
    if (!isLoggedIn) {
      navigateToSignIn('/feed');
      return;
    }

    const trimmed = draftContent.trim();
    if (trimmed.length < 1) return;
    if (trimmed.length > 500) return;

    const images = draftImages.slice(0, MAX_POST_IMAGES);
    const image = images[0] || '';
    const nowIso = new Date().toISOString();
    const dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    if (editingPostId) {
      try {
        await updatePost(editingPostId, { content: trimmed, images });
      } catch (error) {
        console.error('게시글 수정 실패:', error);
      }
      setPosts((prev) =>
        (prev || []).map((p) =>
          p.id === editingPostId ? { ...p, content: trimmed, image, images, updatedAt: nowIso } : p
        )
      );
      setServerFeed((prev) =>
        prev.map((p) =>
          p.id === editingPostId ? { ...p, content: trimmed, image, images, updatedAt: nowIso } : p
        )
      );
    } else {
      let newId = Date.now();
      try {
        const result = await createPost({ content: trimmed, images });
        if (result.success && result.data?.id) newId = result.data.id;
      } catch (error) {
        console.error('게시글 생성 실패:', error);
      }

      const newPost = {
        id: newId,
        type: 'POST',
        author: currentNickname,
        date: dateStr,
        createdAt: nowIso,
        updatedAt: nowIso,
        content: trimmed,
        image,
        images,
        likeCount: 0,
        liked: false,
        hideLikeCount: false,
        pinned: false,
        isMine: true,
      };

      setPosts((prev) => [newPost, ...(prev || [])]);
    }

    closeWriteModal();
  };

  const getPostForCard = (item) => {
    const isMine = myPostIds.has(item.id) || Boolean(item.isMine);
    if (!isMine) {
      const liked = otherPostsLike[item.id] ?? item.liked;
      const likeCount = (item.likeCount ?? 0) + (liked ? 1 : 0) - (item.liked ? 1 : 0);
      return { ...item, liked, likeCount: Math.max(0, likeCount) };
    }
    return item;
  };

  return (
    <div className="feed-page">
      <header className="feed-header">
        <button type="button" className="icon-button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="feed-title">피드</h1>
        <button type="button" className="icon-button" aria-label="검색">
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      <main className="feed-content">
        <button type="button" className="feed-new-story" onClick={() => openWriteModal()}>
          <div className="feed-new-story-avatar">
            <img src={profileImg} alt="" />
          </div>
          <span className="feed-new-story-placeholder">새로운 이야기가 있나요?</span>
        </button>

        {feedLoading && feedList.length === 0 && (
          <p style={{ padding: '16px', textAlign: 'center', color: '#888' }}>피드 불러오는 중...</p>
        )}

        <div className="feed-list">
          {feedList.map((item) => {
            const post = getPostForCard(item);
            const isMine = myPostIds.has(post.id) || Boolean(post.isMine);
            return (
              <div key={post.id} className="feed-card-wrap">
                <FeedCard
                  post={post}
                  isMine={isMine}
                  avatarUrl={profileImg}
                  onToggleLike={handleToggleLike}
                  onOpenMenu={openPostMenu}
                />
                {postMenuPostId === post.id && (
                  <>
                    <div className="modal-backdrop" onClick={closePostMenu} aria-hidden="true" />
                    <div className="modal post-menu-modal feed-post-menu">
                      <button type="button" className="post-menu-item" onClick={() => openWriteModal(post)}>
                        게시글 수정
                      </button>
                      <hr className="post-menu-item-hr" />

                      <button type="button" className="post-menu-item" onClick={() => handleTogglePin(post.id)}>
                        {post.pinned ? '프로필 고정 해제' : '프로필에 고정'}
                      </button>
                      <hr className="post-menu-item-hr" />

                      <button type="button" className="post-menu-item" onClick={() => handleToggleHideLikeCount(post.id)}>
                        {post.hideLikeCount ? '좋아요 수 보이기' : '좋아요 수 숨기기'}
                      </button>
                      <hr className="post-menu-item-hr" />

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
            );
          })}
          {hasNext && (
            <button
              type="button"
              className="feed-load-more"
              onClick={() => loadFeed(nextCursor)}
              disabled={feedLoading}
              style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'center', background: 'none', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', color: '#666', margin: '8px 0' }}
            >
              {feedLoading ? '불러오는 중...' : '더 보기'}
            </button>
          )}
        </div>
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
            <p className="delete-confirm-message">이 게시물을 삭제하면 복원할 수 없습니다.</p>
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="write-modal-file-input"
                aria-hidden="true"
                onChange={handleImageSelect}
              />
              <div className="write-modal-user-row">
                <img src={currentProfileImg} alt="" className="write-modal-avatar" />
                <span className="write-modal-nickname">{currentNickname}</span>
                <span className="write-modal-spacer" />
              </div>
              <div className="write-modal-content-area">
                <textarea
                  ref={textareaRef}
                  className="write-modal-textarea"
                  placeholder={editingPostId ? '수정할 내용을 입력해주세요' : '새로운 글을 작성해주세요'}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  maxLength={500}
                  rows={5}
                />
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
                <div className="write-modal-actions">
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

      {!writeModalOpen && <BottomNav />}
    </div>
  );
};

export default Feed;

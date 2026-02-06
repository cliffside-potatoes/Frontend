import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyPosts } from '../../context/MyPostsContext';
import BottomNav from '../../components/common/BottomNav';
import FeedCard from '../../components/card/FeedCard';
import profileImg from '../../assets/image/profile.png';
import './Feed.css';

const CURRENT_USER_NICKNAME = '사용자 닉네임';
const MAX_POST_IMAGES = 5;

const otherUsersPosts = [
  {
    id: 'other-1',
    author: '친구A',
    date: '2025년 12월 24일',
    createdAt: new Date('2025-12-24').getTime(),
    content: '오늘 점심 뭐 먹지? 추천 받아요~',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc84e?w=600&h=600&fit=crop',
    likeCount: 12,
    liked: false,
    hideLikeCount: false,
    pinned: false,
  },
  {
    id: 'other-2',
    author: '요리왕',
    date: '2025년 12월 22일',
    createdAt: new Date('2025-12-22').getTime(),
    content: '홈메이드 피자 도전! 결과는 대만족 🍕',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=600&fit=crop',
    likeCount: 24,
    liked: false,
    hideLikeCount: false,
    pinned: false,
  },
];

const Feed = () => {
  const navigate = useNavigate();
  const { posts: myPosts, setPosts } = useMyPosts();
  const myPostIds = useMemo(() => new Set(myPosts.map((p) => p.id)), [myPosts]);

  const [postMenuPostId, setPostMenuPostId] = useState(null);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState(null);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [draftImages, setDraftImages] = useState([]);
  const [otherPostsLike, setOtherPostsLike] = useState({});
  const fileInputRef = useRef(null);

  const feedList = useMemo(() => {
    const combined = [...otherUsersPosts.map((p) => ({ ...p, isOther: true })), ...myPosts.map((p) => ({ ...p, isOther: false }))];
    return combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [myPosts]);

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

  const openDeleteConfirm = (postId) => {
    setPostMenuPostId(null);
    setDeleteConfirmPostId(postId);
  };

  const closeDeleteConfirm = () => setDeleteConfirmPostId(null);

  const handleDeletePost = () => {
    if (deleteConfirmPostId) {
      setPosts((prev) => prev.filter((p) => p.id !== deleteConfirmPostId));
      setDeleteConfirmPostId(null);
    }
  };

  const handleToggleHideLikeCount = (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, hideLikeCount: !p.hideLikeCount } : p))
    );
    setPostMenuPostId(null);
  };

  const handleTogglePin = (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p))
    );
    setPostMenuPostId(null);
  };

  const handleToggleLike = (postId) => {
    if (myPostIds.has(postId)) {
      setPosts((prev) =>
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
    } else {
      setOtherPostsLike((prev) => {
        const current = prev[postId] ?? false;
        return { ...prev, [postId]: !current };
      });
    }
  };

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
    if (editingPostId) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPostId
            ? { ...p, content: draftContent, image, images: images }
            : p
        )
      );
    } else {
      setPosts((prev) => [
        ...prev,
        {
          id: Math.max(0, ...prev.map((p) => p.id)) + 1,
          author: CURRENT_USER_NICKNAME,
          date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
          createdAt: Date.now(),
          content: draftContent,
          image,
          images,
          likeCount: 0,
          liked: false,
          hideLikeCount: false,
          pinned: false,
        },
      ]);
    }
    closeWriteModal();
  };

  const getPostForCard = (item) => {
    if (item.isOther) {
      const liked = otherPostsLike[item.id] ?? item.liked;
      const likeCount = item.likeCount + (liked ? 1 : 0) - (item.liked ? 1 : 0);
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

        <div className="feed-list">
          {feedList.map((item) => {
            const post = getPostForCard(item);
            const isMine = myPostIds.has(post.id);
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
                      <hr className="post-menu-item-hr"/>

                      <button type="button" className="post-menu-item" onClick={() => handleTogglePin(post.id)}>
                        {post.pinned ? '프로필 고정 해제' : '프로필에 고정'}
                      </button>
                      <hr className="post-menu-item-hr"/>
                      <button type="button" className="post-menu-item" onClick={() => handleToggleHideLikeCount(post.id)}>
                        {post.hideLikeCount ? '좋아요 수 보이기' : '좋아요 수 숨기기'}
                      </button>                                          <hr className="post-menu-item-hr"/>


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
            <div className="write-modal-user">
              <img src={profileImg} alt="" className="write-modal-avatar" />
              <div>
                <p className="write-modal-nickname">{CURRENT_USER_NICKNAME}</p>
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

export default Feed;

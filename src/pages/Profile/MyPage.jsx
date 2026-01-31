import React, { useState } from 'react';
import BottomNav from '../../components/common/BottomNav';
import profileImg from '../../assets/image/profile.png';
import './MyPage.css';

const MyPage = () => {
  const user = {
    nickname: '사용자 닉네임',
    id: '@사용자아이디',
    triedCount: 7,
    bio: '아직 자기소개가 없어요😊',
  };

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: user.nickname,
      date: '2025년 12월 23일',
      createdAt: new Date('2025-12-23').getTime(),
      content: '오늘은 이걸 먹었다~ 너무 맛있었다!',
      image:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop',
      likeCount: 5,
      liked: false,
      hideLikeCount: false,
      pinned: false,
    },
    {
      id: 2,
      author: user.nickname,
      date: '2025년 12월 20일',
      createdAt: new Date('2025-12-20').getTime(),
      content: '주말에 파스타 만들어봤어요 🍝',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=600&fit=crop',
      likeCount: 3,
      liked: true,
      hideLikeCount: false,
      pinned: false,
    },
    {
      id: 3,
      author: user.nickname,
      date: '2025년 12월 15일',
      createdAt: new Date('2025-12-15').getTime(),
      content: '간단한 볶음밥 레시피~',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=600&fit=crop',
      likeCount: 8,
      liked: false,
      hideLikeCount: false,
      pinned: false,
    },
  ]);

  const [postMenuPostId, setPostMenuPostId] = useState(null);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState(null);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [draftImage, setDraftImage] = useState('');

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
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const openWriteModal = (post = null) => {
    if (post) {
      setEditingPostId(post.id);
      setDraftContent(post.content);
      setDraftImage(post.image || '');
    } else {
      setEditingPostId(null);
      setDraftContent('');
      setDraftImage('');
    }
    setPostMenuPostId(null);
    setWriteModalOpen(true);
  };

  const closeWriteModal = () => {
    setWriteModalOpen(false);
    setEditingPostId(null);
    setDraftContent('');
    setDraftImage('');
  };

  const handleSavePost = () => {
    if (editingPostId) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPostId
            ? { ...p, content: draftContent, image: draftImage || p.image }
            : p
        )
      );
    } else {
      setPosts((prev) => [
        ...prev,
        {
          id: Math.max(0, ...prev.map((p) => p.id)) + 1,
          author: user.nickname,
          date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
          createdAt: Date.now(),
          content: draftContent,
          image: draftImage || '',
          likeCount: 0,
          liked: false,
          hideLikeCount: false,
          pinned: false,
        },
      ]);
    }
    closeWriteModal();
  };

  const editingPost = editingPostId ? posts.find((p) => p.id === editingPostId) : null;

  return (
    <div className="mypage">
      <header className="mypage-header">
        <button type="button" className="icon-button" aria-label="뒤로가기">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="mypage-title">마이페이지</h1>
        <button type="button" className="icon-button" aria-label="설정">
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
            {sortedPosts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-avatar">
                  <img src={profileImg} alt="" className="post-avatar-img" />
                </div>
                <div className="post-header-right">
                  <div className="post-author-info">
                    <span className="post-author-name">{post.author}</span>
                    <span className="post-date">
                      {post.date}
                      {post.pinned && <span className="post-pinned" title="프로필에 고정">📌</span>}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="icon-button small"
                    aria-label="메뉴 열기"
                    onClick={(e) => openPostMenu(e, post.id)}
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
                <p className="post-content">{post.content}</p>
                <div className="post-images">
                  {post.image ? (
                    <img src={post.image} alt={post.content} className="post-image" />
                  ) : (
                    <div className="post-image-placeholder" />
                  )}
                  <div className="post-image-placeholder" />
                </div>
                <div className="post-footer">
                  <button
                    type="button"
                    className={`post-like-button ${post.liked ? 'liked' : ''}`}
                    onClick={() => handleToggleLike(post.id)}
                    aria-label={post.liked ? '좋아요 취소' : '좋아요'}
                  >
                    <span className="material-symbols-outlined">
                      {post.liked ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                  {!post.hideLikeCount && (
                    <span className="post-like-count">{post.likeCount}</span>
                  )}
                </div>

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
              </article>
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
              <div className="write-modal-image-row">
                <div className="write-modal-image-placeholder">
                  {draftImage ? (
                    <img src={draftImage} alt="" className="write-modal-preview" />
                  ) : (
                    <span className="material-symbols-outlined">image</span>
                  )}
                </div>
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

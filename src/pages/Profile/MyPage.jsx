import React from 'react';
import BottomNav from '../../components/common/BottomNav';
import profileImg from '../../assets/image/profile.png';
import './MyPage.css';

const MyPage = () => {
  // TODO: 실제 로그인 사용자 정보 / API 연동으로 교체
  const user = {
    nickname: '사용자 닉네임',
    id: '@사용자아이디',
    triedCount: 7,
    bio: '아직 자기소개가 없어요😊',
  };

  const posts = [
    {
      id: 1,
      author: user.nickname,
      date: '2025년 12월 23일',
      content: '오늘은 이걸 먹었다~ 너무 맛있었다!',
      image:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop',
      likeCount: 5,
    },
  ];

  return (
    <div className="mypage">
      {/* 상단 헤더 */}
      <header className="mypage-header">
        <button type="button" className="icon-button" aria-label="뒤로가기">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="mypage-title">마이페이지</h1>
        <button type="button" className="icon-button" aria-label="설정">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      {/* 프로필 영역 */}
      <main className="mypage-content">
        <section className="profile-section">
          <div className="profile-main">
            <div className="profile-avatar">
              <img
                src={profileImg}
                alt="프로필"
                className="profile-avatar-image"
              />
            </div>
            <div className="profile-info-line">
              <div>
              <span className="profile-nickname">{user.nickname}&nbsp;&nbsp;</span>
              <span className="profile-id">{user.id}</span><div className="profile-info-line2">

              </div>
              <div className="profile-count-div">
              <span className="profile-count">
                🍽 도전한 음식 수 : <span className="highlight">{user.triedCount}</span>
              </span>
              </div>
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

        {/* 탭 + 게시물 리스트 */}
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
            {posts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-avatar" />
                <div className="post-header-right">
                  <div className="post-author-info">
                    <span className="post-author-name">{post.author}</span>
                    <span className="post-date">{post.date}</span>
                  </div>
                  <button type="button" className="icon-button small" aria-label="메뉴 열기">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
                <p className="post-content">{post.content}</p>
                <div className="post-images">
                  <img src={post.image} alt={post.content} className="post-image" />
                  <div className="post-image-placeholder" />
                </div>
                <div className="post-footer">
                  <span className="post-like-count">♡ {post.likeCount}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* 글쓰기 플로팅 버튼 */}
      <button type="button" className="floating-write-button" aria-label="게시물 작성">
        <span className="material-symbols-outlined">add</span>
      </button>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default MyPage;


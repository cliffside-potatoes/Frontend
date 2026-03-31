import React, { useState } from 'react';
import profileImg from '../../assets/image/profile.png';
import './FeedCard.css';

const getImages = (post) => {
  if (post.images && Array.isArray(post.images) && post.images.length > 0) {
    return post.images;
  }

  if (post.image) {
    return [post.image];
  }

  return [];
};

const FeedCard = ({
  post,
  isMine,
  avatarUrl,
  onToggleLike,
  onOpenMenu,
}) => {
  const images = getImages(post);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const safeAvatarUrl = avatarUrl || profileImg;

  return (
    <article className="feed-card">
      <div className="feed-card-avatar">
        <img src={safeAvatarUrl} alt="" className="feed-card-avatar-img" />
      </div>

      <div className="feed-card-header-right">
        <div className="feed-card-author-info">
          <span className="feed-card-author-name">{post.author}</span>
          <span className="feed-card-date">
            {post.date}
            {post.pinned && (
              <span className="feed-card-pinned" title="프로필에 고정">
                📌
              </span>
            )}
          </span>
        </div>

        {isMine && (
          <button
            type="button"
            className="icon-button small"
            aria-label="메뉴 열기"
            onClick={(e) => onOpenMenu?.(e, post.id)}
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        )}
      </div>

      <div className="feed-card-body">
        <p className="feed-card-content">{post.content}</p>

        {images.length > 0 && (
          <div
            className={`feed-card-images ${images.length === 1
                ? 'feed-card-images-single'
                : 'feed-card-images-multi'
              }`}
          >
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                className="feed-card-image-wrap"
                onClick={() => setLightboxSrc(src)}
                aria-label="사진 전체 보기"
              >
                <img src={src} alt={post.content} className="feed-card-image" />
              </button>
            ))}
          </div>
        )}

        {lightboxSrc && (
          <>
            <div
              className="feed-card-lightbox-backdrop"
              onClick={() => setLightboxSrc(null)}
              aria-hidden="true"
            />
            <div
              className="feed-card-lightbox"
              onClick={() => setLightboxSrc(null)}
              role="dialog"
              aria-modal="true"
              aria-label="사진 전체 보기"
            >
              <img
                src={lightboxSrc}
                alt=""
                className="feed-card-lightbox-img"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                className="feed-card-lightbox-close"
                onClick={() => setLightboxSrc(null)}
                aria-label="닫기"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </>
        )}

        <div className="feed-card-footer">
          <button
            type="button"
            className={`feed-card-like-button ${post.liked ? 'liked' : ''}`}
            onClick={() => onToggleLike(post.id)}
            aria-label={post.liked ? '좋아요 취소' : '좋아요'}
          >
            <span className="material-symbols-outlined">
              {post.liked ? 'favorite' : 'favorite_border'}
            </span>
          </button>

          {!post.hideLikeCount && (
            <span className="feed-card-like-count">{post.likeCount}</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default FeedCard;
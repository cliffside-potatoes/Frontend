import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecipeReview } from '../../api/recipeApi';
import profileImg from '../../assets/image/profile.png';
import { useUser } from '../../context/UserContext';
import { toImageUrl } from '../../utils/imageUrl';
import './ReviewWritePage.css';

const ReviewWritePage = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const { user } = useUser();
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarSrc = toImageUrl(user?.profileImage) || profileImg;
  const userName = user?.nickname || user?.name || '사용자';

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (trimmedContent.length > 500) {
      alert('내용은 500자 이하로 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createRecipeReview(recipeId, {
        content: trimmedContent,
        images: [],
      });

      if (result.success) {
        alert('후기가 작성되었습니다.');
        navigate(`/recipe/${recipeId}/reviews`);
      } else {
        alert('후기 작성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('후기 작성 오류:', error);
      alert('후기 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-write-page">
      <header className="review-write-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h1 className="header-title">후기 작성하기</h1>
      </header>

      <div className="user-section">
        <div className="user-avatar">
          <img src={avatarSrc} alt="" className="user-avatar-img" />
        </div>
        <div className="user-info">
          <p className="user-name">{userName}</p>
          <p className="user-instruction">새로운 글을 작성해주세요</p>
        </div>
      </div>

      <div className="write-section">
        <div className="image-upload-section">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          <button className="image-upload-button" onClick={handleImageClick}>
            {imagePreview ? (
              <img src={imagePreview} alt="미리보기" className="image-preview" />
            ) : (
              <div className="image-placeholder">
                <span className="material-symbols-outlined" aria-hidden="true">
                  add_photo_alternate
                </span>
              </div>
            )}
          </button>
        </div>

        <textarea
          className="content-textarea"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </div>

      <div className="submit-section">
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
};

export default ReviewWritePage;

import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecipeReview } from '../../api/recipeApi';
import './ReviewWritePage.css';

const ReviewWritePage = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (content.length > 500) {
      alert('내용은 500자 이하로 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 이미지 업로드 처리 (실제로는 이미지를 서버에 업로드하고 URL을 받아야 함)
      const images = [];
      if (imagePreview) {
        // TODO: 실제 이미지 업로드 API 호출
        // 현재는 mock으로 preview URL 사용
        images.push(imagePreview);
      }

      const result = await createRecipeReview(recipeId, {
        images,
        content: content.trim()
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
      {/* 헤더 */}
      <header className="review-write-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h1 className="header-title">후기 작성하기</h1>
      </header>

      {/* 사용자 정보 */}
      <div className="user-section">
        <div className="user-avatar">👤</div>
        <div className="user-info">
          <p className="user-name">사용자 닉네임</p>
          <p className="user-instruction">새로운 글을 작성해주세요</p>
        </div>
      </div>

      {/* 작성 영역 */}
      <div className="write-section">
        {/* 이미지 업로드 */}
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
                🖼️
              </div>
            )}
          </button>
        </div>

        {/* 텍스트 입력 */}
        <textarea
          className="content-textarea"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* 저장 버튼 */}
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

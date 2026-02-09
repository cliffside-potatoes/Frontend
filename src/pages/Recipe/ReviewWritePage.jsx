import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ReviewWritePage.css';

const ReviewWritePage = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleSubmit = () => {
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    // TODO: API 호출하여 후기 저장
    console.log('후기 작성:', { content, image });
    
    // 후기 목록으로 이동
    navigate(`/recipe/${recipeId}/reviews`);
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
        <button className="submit-button" onClick={handleSubmit}>
          저장
        </button>
      </div>
    </div>
  );
};

export default ReviewWritePage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 API 연동
    navigate('/main', { replace: true });
  };

  return (
    <div className="signin-page">
      <div className="signin-modal">
        <button type="button" className="signin-close" onClick={handleClose} aria-label="닫기">
          ✕
        </button>
        <h1 className="signin-title">로그인</h1>
        <h2 className="signin-heading">냉장고 구하기</h2>
        <p className="signin-subtitle">집에 있는 재료들만으로 맛있는 한끼를!</p>
        <div className="signin-illustration">
          <div className="signin-illustration-fridge" />
        </div>
        <button type="button" className="signin-kakao-btn" onClick={handleKakaoLogin}>
          <span className="signin-kakao-icon" />
          카카오 로그인
        </button>
      </div>
    </div>
  );
};

export default SignInPage;

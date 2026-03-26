import React from 'react';
import { useNavigate } from 'react-router-dom';
import kakaoLoginBtn from '../../assets/kakao_login_medium_narrow.png';
import { clearLoggedOutMarker } from '../../utils/authStorage';
import './SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || '';
  const LOGIN_PATH = import.meta.env.VITE_KAKAO_LOGIN_START_PATH || '/login';

  const handleKakaoLogin = () => {
    // 다시 로그인 시도하는 순간 로그아웃 마커 해제
    clearLoggedOutMarker();

    const base = API_BASE_URL.replace(/\/$/, '');
    const path = LOGIN_PATH.startsWith('/') ? LOGIN_PATH : `/${LOGIN_PATH}`;
    window.location.href = `${base}${path}`;
  };

  const handleClose = () => {
    navigate(-1);
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

        <div
          className="signin-kakao-container"
          onClick={handleKakaoLogin}
          style={{ cursor: 'pointer', marginTop: '20px' }}
        >
          <img
            src={kakaoLoginBtn}
            alt="카카오 로그인"
            style={{ width: '100%', maxWidth: '200px', display: 'block', margin: '0 auto' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import kakaoLoginBtn from '../../assets/kakao_login_medium_narrow.png';
import {
  savePostLoginRedirect,
  toRedirectPath,
} from '../../utils/authStorage';
import './SignInPage.css';

const SignInPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || '';
  const LOGIN_PATH = import.meta.env.VITE_KAKAO_LOGIN_START_PATH || '/login';

  const fromPath = toRedirectPath(location.state?.from) ?? '/main';
  const backgroundPath =
    toRedirectPath(location.state?.backgroundPath) ?? '/main';

  const handleKakaoLogin = () => {
    const base = API_BASE_URL.replace(/\/$/, '');
    const path = LOGIN_PATH.startsWith('/') ? LOGIN_PATH : `/${LOGIN_PATH}`;

    savePostLoginRedirect(fromPath);
    window.location.href = `${base}${path}`;
  };

  const handleClose = () => {
    navigate(backgroundPath, { replace: true });
  };

  return (
    <div className="signin-page">
      <div className="signin-modal">
        <button
          type="button"
          className="signin-close"
          onClick={handleClose}
          aria-label="닫기"
        >
          ✕
        </button>
        <h1 className="signin-title">로그인</h1>
        <h2 className="signin-heading">냉장고 구하러 가기</h2>
        <p className="signin-subtitle">
          집에 있는 재료로 맛있는 레시피를 찾아봐요
        </p>

        <div
          className="signin-kakao-container"
          onClick={handleKakaoLogin}
          style={{ cursor: 'pointer', marginTop: '20px' }}
        >
          <img
            src={kakaoLoginBtn}
            alt="카카오로 로그인"
            style={{
              width: '100%',
              maxWidth: '200px',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import kakaoLoginBtn from '../../assets/kakao_login_medium_narrow.png';
import './SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();

  // ✅ 카카오 REST API 키 (그대로)
  const REST_API_KEY = "fb385c5f153fb98a5cd07c284b1291ce";

  // ✅ 중요: 현재 접속 도메인 기준으로 redirect_uri 자동 생성
  // - localhost에서 실행하면 localhost로
  // - test.naeng-gu.kr에서 실행하면 test.naeng-gu.kr로
  const REDIRECT_URI = `${window.location.origin}/oauth/callback/kakao`;

  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code`;

  const handleClose = () => {
    navigate(-1);
  };

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
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

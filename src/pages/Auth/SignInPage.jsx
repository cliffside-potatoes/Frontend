import React from 'react';
import { useNavigate } from 'react-router-dom';
// 1. 이미지 파일 import (파일 구조에 맞춰서 경로 설정)
import kakaoLoginBtn from '../../assets/kakao_login_medium_narrow.png';
import './SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();

// 2. 카카오 설정 정보
const REST_API_KEY = "fb385c5f153fb98a5cd07c284b1291ce";
const REDIRECT_URI = "http://localhost:5173/oauth/callback/kakao";  

// 주석과 코드를 분리했습니다.
const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

const handleClose = () => {
  navigate(-1);
};

  const handleKakaoLogin = () => {
    // 카카오 로그인 페이지로 이동
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
        
        {/* 이미지형 버튼으로 변경 */}
        <div className="signin-kakao-container" onClick={handleKakaoLogin} style={{ cursor: 'pointer', marginTop: '20px' }}>
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
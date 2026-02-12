import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation 추가
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './SignUpPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 중요: 카카오 콜백에서 넘겨준 step이 있으면(location.state.step) 그 값으로 시작합니다.
  const [step, setStep] = useState(location.state?.step || 0);
  
  // ... (기존 state 변수들: agreeAll, nickname 등 동일)
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeOptional, setAgreeOptional] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [userId, setUserId] = useState('');

  // 카카오 설정 (회원가입 페이지에서도 시작 버튼을 누를 수 있으므로)
  const REST_API_KEY = "fb385c5f153fb98a5cd07c284b1291ce";
  const REDIRECT_URI = "http://localhost:5173/oauth/callback/kakao";
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  const handleKakaoStart = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  const handleAgreeAndContinue = () => {
    if (!agreeRequired) return;
    setStep(2);
  };

  // ... (기존 핸들러 함수들: handleAgreeAllChange, handleProfileSetup 등 동일)
  const handleClose = () => navigate(-1);
  const handleAgreeAllChange = (e) => {
    const checked = e.target.checked;
    setAgreeAll(checked);
    setAgreeRequired(checked);
    setAgreeOptional(checked);
  };
  const handleProfileSetup = () => navigate('/main', { replace: true });
  const handleGoToProfile = () => setStep(2);

  return (
    <div className="auth-page">
      <div className="auth-modal">
        {/* 기존 리턴문(Step 0, 1, 2) 코드를 그대로 붙여넣으세요 */}
        {/* 단, Step 0의 버튼 onClick은 handleKakaoStart를 호출합니다. */}
        <button type="button" className="auth-close" onClick={handleClose}>✕</button>

        {step === 0 && (
          <div className="auth-step auth-step-welcome">
             <h1 className="auth-title">회원가입</h1>
             <button type="button" className="auth-kakao-btn" onClick={handleKakaoStart}>
               카카오로 시작하기
             </button>
          </div>
        )}
        
        {/* ... Step 1, Step 2 코드 생략 (기존과 동일) */}
      </div>
    </div>
  );
};

export default SignUpPage;
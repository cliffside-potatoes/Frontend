import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './SignUpPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(location.state?.step || 0);

  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeOptional, setAgreeOptional] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [userId, setUserId] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || '';
  const LOGIN_PATH = import.meta.env.VITE_KAKAO_LOGIN_START_PATH || '/login';

  const handleKakaoStart = () => {
    const base = API_BASE_URL.replace(/\/$/, '');
    const path = LOGIN_PATH.startsWith('/') ? LOGIN_PATH : `/${LOGIN_PATH}`;
    const loginUrl = `${base}${path}`;
    window.location.assign(loginUrl);
  };

  const handleAgreeAndContinue = () => {
    if (!agreeRequired) return;
    setStep(2);
  };

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
        <button type="button" className="auth-close" onClick={handleClose}>✕</button>

        {step === 0 && (
          <div className="auth-step auth-step-welcome">
            <h1 className="auth-title">회원가입</h1>
            <button type="button" className="auth-kakao-btn" onClick={handleKakaoStart}>
              카카오로 시작하기
            </button>
          </div>
        )}

        {/* 너가 원래 쓰던 Step 1, Step 2 UI는 그대로 유지하면 됨.
            (지금은 너가 코드에 "생략"이라고 적어둔 상태라 여기에도 그대로 둠) */}
      </div>
    </div>
  );
};

export default SignUpPage;

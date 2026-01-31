import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './SignUpPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeOptional, setAgreeOptional] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [userId, setUserId] = useState('');

  const handleClose = () => {
    navigate(-1);
  };

  const handleKakaoStart = () => {
    setStep(1);
  };

  const handleAgreeAllChange = (e) => {
    const checked = e.target.checked;
    setAgreeAll(checked);
    setAgreeRequired(checked);
    setAgreeOptional(checked);
  };

  const handleAgreeAndContinue = () => {
    if (!agreeRequired) return;
    setStep(2);
  };

  const handleProfileSetup = () => {
    navigate('/main', { replace: true });
  };

  const handleGoToProfile = () => {
    setStep(2);
  };

  return (
    <div className="auth-page">
      <div className="auth-modal">
        <button type="button" className="auth-close" onClick={handleClose} aria-label="닫기">
          ✕
        </button>

        {/* Step 0: 카카오로 시작하기 */}
        {step === 0 && (
          <div className="auth-step auth-step-welcome">
            <h1 className="auth-title">회원가입</h1>
            <h2 className="auth-heading">냉장고 구하기</h2>
            <p className="auth-subtitle">집에 있는 재료들만으로 맛있는 한끼를!</p>
            <div className="auth-illustration">
              <div className="auth-illustration-fridge" />
            </div>
            <button type="button" className="auth-kakao-btn" onClick={handleKakaoStart}>
              <span className="auth-kakao-icon" />
              카카오로 시작하기
            </button>
          </div>
        )}

        {/* Step 1: 카카오 동의 화면 */}
        {step === 1 && (
          <div className="auth-step auth-step-agree">
            <h1 className="auth-title">회원가입</h1>
            <div className="auth-app-info">
              <img src={naengGuIcon} alt="" className="auth-app-icon" />
              <div>
                <span className="auth-app-name">냉장고 구하기</span>
                <span className="auth-app-en">save a refrigerator</span>
              </div>
            </div>
            <label className="auth-checkbox-row auth-checkbox-all">
              <input
                type="checkbox"
                checked={agreeAll}
                onChange={handleAgreeAllChange}
              />
              <span>전체 동의하기</span>
            </label>
            <p className="auth-agree-desc">
              전체동의는 카카오 및 SAM APPAREL의 서비스 동의를 포함하고 있습니다.
              전체동의는 선택목적에 대한 동의를 포함하고 있으며, 선택목적에 대한 동의를
              거부해도 서비스 이용이 가능합니다.
            </p>
            <div className="auth-consent-section">
              <p className="auth-consent-title">카카오 동의 항목</p>
              <label className="auth-checkbox-row">
                <input
                  type="checkbox"
                  checked={agreeRequired}
                  onChange={(e) => {
                    setAgreeRequired(e.target.checked);
                    setAgreeAll(agreeOptional && e.target.checked);
                  }}
                />
                <span>[필수] 카카오 개인정보 제3자 제공 동의</span>
                <button type="button" className="auth-link-btn">보기</button>
              </label>
              <label className="auth-checkbox-row">
                <input
                  type="checkbox"
                  checked={agreeOptional}
                  onChange={(e) => {
                    setAgreeOptional(e.target.checked);
                    setAgreeAll(agreeRequired && e.target.checked);
                  }}
                />
                <span>[선택] 선택 제공 항목</span>
                <button type="button" className="auth-link-btn">보기</button>
              </label>
              <div className="auth-consent-sub">
                <span>카카오계정(이메일)</span>
                <span>암호화된 이용자 확인값(CI)</span>
              </div>
            </div>
            <button
              type="button"
              className="auth-primary-btn"
              disabled={!agreeRequired}
              onClick={handleAgreeAndContinue}
            >
              동의하고 계속하기
            </button>
            <button type="button" className="auth-cancel-btn" onClick={handleClose}>
              취소
            </button>
          </div>
        )}

        {/* Step 2: 프로필 설정 */}
        {step === 2 && (
          <div className="auth-step auth-step-profile">
            <h1 className="auth-title">회원가입 &gt; 프로필 설정</h1>
            <div className="auth-profile-welcome">
              <p className="auth-welcome-text">반갑습니다!</p>
              <div className="auth-app-info">
                <img src={naengGuIcon} alt="" className="auth-app-icon" />
                <span className="auth-app-name">저희 함께 냉장고를 구해봐요!</span>
              </div>
              <button type="button" className="auth-profile-go-btn" onClick={handleGoToProfile}>
                프로필 설정하러 가기
              </button>
            </div>
            <div className="auth-profile-form">
              <h2 className="auth-form-title">프로필 설정</h2>
              <div className="auth-profile-photo">
                <div className="auth-profile-photo-placeholder">
                  <span className="material-symbols-outlined">camera_alt</span>
                </div>
              </div>
              <div className="auth-form-field">
                <label>닉네임</label>
                <div className="auth-input-row">
                  <input
                    type="text"
                    placeholder="닉네임을 입력하세요"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                  <button type="button" className="auth-dup-btn">중복 확인</button>
                </div>
                <p className="auth-hint">닉네임에는 영문, 숫자, 밑줄, 마침표만 사용할 수 있습니다.</p>
              </div>
              <div className="auth-form-field">
                <label>자기소개</label>
                <input
                  type="text"
                  placeholder="아직 자기소개가 없어요😊"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div className="auth-form-field">
                <label>사용자 아이디</label>
                <input
                  type="text"
                  placeholder="@ 사용자 아이디"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="auth-input-readonly"
                />
              </div>
              <button type="button" className="auth-primary-btn auth-finish-btn" onClick={handleProfileSetup}>
                냉장고 구하러가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;

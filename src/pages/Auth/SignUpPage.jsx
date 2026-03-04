import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './SignUpPage.css';
import { createOrUpdateProfile, checkNicknameDuplicate } from '../../api/profileApi';
import { useUser } from '../../context/UserContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  // step: 0(동의) -> 1(반갑습니다) -> 2(프로필 설정)
  const initialStep = useMemo(() => {
    // /new-info로 들어오면 동의부터
    if (location.pathname === '/new-info') return 0;
    // 다른 곳에서 state로 step 넘긴 경우
    if (typeof location.state?.step === 'number') return location.state.step;
    return 0;
  }, [location.pathname, location.state]);

  const [step, setStep] = useState(initialStep);

  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeOptional, setAgreeOptional] = useState(false);

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('아직 자기소개가 없어요😊');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [dupLoading, setDupLoading] = useState(false);
  const [dupChecked, setDupChecked] = useState(false);
  const [dupOk, setDupOk] = useState(false);
  const [dupMsg, setDupMsg] = useState('');

  const [saving, setSaving] = useState(false);

  const handleClose = () => navigate(-1);

  const handleAgreeAllChange = (e) => {
    const checked = e.target.checked;
    setAgreeAll(checked);
    setAgreeRequired(checked);
    setAgreeOptional(checked);
  };

  const handleAgreeRequiredChange = (e) => {
    const checked = e.target.checked;
    setAgreeRequired(checked);
    // 전체동의는 부분 체크되면 false로 맞추는게 UX 좋아서
    setAgreeAll(checked && agreeOptional);
  };

  const handleAgreeOptionalChange = (e) => {
    const checked = e.target.checked;
    setAgreeOptional(checked);
    setAgreeAll(checked && agreeRequired);
  };

  const handleAgreeAndContinue = () => {
    if (!agreeRequired) return;
    setStep(1);
  };

  const goProfileSetup = () => setStep(2);

  const validateNickname = (value) => {
    // 영문/숫자/_/. 1~20
    const re = /^[a-zA-Z0-9_.]{1,20}$/;
    return re.test(value);
  };

  const onChangeNickname = (e) => {
    const v = e.target.value;
    setNickname(v);
    // 닉네임 바꾸면 중복확인 다시 해야함
    setDupChecked(false);
    setDupOk(false);
    setDupMsg('');
  };

  const handleCheckDuplicate = async () => {
    const v = nickname.trim();
    if (!validateNickname(v)) {
      setDupChecked(true);
      setDupOk(false);
      setDupMsg('닉네임은 영문/숫자/_/. 만 가능하고 1~20자야');
      return;
    }

    setDupLoading(true);
    setDupChecked(false);
    setDupOk(false);
    setDupMsg('');

    try {
      const ok = await checkNicknameDuplicate(v);
      // ok=true면 사용 가능
      setDupChecked(true);
      setDupOk(ok);
      setDupMsg(ok ? '사용 가능한 닉네임이야' : '이미 사용중인 닉네임이야');
    } catch (e) {
      setDupChecked(true);
      setDupOk(false);
      setDupMsg('중복 확인 실패했어. 잠깐 뒤에 다시 해줘');
    } finally {
      setDupLoading(false);
    }
  };

  const handleSubmitProfile = async () => {
    const v = nickname.trim();
    if (!validateNickname(v)) {
      setDupChecked(true);
      setDupOk(false);
      setDupMsg('닉네임 형식이 맞는지 먼저 확인해줘');
      return;
    }
    if (!dupOk) {
      setDupChecked(true);
      setDupOk(false);
      setDupMsg('닉네임 중복 확인 먼저 해줘');
      return;
    }

    setSaving(true);
    try {
      // ✅ 백엔드 연결 가능한 형태: 프로필 생성/수정 API 호출(지금은 구현/스펙 불명이라 안전하게 mock fallback)
      const res = await createOrUpdateProfile({
        nickname: v,
        bio: bio ?? '',
        profileImageUrl: profileImageUrl ?? '',
      });

      // 유저 컨텍스트도 같이 업데이트 (프론트 화면에서 바로 반영되게)
      setUser({
        id: String(res?.userId ?? ''),
        nickname: v,
        profileImage: profileImageUrl ?? '',
        triedCount: 0,
        bio: bio ?? '아직 자기소개가 없어요😊',
      });

      navigate('/main', { replace: true });
    } catch (e) {
      alert('프로필 저장 실패했어. 잠깐 뒤에 다시 해줘');
    } finally {
      setSaving(false);
    }
  };

  // step 초기화(뒤로왔다 다시 들어오면 상태 꼬이는거 방지)
  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  return (
    <div className="auth-page">
      <div className="auth-modal">
        <button type="button" className="auth-close" onClick={handleClose} aria-label="닫기">
          ✕
        </button>

        {/* 0) 전체동의 */}
        {step === 0 && (
          <div className="auth-step">
            <h1 className="auth-title">약관 동의</h1>

            <div className="agree-box">
              <label className="agree-row">
                <input type="checkbox" checked={agreeAll} onChange={handleAgreeAllChange} />
                <span className="agree-text strong">전체 동의하기</span>
              </label>

              <div className="agree-divider" />

              <label className="agree-row">
                <input type="checkbox" checked={agreeRequired} onChange={handleAgreeRequiredChange} />
                <span className="agree-text">
                  (필수) 서비스 이용약관 동의
                </span>
              </label>

              <label className="agree-row">
                <input type="checkbox" checked={agreeRequired} onChange={handleAgreeRequiredChange} />
                <span className="agree-text">
                  (필수) 개인정보 처리방침 동의
                </span>
              </label>

              <label className="agree-row">
                <input type="checkbox" checked={agreeOptional} onChange={handleAgreeOptionalChange} />
                <span className="agree-text">
                  (선택) 마케팅 정보 수신 동의
                </span>
              </label>
            </div>

            <button
              type="button"
              className={`primary-btn ${agreeRequired ? '' : 'disabled'}`}
              onClick={handleAgreeAndContinue}
              disabled={!agreeRequired}
            >
              동의하고 계속하기
            </button>
          </div>
        )}

        {/* 1) 반갑습니다(첫번째 이미지) */}
        {step === 1 && (
          <div className="auth-step auth-step-welcome">
            <h1 className="welcome-title">반갑습니다!</h1>

            <div className="welcome-hero">
              <img src={naengGuIcon} alt="냉구" className="welcome-icon" />
            </div>

            <p className="welcome-sub">저와 함께 냉장고를 구해봐요!</p>

            <button type="button" className="primary-btn" onClick={goProfileSetup}>
              프로필 설정하러 가기
            </button>
          </div>
        )}

        {/* 2) 프로필 설정(두번째 이미지) */}
        {step === 2 && (
          <div className="auth-step auth-step-profile">
            <h1 className="auth-title">프로필 설정</h1>

            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="프로필" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-empty" />
                )}
              </div>
              <button
                type="button"
                className="avatar-edit-btn"
                onClick={() => {
                  const url = prompt('프로필 이미지 URL 넣어줘 (나중에 업로드로 바꾸면 됨)');
                  if (url != null) setProfileImageUrl(url.trim());
                }}
              >
                📷
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">닉네임</label>
              <div className="row">
                <input
                  className="input"
                  value={nickname}
                  onChange={onChangeNickname}
                  placeholder="닉네임"
                  maxLength={20}
                />
                <button
                  type="button"
                  className="sub-btn"
                  onClick={handleCheckDuplicate}
                  disabled={dupLoading}
                >
                  {dupLoading ? '확인중' : '중복 확인'}
                </button>
              </div>
              <p className={`help ${dupChecked ? (dupOk ? 'ok' : 'bad') : ''}`}>
                {dupChecked ? dupMsg : '닉네임은 영문, 숫자, _, . 만 사용 가능해'}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">자기소개</label>
              <textarea
                className="textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label className="form-label">사용자 아이디</label>
              <input className="input disabled" value="" placeholder="@ 사용자 아이디" disabled />
            </div>

            <button
              type="button"
              className={`primary-btn ${saving ? 'disabled' : ''}`}
              onClick={handleSubmitProfile}
              disabled={saving}
            >
              {saving ? '저장중...' : '냉장고 구하러가기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
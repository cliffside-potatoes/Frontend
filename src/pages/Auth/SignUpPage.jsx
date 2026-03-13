import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import naengGuIcon from '../../assets/image/naeng-gu.png';
import './SignUpPage.css';
import { createOrUpdateProfile } from '../../api/profileApi';
import { requestProfilePresignedUrl } from '../../api/presignedApi';
import { uploadFileToS3 } from '../../api/uploadToS3';
import { useUser } from '../../context/UserContext';
import { useMyPosts } from '../../context/MyPostsContext';
import { toImageUrl } from '../../utils/imageUrl';

const DEFAULT_BIO = '아직 자기소개가 없어요😊';

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useUser();
  const { setPosts } = useMyPosts();

  const isNewInfoMode = location.pathname === '/new-info';
  const isEditMode = location.pathname === '/profile/edit';

  const initialStep = useMemo(() => {
    if (isEditMode) return 2;
    if (isNewInfoMode) return 1;
    if (typeof location.state?.step === 'number') return location.state.step;
    return 1;
  }, [isEditMode, isNewInfoMode, location.state]);

  const [step, setStep] = useState(initialStep);

  const [nickname, setNickname] = useState(isEditMode ? user?.nickname ?? '' : '');
  const [bio, setBio] = useState(isEditMode ? user?.bio ?? DEFAULT_BIO : DEFAULT_BIO);
  const [userEmail, setUserEmail] = useState(user?.email ?? '');

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(
    user?.profileImage ? toImageUrl(user.profileImage) : ''
  );

  const [nicknameError, setNicknameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [bioTouched, setBioTouched] = useState(isEditMode && Boolean(user?.bio));

  const fileInputRef = useRef(null);

  /*
  닉네임 중복확인 API 생기면 다시 살릴 상태들

  const [dupLoading, setDupLoading] = useState(false);
  const [dupChecked, setDupChecked] = useState(false);
  const [dupOk, setDupOk] = useState(false);
  const [dupMsg, setDupMsg] = useState('');
  */

  const handleClose = () => navigate(-1);

  const goProfileSetup = () => setStep(2);

  const validateNickname = (value) => {
    const re = /^[a-zA-Z0-9_.]{1,20}$/;
    return re.test(value);
  };

  const onChangeNickname = (e) => {
    const v = e.target.value;
    setNickname(v);

    /*
    닉네임 중복확인 API 생기면 다시 살릴 부분

    setDupChecked(false);
    setDupOk(false);
    setDupMsg('');
    */

    if (!v.trim()) {
      setNicknameError('닉네임을 입력해줘');
      return;
    }

    if (!validateNickname(v.trim())) {
      setNicknameError('닉네임은 영문, 숫자, 밑줄(_), 마침표(.)만 사용할 수 있어');
      return;
    }

    setNicknameError('');
  };

  /*
  닉네임 중복확인 API 생기면 다시 살릴 함수

  const handleCheckDuplicate = async () => {
    const v = nickname.trim();

    if (!v) {
      setNicknameError('닉네임을 입력해줘');
      setDupChecked(true);
      setDupOk(false);
      setDupMsg('닉네임을 먼저 입력해줘');
      return;
    }

    if (!validateNickname(v)) {
      setNicknameError('닉네임은 영문, 숫자, 밑줄(_), 마침표(.)만 사용할 수 있어');
      setDupChecked(true);
      setDupOk(false);
      setDupMsg('닉네임 형식을 다시 확인해줘');
      return;
    }

    setNicknameError('');
    setDupLoading(true);
    setDupChecked(false);
    setDupOk(false);
    setDupMsg('');

    try {
      const ok = await checkNicknameDuplicate(v);
      setDupChecked(true);
      setDupOk(ok);
      setDupMsg(ok ? '사용 가능한 닉네임이야' : '이미 사용 중인 닉네임이야');
    } catch (e) {
      setDupChecked(true);
      setDupOk(false);
      setDupMsg('중복 확인 실패');
    } finally {
      setDupLoading(false);
    }
  };
  */

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImageFile(file);

    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);
  };

  const handleBioFocus = () => {
    if (!bioTouched && bio === DEFAULT_BIO) {
      setBio('');
    }
    setBioTouched(true);
  };

  const handleBioChange = (e) => {
    setBioTouched(true);
    setBio(e.target.value);
  };

  const uploadProfileImageIfNeeded = async () => {
    // ✅ 새 이미지 선택 안 했으면 필드 자체를 안 보냄
    if (!profileImageFile) {
      return null;
    }

    const { presignedUrl, s3Key } = await requestProfilePresignedUrl(profileImageFile);

    await uploadFileToS3(presignedUrl, profileImageFile);

    return {
      s3Key,
      contentType: profileImageFile.type || 'application/octet-stream',
      size: profileImageFile.size || 0,
      accessType: 'public',
    };
  };

  const handleSubmitProfile = async () => {
    const v = nickname.trim();
    const finalBio = bio.trim() ? bio.trim() : DEFAULT_BIO;

    if (!v) {
      setNicknameError('닉네임을 입력해줘');
      return;
    }

    if (!validateNickname(v)) {
      setNicknameError('닉네임은 영문, 숫자, 밑줄(_), 마침표(.)만 사용할 수 있어');
      return;
    }

    /*
    닉네임 중복확인 API 생기면 다시 살릴 부분

    if (!dupOk) {
      setDupChecked(true);
      setDupOk(false);
      setDupMsg('닉네임 중복 확인을 먼저 해줘');
      return;
    }
    */

    setSaving(true);
    setNicknameError('');

    try {
      const uploadedProfileImage = await uploadProfileImageIfNeeded();

      await createOrUpdateProfile({
        nickname: v,
        bio: finalBio,
        profileImage: uploadedProfileImage,
      });

      const nextProfileImageKey =
        uploadedProfileImage?.s3Key ?? user?.profileImage ?? '';

      setUser({
        ...(user ?? {}),
        id: String(user?.id ?? ''),
        email: userEmail ?? '',
        nickname: v,
        profileImage: nextProfileImageKey,
        triedCount: user?.triedCount ?? 0,
        bio: finalBio,
      });

      // ✅ 내가 쓴 기존 게시글 author도 새 닉네임으로 동기화
      setPosts((prev) =>
        (prev || []).map((post) => ({
          ...post,
          author: v,
        }))
      );

      navigate(isEditMode ? '/profile' : '/main', { replace: true });
    } catch (e) {
      console.error(e);

      const serverMessage = e?.message ?? '';

      if (e?.status === 400) {
        setNicknameError(serverMessage || '닉네임 형식이 올바르지 않거나 이미 사용 중이야');
        return;
      }

      if (e?.status === 401) {
        alert('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
        navigate('/signin', { replace: true });
        return;
      }

      alert('프로필 저장 실패했어. 잠깐 뒤에 다시 해줘');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setStep(initialStep);

    if (isEditMode) {
      setNickname(user?.nickname ?? '');
      setBio(user?.bio ?? DEFAULT_BIO);
      setUserEmail(user?.email ?? '');
      setProfileImagePreview(user?.profileImage ? toImageUrl(user.profileImage) : '');
      setProfileImageFile(null);
      setBioTouched(Boolean(user?.bio));
      setNicknameError('');

      /*
      닉네임 중복확인 API 생기면 다시 살릴 부분

      setDupChecked(true);
      setDupOk(true);
      setDupMsg('');
      */
    } else {
      setNickname('');
      setBio(DEFAULT_BIO);
      setUserEmail(user?.email ?? '');
      setProfileImagePreview(user?.profileImage ? toImageUrl(user.profileImage) : '');
      setProfileImageFile(null);
      setBioTouched(false);
      setNicknameError('');

      /*
      닉네임 중복확인 API 생기면 다시 살릴 부분

      setDupChecked(false);
      setDupOk(false);
      setDupMsg('');
      */
    }
  }, [initialStep, isEditMode, user]);

  useEffect(() => {
    return () => {
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  return (
    <div className="auth-page">
      <div className="auth-modal">
        <button type="button" className="auth-close" onClick={handleClose} aria-label="닫기">
          ✕
        </button>

        {step === 1 && !isEditMode && (
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

        {step === 2 && (
          <div className="auth-step auth-step-profile">
            <h1 className="auth-title">프로필 설정</h1>

            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="프로필" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-empty" />
                )}
              </div>

              <button
                type="button"
                className="avatar-edit-btn"
                onClick={handlePickImage}
                aria-label="프로필 사진 선택"
              >
                📷
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
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

                {/*
                닉네임 중복확인 API 생기면 다시 살릴 버튼

                <button
                  type="button"
                  className="sub-btn"
                  onClick={handleCheckDuplicate}
                  disabled={dupLoading || saving}
                >
                  {dupLoading ? '확인중' : '중복 확인'}
                </button>
                */}
              </div>

              {nicknameError ? (
                <p className="help bad">{nicknameError}</p>
              ) : (
                <p className="help">
                  닉네임에는 영문, 숫자, 밑줄, 마침표만 사용할 수 있습니다.
                </p>
              )}

              {/*
              닉네임 중복확인 API 생기면 다시 살릴 안내문

              {!nicknameError && (
                <p className={`help ${dupChecked ? (dupOk ? 'ok' : 'bad') : ''}`}>
                  {dupChecked
                    ? dupMsg
                    : '닉네임에는 영문, 숫자, 밑줄, 마침표만 사용할 수 있습니다.'}
                </p>
              )}
              */}
            </div>

            <div className="form-group">
              <label className="form-label">자기소개</label>
              <textarea
                className="textarea"
                value={bio}
                onFocus={handleBioFocus}
                onChange={handleBioChange}
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label className="form-label">사용자 아이디</label>
              <input
                className="input disabled"
                value={userEmail}
                placeholder="@ 카카오 계정 이메일"
                disabled
                readOnly
              />
              <p className="help">
                본인만 볼 수 있고 수정할 수 없는 카카오 계정 정보야.
              </p>
            </div>

            <button
              type="button"
              className={`primary-btn ${saving ? 'disabled' : ''}`}
              onClick={handleSubmitProfile}
              disabled={saving}
            >
              {saving ? '저장중...' : '저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
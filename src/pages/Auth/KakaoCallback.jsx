import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../../api/tokenApi';
import { getMyProfile } from '../../api/profileApi';
import { useUser } from '../../context/UserContext';
import { consumePostLoginRedirect } from '../../utils/authStorage';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const loginProcess = async () => {
      console.log('[KakaoCallback] 시작');

      const payload = await refreshAccessToken();
      console.log('[KakaoCallback] refreshAccessToken 결과:', payload);

      if (!payload?.accessToken) {
        console.log('[KakaoCallback] accessToken 없음 -> /signin');
        navigate('/signin', { replace: true });
        return;
      }

      const baseUser = {
        id: String(payload?.id ?? ''),
        email: payload?.email ?? '',
        nickname: payload?.nickname ?? '사용자',
        profileImage: '',
        triedCount: 0,
        bio: '아직 자기소개가 없어요😊',
      };

      if (payload?.newMember) {
        console.log('[KakaoCallback] 신규 회원 -> /new-info');
        setUser({
          ...baseUser,
          nickname: '',
          profileImage: '',
        });
        navigate('/new-info', { replace: true });
        return;
      }

      const profile = await getMyProfile();
      console.log('[KakaoCallback] getMyProfile 결과:', profile);

      if (!profile) {
        console.log('[KakaoCallback] profile 없음 -> /new-info');
        setUser({
          ...baseUser,
          nickname: '',
          profileImage: '',
        });
        navigate('/new-info', { replace: true });
        return;
      }

      const redirectPath = consumePostLoginRedirect() ?? '/main';
      const nextUser = {
        ...baseUser,
        email: profile?.email ?? baseUser.email,
        nickname: profile?.nickname ?? baseUser.nickname,
        bio: profile?.bio ?? baseUser.bio,
        profileImage:
          profile?.profileImage?.s3Key ??
          profile?.profileImageUrl ??
          '',
      };
      console.log('[KakaoCallback] nextUser:', nextUser);
      console.log('[KakaoCallback] redirectPath:', redirectPath);

      setUser(nextUser);
      navigate(redirectPath, { replace: true });
    };

    loginProcess();
  }, [navigate, setUser]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>로그인 처리 중...</h2>
    </div>
  );
};

export default KakaoCallback;

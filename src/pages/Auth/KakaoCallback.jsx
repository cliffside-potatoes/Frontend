import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../../api/tokenApi';
import { getMyProfile } from '../../api/profileApi';
import { useUser } from '../../context/UserContext';
import { consumePostLoginRedirect } from '../../utils/authStorage';

const DEFAULT_BIO = '아직 자기소개가 없어요.';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const loginProcess = async () => {
      console.log('[KakaoCallback] start');

      const payload = await refreshAccessToken();
      console.log('[KakaoCallback] refreshAccessToken result:', payload);

      if (!payload?.accessToken) {
        console.log('[KakaoCallback] no accessToken -> /signin');
        navigate('/signin', { replace: true });
        return;
      }

      const baseUser = {
        id: String(payload?.id ?? ''),
        email: payload?.email ?? '',
        nickname: payload?.nickname ?? '사용자',
        profileImage: '',
        triedCount: 0,
        bio: DEFAULT_BIO,
      };

      if (payload?.newMember) {
        console.log('[KakaoCallback] new member -> /new-info');
        setUser({
          ...baseUser,
          nickname: '',
          profileImage: '',
        });
        navigate('/new-info', { replace: true });
        return;
      }

      let profile = null;

      try {
        profile = await getMyProfile({ suppressErrors: false });
        console.log('[KakaoCallback] getMyProfile result:', profile);
      } catch (error) {
        console.error('[KakaoCallback] getMyProfile failed:', error);
        alert('프로필 정보를 불러오지 못했어. 다시 로그인해줘.');
        navigate('/signin', { replace: true });
        return;
      }

      if (!profile) {
        console.log('[KakaoCallback] profile missing -> /new-info');
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

    void loginProcess();
  }, [navigate, setUser]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>로그인 처리 중...</h2>
    </div>
  );
};

export default KakaoCallback;

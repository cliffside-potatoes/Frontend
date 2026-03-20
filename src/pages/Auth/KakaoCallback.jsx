import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../../api/tokenApi';
import { getMyProfile } from '../../api/profileApi';
import { useUser } from '../../context/UserContext';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const loginProcess = async () => {
      const payload = await refreshAccessToken();

      if (!payload?.accessToken) {
        navigate('/signin', { replace: true });
        return;
      }

      const baseUser = {
        id: String(payload?.id ?? ''),
        nickname: payload?.nickname ?? '사용자',
        profileImage: '',
        triedCount: 0,
        bio: '아직 자기소개가 없어요😊',
      };

      // 신규 회원이면 바로 프로필 설정 플로우로
      if (payload?.newMember) {
        setUser(baseUser);
        navigate('/new-info', { replace: true });
        return;
      }

      const profile = await getMyProfile();

      // 기존 회원인데 프로필이 없으면 예외적으로 신규 플로우로
      if (!profile) {
        setUser(baseUser);
        navigate('/new-info', { replace: true });
        return;
      }

      const nextUser = {
        ...baseUser,
        nickname: profile?.nickname ?? baseUser.nickname,
        bio: profile?.bio ?? baseUser.bio,
        profileImage: profile?.profileImageUrl ?? '',
      };

      setUser(nextUser);
      navigate('/main', { replace: true });
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
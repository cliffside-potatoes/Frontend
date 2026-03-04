import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { refreshAccessToken } from '../../api/tokenApi';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const url = new URL(window.location.href);

    const accessToken = url.searchParams.get('accessToken');
    const nickname = url.searchParams.get('nickname');
    const id = url.searchParams.get('id');
    const newMemberRaw = url.searchParams.get('newMember');

    const isNewMember =
      newMemberRaw === 'true' || newMemberRaw === 'TRUE' || newMemberRaw === '1';

    /**
     * 1) accessToken이 URL에 있는 경우 (백엔드 302 redirect)
     */
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);

      setUser({
        id: String(id ?? ''),
        nickname: nickname ?? '사용자',
        profileImage: '',
        triedCount: 0,
        bio: '아직 자기소개가 없어요😊',
      });

      // ✅ 신규회원은 /new-info로
      navigate(isNewMember ? '/new-info' : '/main', { replace: true });
      return;
    }

    /**
     * 2) accessToken 없고 refreshToken cookie만 있는 경우 -> /oauth/token으로 재발급
     */
    const getToken = async () => {
      const payload = await refreshAccessToken();

      if (!payload?.accessToken) {
        navigate('/signin', { replace: true });
        return;
      }

      localStorage.setItem('accessToken', payload.accessToken);

      setUser({
        id: String(payload?.id ?? ''),
        nickname: payload?.nickname ?? '사용자',
        profileImage: '',
        triedCount: 0,
        bio: '아직 자기소개가 없어요😊',
      });

      const newMember2 =
        payload?.newMember === true ||
        payload?.NewMember === true ||
        payload?.newMember === 'true' ||
        payload?.NewMember === 'true';

      navigate(newMember2 ? '/new-info' : '/main', { replace: true });
    };

    getToken();
  }, [navigate, setUser]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>로그인 처리 중...</h2>
    </div>
  );
};

export default KakaoCallback;
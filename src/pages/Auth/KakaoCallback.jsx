import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const REST_API_KEY = "fb385c5f153fb98a5cd07c284b1291ce";
const REDIRECT_URI = "http://localhost:5173/oauth/callback/kakao";

const mapKakaoToUser = (kakaoData) => {
  const nickname = kakaoData?.properties?.nickname
    ?? kakaoData?.kakao_account?.profile?.nickname
    ?? '사용자';
  const profileImage = kakaoData?.properties?.profile_image
    ?? kakaoData?.kakao_account?.profile?.profile_image_url
    ?? '';
  return {
    id: String(kakaoData?.id ?? ''),
    nickname,
    profileImage,
    triedCount: 0,
    bio: '아직 자기소개가 없어요😊',
  };
};

const KakaoCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const isRequested = useRef(false);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code && !isRequested.current) {
      isRequested.current = true;

      const getToken = async () => {
        try {
          const params = new URLSearchParams();
          params.append('grant_type', 'authorization_code');
          params.append('client_id', REST_API_KEY);
          params.append('redirect_uri', REDIRECT_URI);
          params.append('code', code);

          const response = await axios.post(
            "https://kauth.kakao.com/oauth/token",
            params,
            {
              headers: {
                "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
              },
            }
          );

          const accessToken = response.data.access_token;
          localStorage.setItem('accessToken', accessToken);

          const res = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const userObj = mapKakaoToUser(res.data);
          setUser(userObj);

          navigate('/main', { replace: true });
        } catch (error) {
          console.error("에러 상세:", error.response?.data || error.message);
          navigate('/signin');
        }
      };

      getToken();
    }
  }, [navigate, setUser]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>로그인 처리 중...</h2>
    </div>
  );
};

export default KakaoCallback;
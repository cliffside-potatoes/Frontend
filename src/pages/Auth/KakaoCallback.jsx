import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const isRequested = useRef(false);

  // 반드시 따옴표로 감싸져 있어야 합니다.
  const REST_API_KEY = "fb385c5f153fb98a5cd07c284b1291ce";
  const REDIRECT_URI = "http://localhost:5173/oauth/callback/kakao";

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
          
          // 사용자 정보 가져오기
          const res = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          console.log("로그인 성공! 유저 정보:", res.data);
          
          // 성공하면 회원가입 페이지로 이동
          navigate('/signup', { state: { kakaoUser: res.data } });

        } catch (error) {
          console.error("에러 상세:", error.response?.data || error.message);
          navigate('/signin');
        }
      };

      getToken();
    }
  }, [navigate]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>로그인 처리 중...</h2>
    </div>
  );
};

export default KakaoCallback;
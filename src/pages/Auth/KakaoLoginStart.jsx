import { useEffect, useRef } from 'react';

const KakaoLoginStart = () => {
 const isRequested = useRef(false);

 const API_BASE_URL = import.meta.env.VITE_API_URL || '';
 const LOGIN_PATH = import.meta.env.VITE_KAKAO_LOGIN_START_PATH || '/login';

 useEffect(() => {
  if (isRequested.current) return;
  isRequested.current = true;

  const base = API_BASE_URL.replace(/\/$/, '');
  window.location.replace(`${base}${LOGIN_PATH}`);
 }, [API_BASE_URL, LOGIN_PATH]);

 return (
  <div style={{ padding: '20px', textAlign: 'center' }}>
   <h2>카카오 로그인으로 이동 중...</h2>
  </div>
 );
};

export default KakaoLoginStart;

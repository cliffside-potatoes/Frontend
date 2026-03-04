const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_PATH = import.meta.env.VITE_KAKAO_EXCHANGE_PATH || '/oauth/token';

export const refreshAccessToken = async () => {
  try {
    const base = API_BASE_URL.replace(/\/$/, '');
    const path = TOKEN_PATH.startsWith('/') ? TOKEN_PATH : `/${TOKEN_PATH}`;
    const url = `${base}${path}`;

    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return null;
    }

    const result = await res.json();
    const payload = result?.data;

    if (!payload?.accessToken) {
      return null;
    }

    // accessToken 저장
    localStorage.setItem('accessToken', payload.accessToken);

    return payload;
  } catch (error) {
    console.error('refreshAccessToken error:', error);
    return null;
  }
};
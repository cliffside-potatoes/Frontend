const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const LOGOUT_PATH = import.meta.env.VITE_LOGOUT_PATH || '/logout';

export const refreshAccessToken = async () => {
  try {
    const base = API_BASE_URL.replace(/\/$/, '');

    const res = await fetch(`${base}/oauth/token`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`토큰 재발급 실패 (${res.status})`);
    }

    const data = await res.json();
    const payload = data?.data ?? data;

    if (payload?.accessToken) {
      localStorage.setItem('accessToken', payload.accessToken);
    }

    return payload ?? null;
  } catch (error) {
    console.error('refreshAccessToken 실패:', error);
    return null;
  }
};

export const logoutFromServer = async (options = {}) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = LOGOUT_PATH.startsWith('/') ? LOGOUT_PATH : `/${LOGOUT_PATH}`;

  try {
    await fetch(`${base}${path}`, {
      method: 'POST',
      credentials: 'include',
      keepalive: Boolean(options.keepalive),
    });
  } catch (error) {
    console.error('logoutFromServer 실패:', error);
  }
};

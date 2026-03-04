const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const refreshAccessToken = async () => {
 try {

  const res = await fetch(`${API_BASE_URL}/oauth/token`, {
   method: 'POST',
   credentials: 'include',
   headers: {
    'Content-Type': 'application/json',
   },
  });

  if (!res.ok) {
   throw new Error('토큰 재발급 실패');
  }

  const data = await res.json();

  const payload = data?.data;

  if (payload?.accessToken) {
   localStorage.setItem('accessToken', payload.accessToken);
  }

  return payload;

 } catch (error) {
  console.error('refreshAccessToken 실패:', error);
  return null;
 }
};
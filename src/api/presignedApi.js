const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAccessToken = () => {
  return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
};

const getAuthHeader = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Presigned URL 발급
 * POST /presigned/{type}
 *
 * type: post | profile | recipe
 * body: { imageName }
 */
export const issuePresignedUrl = async ({ type, imageName }) => {
  try {
    const base = API_BASE_URL.replace(/\/$/, '');

    const res = await fetch(`${base}/presigned/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        imageName,
      }),
    });

    if (!res.ok) {
      throw new Error(`Presigned URL 발급 실패 (${res.status})`);
    }

    const data = await res.json();
    return data?.data ?? null;
  } catch (error) {
    console.error('issuePresignedUrl 실패:', error);
    throw error;
  }
};

export default {
  issuePresignedUrl,
};
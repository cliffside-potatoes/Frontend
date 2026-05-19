const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAccessToken = () => {
  return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
};

const getAuthHeader = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const requestPresignedUrl = async (file, path) => {
  const base = API_BASE_URL.replace(/\/$/, '');

  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      imageName: file.name,
    }),
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    data = await res.json();
  }

  if (!res.ok) {
    const message =
      data?.resultMessage ||
      data?.message ||
      `Presigned URL 발급 실패 (${res.status})`;

    const error = new Error(message);
    error.status = res.status;
    error.responseData = data;
    throw error;
  }

  const presignedUrl = data?.data?.presignedUrl ?? data?.presignedUrl;
  const s3Key = data?.data?.s3Key ?? data?.s3Key;

  if (!presignedUrl || !s3Key) {
    console.error('Presigned 응답 원본:', data);
    throw new Error('Presigned URL 응답 형식이 올바르지 않아');
  }

  return {
    presignedUrl,
    s3Key,
  };
};

export const requestProfilePresignedUrl = async (file) =>
  requestPresignedUrl(file, '/presigned/profile');

export const requestReviewPresignedUrl = async (file) => {
  try {
    return await requestPresignedUrl(file, '/presigned/review');
  } catch (error) {
    if (error?.status !== 404) throw error;
    return requestPresignedUrl(file, '/presigned/profile');
  }
};

export default {
  requestProfilePresignedUrl,
  requestReviewPresignedUrl,
};

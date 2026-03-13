const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAccessToken = () => {
  return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
};

const getAuthHeader = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMyProfile = async () => {
  try {
    const base = API_BASE_URL.replace(/\/$/, '');

    const res = await fetch(`${base}/profiles`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`프로필 조회 실패 (${res.status})`);
    }

    const data = await res.json();
    return data?.data ?? null;
  } catch (error) {
    console.error('getMyProfile 실패:', error);
    return null;
  }
};

export const createOrUpdateProfile = async ({ nickname, bio, profileImage = null }) => {
  const base = API_BASE_URL.replace(/\/$/, '');

  const res = await fetch(`${base}/profiles`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      nickname,
      bio,
      profileImage,
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
      `프로필 저장 실패 (${res.status})`;

    const error = new Error(message);
    error.status = res.status;
    error.responseData = data;
    throw error;
  }

  return data?.data ?? null;
};

/*
닉네임 중복확인 API 생기면 다시 살릴 부분

export const checkNicknameDuplicate = async (nickname) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const res = await fetch(`${base}/profiles/check-nickname?nickname=${encodeURIComponent(nickname)}`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`닉네임 중복 확인 실패 (${res.status})`);
  }

  const data = await res.json();
  return data?.data?.available ?? data?.available ?? false;
};
*/

export default {
  getMyProfile,
  createOrUpdateProfile,
};
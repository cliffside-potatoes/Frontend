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
  try {
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

    if (!res.ok) {
      throw new Error(`프로필 저장 실패 (${res.status})`);
    }

    const data = await res.json();
    return data?.data ?? null;
  } catch (error) {
    console.error('createOrUpdateProfile 실패:', error);
    throw error;
  }
};

export const checkNicknameDuplicate = async () => {
  try {
    return true;
  } catch (error) {
    console.error('checkNicknameDuplicate 실패:', error);
    return false;
  }
};

export default {
  getMyProfile,
  createOrUpdateProfile,
  checkNicknameDuplicate,
};
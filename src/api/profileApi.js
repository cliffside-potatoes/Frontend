const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAccessToken = () => {
  return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
};

const getAuthHeader = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * 내 프로필 조회
 * GET /profiles
 */
export const getMyProfile = async () => {
  try {
    const base = API_BASE_URL.replace(/\/$/, '');

    const res = await fetch(`${base}/profiles`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });

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

/**
 * 프로필 생성/수정
 * PUT /profiles
 */
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

/**
 * 현재 Swagger에 닉네임 중복확인 API 없음
 */
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
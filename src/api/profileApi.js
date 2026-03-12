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

/**
 * 닉네임 중복 확인
 * 현재 Swagger에 명시된 API가 없어서 우선 아래 엔드포인트를 가정해서 연결.
 * 백엔드 실제 엔드포인트가 다르면 url 한 줄만 수정하면 됨.
 *
 * 가정:
 * GET /profiles/check-nickname?nickname=xxx
 * 응답 예시:
 * { data: { available: true } }
 * 또는
 * { available: true }
 */
export const checkNicknameDuplicate = async (nickname) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = `${base}/profiles/check-nickname?nickname=${encodeURIComponent(nickname)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`닉네임 중복 확인 실패 (${res.status})`);
  }

  const data = await res.json();
  const available = data?.data?.available ?? data?.available;

  if (typeof available !== 'boolean') {
    throw new Error('닉네임 중복 확인 응답 형식이 올바르지 않음');
  }

  return available;
};

export default {
  getMyProfile,
  createOrUpdateProfile,
  checkNicknameDuplicate,
};
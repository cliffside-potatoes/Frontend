import { refreshAccessToken } from './tokenApi';
import { getStoredAccessToken, invalidateAuthSession } from '../utils/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAccessToken = () => {
  return getStoredAccessToken();
};

const getAuthHeader = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handle401 = () => {
  invalidateAuthSession();
};

const requestGetMyProfile = async () => {
  const base = API_BASE_URL.replace(/\/$/, '');

  const res = await fetch(`${base}/profiles`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
    },
  });
  console.log('[profileApi] /profiles status:', res.status);

  if (res.status === 404) {
    return { res, data: null };
  }

  const contentType = res.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
      console.log('[profileApi] /profiles data:', data);

    } catch {
      data = null;
    }
  }

  return { res, data };
};

export const getMyProfile = async () => {
  try {
    let { res, data } = await requestGetMyProfile();

    if (res.status === 401) {
      try {
        const refreshPayload = await refreshAccessToken();

        if (refreshPayload?.accessToken) {
          const retryResult = await requestGetMyProfile();
          res = retryResult.res;
          data = retryResult.data;
        } else {
          handle401();
          return null;
        }
      } catch (error) {
        console.error('getMyProfile 토큰 재발급 실패:', error);
        handle401();
        return null;
      }
    }

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`프로필 조회 실패 (${res.status})`);
    }

    return data?.data ?? data ?? null;
  } catch (error) {
    console.error('getMyProfile 실패:', error);
    return null;
  }
};

const requestCreateOrUpdateProfile = async ({ nickname, bio, profileImage }) => {
  const base = API_BASE_URL.replace(/\/$/, '');

  const body = {
    nickname,
    bio,
  };

  if (profileImage) {
    body.profileImage = profileImage;
  }

  const res = await fetch(`${base}/profiles`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    data = await res.json();
  }

  return { res, data };
};

export const createOrUpdateProfile = async ({ nickname, bio, profileImage }) => {
  let { res, data } = await requestCreateOrUpdateProfile({
    nickname,
    bio,
    profileImage,
  });

  if (res.status === 401) {
    try {
      const refreshPayload = await refreshAccessToken();

      if (refreshPayload?.accessToken) {
        const retryResult = await requestCreateOrUpdateProfile({
          nickname,
          bio,
          profileImage,
        });

        res = retryResult.res;
        data = retryResult.data;
      } else {
        handle401();
        return;
      }
    } catch (e) {
      handle401();
      return;
    }
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

export default {
  getMyProfile,
  createOrUpdateProfile,
};

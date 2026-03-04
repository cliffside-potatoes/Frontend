const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * 닉네임 중복 확인
 * - 백엔드에 엔드포인트 없으면, 일단 항상 true로 통과(개발용)
 * - 나중에 백엔드가 /profiles/nickname/exists?nickname=... 같은거 주면 여기만 바꾸면 됨
 */
export const checkNicknameDuplicate = async (nickname) => {
  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    if (!base) return true;

    // ✅ 임시: 백엔드 엔드포인트 확정되면 교체
    // const url = `${base}/profiles/nickname/exists?nickname=${encodeURIComponent(nickname)}`;
    // const res = await fetch(url, { method: 'GET', headers: { ...getAuthHeader() } });
    // const data = await res.json();
    // return !data.exists;

    return true;
  } catch {
    return true;
  }
};

/**
 * 프로필 생성 + 수정
 * - 명세: "프로필이 없으면 생성(201), 있으면 수정(200)"
 * - 엔드포인트가 확정되면 url만 교체하면 됨
 */
export const createOrUpdateProfile = async ({ nickname, bio, profileImageUrl }) => {
  const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
  if (!base) {
    return { profileId: 1, userId: '', nickname };
  }

  const url = `${base.replace(/\/$/, '')}/profiles`; // ✅ 임시 가정
  const res = await fetch(url, {
    method: 'POST', // ✅ 백엔드가 PUT/PATCH로 주면 변경
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      nickname,
      bio,
      profileImageUrl,
    }),
  });

  // 실패하면 mock처럼 처리(개발 막히지 않게)
  if (!res.ok) {
    return { profileId: 1, userId: '', nickname };
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return { profileId: 1, userId: '', nickname };
  }

  const data = await res.json();
  // 백엔드 응답이 { profileId, status } 형태라고 했으니까 맞춰줌
  return {
    profileId: data?.profileId ?? data?.data?.profileId ?? 1,
    userId: data?.data?.id ?? '',
    nickname,
  };
};

export default {
  checkNicknameDuplicate,
  createOrUpdateProfile,
};
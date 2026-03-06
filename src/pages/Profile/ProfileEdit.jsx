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
 *
 * Swagger request body:
 * {
 *   nickname: string,
 *   bio: string,
 *   profileImage: {
 *     s3Key: string,
 *     contentType: string,
 *     size: number,
 *     accessType: string
 *   }
 * }
 */
export const createOrUpdateProfile = async ({ nickname, bio, profileImage }) => {
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
 *
 * 현재 Swagger에는 닉네임 중복 확인 API 없음.
 * 그래서 일단 프론트 임시 처리로 true 반환.
 * 백엔드가 API 주면 여기만 교체하면 됨.
 */
export const checkNicknameDuplicate = async (nickname) => {
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
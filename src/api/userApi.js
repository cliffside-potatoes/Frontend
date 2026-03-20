import { refreshAccessToken } from './tokenApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAccessToken = () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
};

const getAuthHeader = () => {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handle401 = () => {
    alert('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');

    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('myPosts');

    window.location.href = '/signin';
};

const requestWithdrawMe = async () => {
    const base = API_BASE_URL.replace(/\/$/, '');

    const res = await fetch(`${base}/users/me`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeader(),
        },
    });

    return res;
};

export const withdrawMe = async () => {
    let res = await requestWithdrawMe();

    if (res.status === 401) {
        try {
            const refreshPayload = await refreshAccessToken();

            if (refreshPayload?.accessToken) {
                res = await requestWithdrawMe();
            } else {
                handle401();
                return;
            }
        } catch (error) {
            console.error('회원탈퇴 토큰 재발급 실패:', error);
            handle401();
            return;
        }
    }

    if (!res.ok) {
        const error = new Error(`회원탈퇴 실패 (${res.status})`);
        error.status = res.status;
        throw error;
    }

    return true;
};

export default {
    withdrawMe,
};
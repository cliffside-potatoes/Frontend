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

const requestWithdrawMe = async () => {
    const base = API_BASE_URL.replace(/\/$/, '');

    return fetch(`${base}/users/me`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeader(),
        },
    });
};

const requestWithdrawMePermanent = async () => {
    const base = API_BASE_URL.replace(/\/$/, '');

    return fetch(`${base}/users/me/permanent`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeader(),
        },
    });
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

export const withdrawMePermanent = async () => {
    let res = await requestWithdrawMePermanent();

    if (res.status === 401) {
        try {
            const refreshPayload = await refreshAccessToken();

            if (refreshPayload?.accessToken) {
                res = await requestWithdrawMePermanent();
            } else {
                handle401();
                return;
            }
        } catch (error) {
            console.error('회원 완전탈퇴 토큰 재발급 실패:', error);
            handle401();
            return;
        }
    }

    if (!res.ok) {
        const error = new Error(`회원 완전탈퇴 실패 (${res.status})`);
        error.status = res.status;
        throw error;
    }

    return true;
};

export default {
    withdrawMe,
    withdrawMePermanent,
};

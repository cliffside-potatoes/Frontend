import { refreshAccessToken } from './tokenApi';
import {
    clearStoredAuth,
    getCurrentPath,
    getStoredAccessToken,
    savePostLoginRedirect,
} from '../utils/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAccessToken = () => {
    return getStoredAccessToken();
};

const getAuthHeader = () => {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handle401 = () => {
    alert('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
    savePostLoginRedirect(getCurrentPath());
    clearStoredAuth();
    window.location.href = '/signin';
};

const requestWithdrawMePermanent = async () => {
    const base = API_BASE_URL.replace(/\/$/, '');

    return fetch(`${base}/users/me/permanent`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            ...getAuthHeader(),
        },
        credentials: 'include',
    });
};

/** DELETE /users/me/permanent — 계정·연관 데이터 삭제 */
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
            console.error('회원탈퇴 토큰 재발급 실패:', error);
            handle401();
            return;
        }
    }

    if (!res.ok) {
        let serverMessage = '';
        try {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await res.json();
                serverMessage = data?.resultMessage || data?.message || '';
            }
        } catch {
            serverMessage = '';
        }

        const message = serverMessage || `회원탈퇴 실패 (${res.status})`;
        const error = new Error(message);
        error.status = res.status;
        error.serverMessage = serverMessage;
        throw error;
    }

    return true;
};

export default {
    withdrawMePermanent,
};

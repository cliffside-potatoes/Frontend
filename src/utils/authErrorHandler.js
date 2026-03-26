import {
  clearStoredAuth,
  getCurrentPath,
  savePostLoginRedirect,
} from './authStorage';

export const handleAuthError = (error) => {
  if (error?.status === 401) {
    alert('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
    savePostLoginRedirect(getCurrentPath());
    clearStoredAuth();
    window.location.href = '/signin';
    return true;
  }

  return false;
};

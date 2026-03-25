const POST_LOGIN_REDIRECT_KEY = 'postLoginRedirect';
const LOGOUT_MARKER_KEY = 'explicitLogout';

export const getStoredAccessToken = () => {
  if (typeof window === 'undefined') return '';

  return (
    window.localStorage.getItem('accessToken') ||
    window.localStorage.getItem('token') ||
    ''
  );
};

const normalizeRedirectPath = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('//')) return null;
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  if (typeof value === 'object') {
    const pathname =
      typeof value.pathname === 'string' ? value.pathname : '';
    const search = typeof value.search === 'string' ? value.search : '';
    const hash = typeof value.hash === 'string' ? value.hash : '';

    if (!pathname) return null;
    return `${pathname}${search}${hash}`;
  }

  return null;
};

const isAllowedRedirectPath = (path) => {
  if (!path || !path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (path.startsWith('/signin')) return false;
  if (path.startsWith('/oauth/callback')) return false;
  return true;
};

export const toRedirectPath = (value) => {
  const path = normalizeRedirectPath(value);
  return isAllowedRedirectPath(path) ? path : null;
};

export const getCurrentPath = () => {
  if (typeof window === 'undefined') return '/main';

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return toRedirectPath(currentPath) ?? '/main';
};

export const buildSignInState = (redirectPath, backgroundPath) => ({
  from: toRedirectPath(redirectPath) ?? '/main',
  backgroundPath: toRedirectPath(backgroundPath) ?? '/main',
});

export const savePostLoginRedirect = (value) => {
  if (typeof window === 'undefined') return null;

  const path = toRedirectPath(value);

  if (!path) {
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    return null;
  }

  window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path);
  return path;
};

export const peekPostLoginRedirect = () => {
  if (typeof window === 'undefined') return null;

  return toRedirectPath(window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY));
};

export const consumePostLoginRedirect = () => {
  if (typeof window === 'undefined') return null;

  const path = peekPostLoginRedirect();
  window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  return path;
};

export const markLoggedOut = () => {
  if (typeof window === 'undefined') return;

  window.sessionStorage.setItem(LOGOUT_MARKER_KEY, '1');
};

export const hasLoggedOutMarker = () => {
  if (typeof window === 'undefined') return false;

  return window.sessionStorage.getItem(LOGOUT_MARKER_KEY) === '1';
};

export const clearLoggedOutMarker = () => {
  if (typeof window === 'undefined') return;

  window.sessionStorage.removeItem(LOGOUT_MARKER_KEY);
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
  window.localStorage.removeItem('myPosts');
};

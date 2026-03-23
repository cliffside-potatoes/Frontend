const TOKEN_KEYS = ['accessToken', 'token'];

export const getStoredAccessToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  for (const key of TOKEN_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value) {
      return value;
    }
  }

  return '';
};

export const hasStoredAccessToken = () => Boolean(getStoredAccessToken());
